import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeInput } from "@/lib/security";
import { checkRateLimit } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { CircuitBreaker } from "@/lib/circuitBreaker";
import { connectToDatabase } from "@/lib/mongodb";
import { Contact } from "@/models/Contact";
import { emitNewContact } from "@/lib/adminEventBus";

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

    // 6. Real-Time Email Notification via Resend (Section 2.6)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const sendTo = process.env.SEND_TO_EMAIL || "pageperclick@gmail.com";
        const sendFrom = process.env.SEND_FROM_EMAIL || "noreply@pageperclick.com";

        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: sendFrom,
            to: sendTo,
            subject: `🚀 New Lead: ${sanitizedFullName} - ${sanitizedService}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0f17; color: #f1f5f9; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; padding: 32px 28px;">
                <div style="border-bottom: 1px solid #1e293b; padding-bottom: 18px; margin-bottom: 22px;">
                  <h1 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.5px;">
                    🚀 New Client Enquiry Received
                  </h1>
                  <p style="font-size: 13px; color: #94a3b8; margin: 4px 0 0 0;">
                    PagePerClick Leads System
                  </p>
                </div>

                <div style="background-color: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                      <td style="padding: 7px 0; color: #94a3b8; width: 140px; font-weight: 600;">Sender Name:</td>
                      <td style="padding: 7px 0; color: #f8fafc; font-weight: 700;">${sanitizedFullName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 7px 0; color: #94a3b8; font-weight: 600;">Email Address:</td>
                      <td style="padding: 7px 0;"><a href="mailto:${sanitizedEmail}" style="color: #60a5fa; text-decoration: none; font-weight: 600;">${sanitizedEmail}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 7px 0; color: #94a3b8; font-weight: 600;">Phone Number:</td>
                      <td style="padding: 7px 0;"><a href="tel:${formattedPhone}" style="color: #60a5fa; text-decoration: none; font-weight: 600;">${formattedPhone}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 7px 0; color: #94a3b8; font-weight: 600;">Subject / Service:</td>
                      <td style="padding: 7px 0; color: #38bdf8; font-weight: 700;">${sanitizedService}</td>
                    </tr>
                    ${sanitizedCompany ? `<tr>
                      <td style="padding: 7px 0; color: #94a3b8; font-weight: 600;">Company:</td>
                      <td style="padding: 7px 0; color: #f8fafc;">${sanitizedCompany}</td>
                    </tr>` : ""}
                  </table>
                </div>

                <div style="margin-bottom: 22px;">
                  <p style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">
                    Message Content
                  </p>
                  <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 14px 16px; font-size: 14px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;">
                    ${sanitizedMessage}
                  </div>
                </div>

                <div style="border-top: 1px solid #1e293b; padding-top: 14px; font-size: 11px; color: #64748b;">
                  <p style="margin: 0;">
                    Source: <b>${validData.utm_source || "Direct"}</b> | Medium: <b>${validData.utm_medium || "None"}</b> | Campaign: <b>${validData.utm_campaign || "None"}</b>
                  </p>
                </div>
              </div>
            `,
          }),
        });

        const resendData = await resendRes.json().catch(() => ({}));
        if (!resendRes.ok) {
          logger.warn("RESEND_API_ERROR", { status: resendRes.status, details: resendData }, ip);
        } else {
          logger.info("RESEND_EMAIL_SENT", { emailId: resendData.id, to: sendTo }, ip);
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
