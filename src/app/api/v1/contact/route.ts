import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeInput } from "@/lib/security";
import { checkRateLimit } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { CircuitBreaker } from "@/lib/circuitBreaker";
import { connectToDatabase } from "@/lib/mongodb";
import { Contact } from "@/models/Contact";
import { emitNewContact } from "@/lib/adminEventBus";
import React from "react";
import fs from "fs";
import path from "path";
import { render } from "@react-email/render";
import PagePerClickEmail from "@/emails/PagePerClickEmail";
import PagePerClickAdminEmail from "@/emails/PagePerClickAdminEmail";

// Circuit breakers for external integrations
const recaptchaBreaker = new CircuitBreaker("GoogleReCAPTCHA", { failureThreshold: 3, recoveryTimeout: 20000 });
const mongoBreaker = new CircuitBreaker("MongoDBAtlas", { failureThreshold: 3, recoveryTimeout: 20000 });

// 2.3 Strict Zod Validation Schema
const contactSubmissionSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must not exceed 100 characters"),
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email is too long"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be a 10-digit mobile number"),
  company: z
    .string()
    .max(100, "Company name must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  service: z
    .string()
    .min(1, "Please select a service")
    .max(100, "Service selection is invalid"),
  message: z
    .string()
    .min(1, "Please enter a message")
    .max(2000, "Message must not exceed 2000 characters"),
  recaptchaToken: z
    .string()
    .min(1, "Verification token is required"),
  utm_source: z.string().max(100).optional().nullable(),
  utm_medium: z.string().max(100).optional().nullable(),
  utm_campaign: z.string().max(100).optional().nullable(),
});

interface DuplicateError extends Error {
  status?: number;
}

