import { NextRequest } from "next/server";
import crypto from "node:crypto";

/**
 * Enterprise Admin Authentication & Token Verification
 * Supports IP device tracking & auto-lockout (12hrs rememberMe, 1hr standard)
 * Conforms to SECURITY_RULES.md (Sections 2.1, 2.2, 2.6)
 */

function getSecretKey(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    (process.env.MONGODB_URI
      ? crypto.createHash("sha256").update(process.env.MONGODB_URI).digest("hex")
      : "ppc-enterprise-admin-session-secret-2026")
  );
}

const COOKIE_NAME = "ppc_admin_session";

export interface TokenPayload {
  u: string;        // username
  ip: string;       // device IP tracked at login
  iat: number;      // issued at timestamp
  exp: number;      // expiration timestamp
  rem: boolean;     // remember me flag (true = 12h, false = 1h)
}

/**
 * Creates an HMAC-SHA256 signed admin session token cryptographically bound to the device IP.
 * - rememberMe = true  => 12 hours active TTL
 * - rememberMe = false => 1 hour active TTL (auto-lockout)
 */
export function createAdminToken(
  username: string,
  ip: string = "127.0.0.1",
  rememberMe: boolean = false
): { token: string; expiresAt: number; ttlMs: number; sessionDurationHours: number } {
  const sessionDurationHours = rememberMe ? 12 : 1;
  const ttlMs = sessionDurationHours * 60 * 60 * 1000;
  const iat = Date.now();
  const exp = iat + ttlMs;

  const payload: TokenPayload = {
    u: username,
    ip,
    iat,
    exp,
    rem: rememberMe,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(payloadB64)
    .digest("base64url");

  return {
    token: `${payloadB64}.${signature}`,
    expiresAt: exp,
    ttlMs,
    sessionDurationHours,
  };
}

/**
 * Normalizes loopback addresses so localhost IPv6 (::1) matches IPv4 (127.0.0.1)
 */
function normalizeIp(ip: string): string {
  if (ip === "::1" || ip === "::ffff:127.0.0.1") return "127.0.0.1";
  return ip.toLowerCase();
}

/**
 * Verifies the admin token HMAC signature, expiration time, and device IP binding.
 */
export function verifyAdminToken(
  token: string | null | undefined,
  currentIp?: string
): {
  valid: boolean;
  username?: string;
  ip?: string;
  expiresAt?: number;
  rememberMe?: boolean;
  error?: string;
} {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing authentication token" };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Malformed token" };
  }

  const [payloadB64, signature] = parts;

  // Verify HMAC signature with timing-safe comparison
  const expectedSignature = crypto
    .createHmac("sha256", getSecretKey())
    .update(payloadB64)
    .digest("base64url");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return { valid: false, error: "Invalid signature" };
  }

  // Parse payload and verify expiration
  try {
    const payload: TokenPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );

    // Check expiration (1hr or 12hr)
    if (Date.now() > payload.exp) {
      return {
        valid: false,
        error: `Session expired (${payload.rem ? "12hr" : "1hr"} limit reached). Admin locked automatically.`,
      };
    }

    // Check device IP binding if provided
    if (currentIp && payload.ip) {
      const normCurrent = normalizeIp(currentIp);
      const normToken = normalizeIp(payload.ip);
      // Validate IP if neither is loopback/local
      if (normCurrent !== normToken && normCurrent !== "127.0.0.1" && normToken !== "127.0.0.1") {
        return {
          valid: false,
          error: "Device IP mismatch. Admin locked automatically for security.",
        };
      }
    }

    return {
      valid: true,
      username: payload.u,
      ip: payload.ip,
      expiresAt: payload.exp,
      rememberMe: payload.rem,
    };
  } catch {
    return { valid: false, error: "Invalid token payload" };
  }
}

/**
 * Helper to extract client IP from NextRequest
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  return forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";
}

export function verifyAdminRequest(req: NextRequest): {
  authenticated: boolean;
  username?: string;
  ip?: string;
  expiresAt?: number;
  rememberMe?: boolean;
  error?: string;
} {
  const clientIp = getClientIp(req);

  // 1. Check HttpOnly cookie
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken) {
    const res = verifyAdminToken(cookieToken, clientIp);
    if (res.valid) {
      return {
        authenticated: true,
        username: res.username,
        ip: res.ip,
        expiresAt: res.expiresAt,
        rememberMe: res.rememberMe,
      };
    }
  }

  // 2. Check Authorization Bearer header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    const res = verifyAdminToken(bearerToken, clientIp);
    if (res.valid) {
      return {
        authenticated: true,
        username: res.username,
        ip: res.ip,
        expiresAt: res.expiresAt,
        rememberMe: res.rememberMe,
      };
    }
  }

  // 3. Check X-Admin-Token custom header
  const customHeaderToken = req.headers.get("x-admin-token");
  if (customHeaderToken) {
    const res = verifyAdminToken(customHeaderToken, clientIp);
    if (res.valid) {
      return {
        authenticated: true,
        username: res.username,
        ip: res.ip,
        expiresAt: res.expiresAt,
        rememberMe: res.rememberMe,
      };
    }
  }

  return { authenticated: false, error: "Unauthorized" };
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_CREDENTIALS = {
  get USERNAME() {
    return process.env.ADMIN_USERNAME || "pageperclick";
  },
  get PASSWORD() {
    return process.env.ADMIN_PASSWORD || "1998";
  },
};
