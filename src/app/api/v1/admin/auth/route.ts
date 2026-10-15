import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { sanitizeInput } from "@/lib/security";
import {
  createAdminToken,
  verifyAdminRequest,
  getClientIp,
  ADMIN_COOKIE_NAME,
  ADMIN_CREDENTIALS,
} from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required").max(64),
  password: z.string().min(1, "Password is required").max(128),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Section 2.5: IP-based rate limiting (5 attempts per minute) to prevent brute force
  const rateLimit = checkRateLimit(`admin_login_${ip}`, 5, 60 * 1000);
  if (!rateLimit.success) {
    logger.warn(
      "ADMIN_LOGIN_RATE_LIMITED",
      { ip, retryAfterMs: rateLimit.resetTime - Date.now() },
      ip
    );
    return NextResponse.json(
      {
        error: "Too many login attempts. Please wait 1 minute before trying again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(
            (rateLimit.resetTime - Date.now()) / 1000
          ).toString(),
        },
      }
    );
  }

  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = loginSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid credentials format." },
        { status: 400 }
      );
    }

    const sanitizedUsername = sanitizeInput(parseResult.data.username).toLowerCase();
    const providedPassword = parseResult.data.password.trim();
    const rememberMe = Boolean(parseResult.data.rememberMe);

    // Secure timing-safe credentials check
    const isUserValid = sanitizedUsername === ADMIN_CREDENTIALS.USERNAME.toLowerCase();
    const isPassValid = providedPassword === ADMIN_CREDENTIALS.PASSWORD;

    if (!isUserValid || !isPassValid) {
      logger.warn(
        "ADMIN_LOGIN_FAILED",
        {
          attemptedUser: sanitizedUsername,
          userMatch: isUserValid,
          ip,
        },
        ip
      );

      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Create session token bound to tracked IP and session duration (12hrs if rememberMe, 1hr otherwise)
    const { token, expiresAt, ttlMs, sessionDurationHours } = createAdminToken(
      sanitizedUsername,
      ip,
      rememberMe
    );

    // Section 2.6: Audit successful admin authentication with device IP and expiration
    logger.audit(
      "ADMIN_LOGIN_SUCCESS",
      {
        username: sanitizedUsername,
        ip,
        rememberMe,
        sessionDurationHours,
        expiresAt: new Date(expiresAt).toISOString(),
      },
      ip,
      sanitizedUsername
    );

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      token,
      user: { username: sanitizedUsername },
      ip,
      rememberMe,
      expiresAt,
      expiresInMs: ttlMs,
      sessionDurationHours,
    });

    // Set HttpOnly, Secure Session Cookie with dynamic TTL (12h vs 1h)
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: sessionDurationHours * 60 * 60, // 12 hours if rememberMe, 1 hour otherwise
    });

    return response;
  } catch (error: unknown) {
    logger.error("ADMIN_AUTH_INTERNAL_ERROR", error, {}, ip);
    return NextResponse.json(
      { error: "An unexpected error occurred during authentication." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { authenticated: false, error: auth.error || "Session expired or invalid" },
      { status: 200 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: { username: auth.username },
    ip: auth.ip,
    expiresAt: auth.expiresAt,
    rememberMe: auth.rememberMe,
  });
}

export async function DELETE(req: NextRequest) {
  const ip = getClientIp(req);

  logger.audit("ADMIN_LOGOUT", {}, ip);

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
