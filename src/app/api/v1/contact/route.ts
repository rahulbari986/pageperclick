import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeInput } from "@/lib/security";
import { checkRateLimit } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { CircuitBreaker } from "@/lib/circuitBreaker";
import { supabase } from "@/lib/supabaseClient";

// Circuit breakers for external integrations
const recaptchaBreaker = new CircuitBreaker("GoogleReCAPTCHA", { failureThreshold: 3, recoveryTimeout: 20000 });
const supabaseBreaker = new CircuitBreaker("SupabaseFunctions", { failureThreshold: 3, recoveryTimeout: 20000 });

// 2.3 Strict Zod Validation Schema
const contactSubmissionSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .regex(/^[\p{L}\s.'-]+$/u, "Name contains invalid characters"),
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email is too long"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Phone number must be a valid 10-digit Indian mobile number"),
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
    .min(5, "Message must be at least 5 characters")
    .max(2000, "Message must not exceed 2000 characters"),
  recaptchaToken: z
    .string()
    .min(10, "Verification token is required"),
  utm_source: z.string().max(100).optional().nullable(),
  utm_medium: z.string().max(100).optional().nullable(),
  utm_campaign: z.string().max(100).optional().nullable(),
});

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

    // 5. Invoke Supabase Edge Function (Protected by Circuit Breaker)
    const { data: edgeData, error: edgeError } = await supabaseBreaker.execute(async () => {
      return supabase.functions.invoke("contact-email", {
        body: {
          contactData: {
            full_name: sanitizedFullName,
            email: sanitizedEmail,
            phone: formattedPhone,
            company_name: sanitizedCompany,
            service: sanitizedService,
            message: sanitizedMessage,
            utm_source: validData.utm_source ? sanitizeInput(validData.utm_source) : null,
            utm_medium: validData.utm_medium ? sanitizeInput(validData.utm_medium) : null,
            utm_campaign: validData.utm_campaign ? sanitizeInput(validData.utm_campaign) : null,
          },
          recaptchaToken: validData.recaptchaToken,
        },
      });
    });

    if (edgeError) {
      // Check for duplicate response
      if (typeof edgeError === "object" && edgeError !== null && "context" in edgeError) {
        const errorContext = (edgeError as { context?: { status?: number } }).context;
        if (errorContext?.status === 409) {
          return NextResponse.json({ status: "DUPLICATE" }, { status: 409 });
        }
      }
      throw edgeError;
    }

    // 6. Audit Log Mutation (Section 2.6)
    logger.audit(
      "CONTACT_FORM_SUBMITTED",
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
    // 7. Generic Error Masking & Exception Interception (Section 2.5)
    logger.error("CONTACT_API_INTERNAL_ERROR", error, {}, ip);

    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request. Please try again." },
      { status: 500 }
    );
  }
}