export async function POST(req: NextRequest) {
  // 1. IP-based Rate Limiting (Section 2.5)
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  const rateCheck = checkRateLimit(ip, 5, 60 * 1000); // 5 submissions / min
  if (!rateCheck.success) {
    logger.warn("RATE_LIMIT_EXCEEDED", { ip }, ip);
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateCheck.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const rawBody = await req.json();

    // 2. Strict Input Validation (Section 2.3)
    const validationResult = contactSubmissionSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      logger.warn("VALIDATION_FAILURE", { errors: fieldErrors }, ip);
      return NextResponse.json(
        { error: "Invalid submission data.", details: fieldErrors },
        { status: 400 }
      );
    }

    const validData = validationResult.data;

    // 3. Input Sanitization (XSS Prevention - Section 2.3)
    const sanitizedFullName = sanitizeInput(validData.fullName);
    const sanitizedEmail = sanitizeInput(validData.email);
    const sanitizedCompany = sanitizeInput(validData.company || "");
    const sanitizedService = sanitizeInput(validData.service);
    const sanitizedMessage = sanitizeInput(validData.message);
    const formattedPhone = `+91${validData.phone}`;

    // 4. Verification with Google reCAPTCHA (Protected by Circuit Breaker)
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY || "6Lcui-8rAAAAAL6YXV_ck1S65MqmRzx2pzRv9M9p";
    const verificationData = await recaptchaBreaker.execute(async () => {
      const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${recaptchaSecret}&response=${validData.recaptchaToken}`,
      });
      return verifyRes.json();
    });

    if (!verificationData.success) {
      logger.warn("RECAPTCHA_FAILED", { score: verificationData.score }, ip);
      return NextResponse.json(
        { error: "Security verification failed. Please refresh and try again." },
        { status: 403 }
      );
    }

    // 5. Connect to MongoDB Atlas & Persist Lead (Protected by Circuit Breaker)
    try {
      const createdContact = await mongoBreaker.execute(async () => {
        await connectToDatabase();

        // Check for duplicate entries
        const existing = await Contact.findOne({
          $or: [
            { email: sanitizedEmail.toLowerCase() },
            { phone: formattedPhone },
          ],
        }).lean();

        if (existing) {
          const dupErr: DuplicateError = new Error("A contact with this email or phone already exists.");
          dupErr.status = 409;
          throw dupErr;
        }

        return await Contact.create({
          fullName: sanitizedFullName,
          email: sanitizedEmail.toLowerCase(),
          phone: formattedPhone,
          company: sanitizedCompany,
          service: sanitizedService,
          message: sanitizedMessage,
          utm_source: validData.utm_source ? sanitizeInput(validData.utm_source) : null,
          utm_medium: validData.utm_medium ? sanitizeInput(validData.utm_medium) : null,
          utm_campaign: validData.utm_campaign ? sanitizeInput(validData.utm_campaign) : null,
          ipAddress: ip,
        });
      });

      if (createdContact) {
        const doc = (createdContact as unknown as { toObject?: () => Record<string, unknown> }).toObject
          ? (createdContact as unknown as { toObject: () => Record<string, unknown> }).toObject()
          : (createdContact as unknown as Record<string, unknown>);
        emitNewContact(doc);
      }
    } catch (dbError: unknown) {
      if (typeof dbError === "object" && dbError !== null && "status" in dbError && (dbError as DuplicateError).status === 409) {
        return NextResponse.json(
          { status: "DUPLICATE", error: "A contact with this email or phone already exists." },
          { status: 409 }
        );
      }
      throw dbError;
    }

    // 6. Dual Email Notification via Resend (To Admin & To User)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const adminEmail = process.env.SEND_TO_EMAIL || "contact@pageperclick.com";
        const sendFrom = process.env.SEND_FROM_EMAIL || "noreply@pageperclick.com";

        // Read header banners & social icons for inline CID delivery
        let clientHeaderBase64 = "";
        let adminHeaderBase64 = "";
        const socialBase64: Record<string, string> = {};
        try {
          const clientHeaderPath = path.join(process.cwd(), "public", "images", "email-header-client.png");
          if (fs.existsSync(clientHeaderPath)) {
            clientHeaderBase64 = fs.readFileSync(clientHeaderPath).toString("base64");
          }
          const adminHeaderPath = path.join(process.cwd(), "public", "images", "email-header-admin.png");
          if (fs.existsSync(adminHeaderPath)) {
            adminHeaderBase64 = fs.readFileSync(adminHeaderPath).toString("base64");
          }
          const socialDir = path.join(process.cwd(), "public", "images", "social");
          const socialKeys = ["facebook", "instagram", "youtube", "linkedin", "x"] as const;
          for (const key of socialKeys) {
            const p = path.join(socialDir, `${key}.png`);
            if (fs.existsSync(p)) {
              socialBase64[key] = fs.readFileSync(p).toString("base64");
            }
          }
        } catch {
          // Fall back gracefully to remote URLs if file read fails
        }

        const socialIconUrls: Record<string, string> = {};
        if (socialBase64.facebook) socialIconUrls.facebook = "cid:social-facebook";
        if (socialBase64.instagram) socialIconUrls.instagram = "cid:social-instagram";
        if (socialBase64.youtube) socialIconUrls.youtube = "cid:social-youtube";
        if (socialBase64.linkedin) socialIconUrls.linkedin = "cid:social-linkedin";
        if (socialBase64.x) socialIconUrls.x = "cid:social-x";

        const formattedTimestamp = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
          dateStyle: "medium",
          timeStyle: "short",
        }) + " IST";

        // Admin notification email rendered with PagePerClick branded React Email template
        const adminEmailHtml = await render(
          React.createElement(PagePerClickAdminEmail, {
            name: sanitizedFullName,
            email: sanitizedEmail,
            phone: formattedPhone,
            service: sanitizedService,
            company: sanitizedCompany,
            message: sanitizedMessage,
            utmSource: validData.utm_source || "Direct",
            utmMedium: validData.utm_medium || "None",
            utmCampaign: validData.utm_campaign || "None",
            ipAddress: ip,
            submittedAt: formattedTimestamp,
            website: "https://www.pageperclick.com",
            headerImageUrl: adminHeaderBase64 ? "cid:admin-header-banner" : undefined,
          })
        );

        const adminEmailPayload: Record<string, unknown> = {
          from: sendFrom,
          to: adminEmail,
          reply_to: sanitizedEmail,
          subject: `🚀 New Lead: ${sanitizedFullName} - ${sanitizedService}`,
          html: adminEmailHtml,
        };

        if (adminHeaderBase64) {
          adminEmailPayload.attachments = [
            {
              filename: "email-header-admin.png",
              content: adminHeaderBase64,
              content_type: "image/png",
              content_id: "admin-header-banner",
              contentId: "admin-header-banner",
            },
          ];
        }

        const adminEmailPromise = fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify(adminEmailPayload),
        });

        // User confirmation email rendered with PagePerClick branded React Email template
        const userEmailHtml = await render(
          React.createElement(PagePerClickEmail, {
            name: sanitizedFullName,
            email: sanitizedEmail,
            phone: formattedPhone,
            service: sanitizedService,
            company: sanitizedCompany,
            message: sanitizedMessage,
            contactEmail: adminEmail,
            website: "https://www.pageperclick.com",
            headerImageUrl: clientHeaderBase64 ? "cid:client-header-banner" : undefined,
            socialIconUrls: Object.keys(socialIconUrls).length > 0 ? socialIconUrls : undefined,
          })
        );

        const userEmailAttachments: Array<{
          filename: string;
          content: string;
          content_type: string;
          content_id: string;
          contentId: string;
        }> = [];

        if (clientHeaderBase64) {
          userEmailAttachments.push({
            filename: "email-header-client.png",
            content: clientHeaderBase64,
            content_type: "image/png",
            content_id: "client-header-banner",
            contentId: "client-header-banner",
          });
        }

        const socialAttachmentDefs = [
          { key: "facebook", cid: "social-facebook", filename: "facebook.png" },
          { key: "instagram", cid: "social-instagram", filename: "instagram.png" },
          { key: "youtube", cid: "social-youtube", filename: "youtube.png" },
          { key: "linkedin", cid: "social-linkedin", filename: "linkedin.png" },
          { key: "x", cid: "social-x", filename: "x.png" },
        ] as const;

        for (const item of socialAttachmentDefs) {
          if (socialBase64[item.key]) {
            userEmailAttachments.push({
              filename: item.filename,
              content: socialBase64[item.key],
              content_type: "image/png",
              content_id: item.cid,
              contentId: item.cid,
            });
          }
        }

        const userEmailPayload: Record<string, unknown> = {
          from: sendFrom,
          to: sanitizedEmail,
          reply_to: adminEmail,
          subject: `Thank you for contacting PagePerClick, ${sanitizedFullName}!`,
          html: userEmailHtml,
        };

        if (userEmailAttachments.length > 0) {
          userEmailPayload.attachments = userEmailAttachments;
        }

        const userEmailPromise = fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify(userEmailPayload),
        });

        const [adminResult, userResult] = await Promise.allSettled([
          adminEmailPromise,
          userEmailPromise,
        ]);

        if (adminResult.status === "rejected") {
          logger.warn("ADMIN_EMAIL_DISPATCH_FAILED", { error: String(adminResult.reason) }, ip);
        }
        if (userResult.status === "rejected") {
          logger.warn("USER_EMAIL_DISPATCH_FAILED", { error: String(userResult.reason) }, ip);
        }
      } catch (emailErr) {
        logger.warn("EMAIL_NOTIFICATION_FAILED", { error: String(emailErr) }, ip);
      }
    }

    // 7. Audit Log Mutation (Section 2.6)
    logger.audit(
      "CONTACT_FORM_SUBMITTED_MONGODB",
      {
        email: sanitizedEmail,
        phone: formattedPhone,
        service: sanitizedService,
      },
      ip
    );

    return NextResponse.json(
      { success: true, message: "Thank you! Your inquiry has been safely received." },
      { status: 200 }
    );
  } catch (error: unknown) {
    // 8. Generic Error Masking & Exception Interception (Section 2.5)
    logger.error("CONTACT_API_INTERNAL_ERROR", error, {}, ip);

    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request. Please try again." },
      { status: 500 }
    );
  }
}
