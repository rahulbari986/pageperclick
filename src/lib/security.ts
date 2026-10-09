/**
 * Enterprise Security Utility Library
 * Conforms to SECURITY_RULES.md (Sections 2.3, 2.4, 2.6)
 */

/**
 * 2.1 Role-Based Access Control (RBAC)
 * Strictly enforces administrative access validation
 */
export type UserRole = "SuperAdmin" | "Reviewer" | "Auditor" | "User";

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SuperAdmin: ["*"],
  Reviewer: ["registrations:read", "registrations:approve", "registrations:reject"],
  Auditor: ["audit:read", "registrations:read", "logs:read"],
  User: ["registrations:submit", "registrations:read_self"],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  if (permissions.includes("*")) return true;
  return permissions.includes(permission);
}

export function validateRole(userRole: string | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as UserRole);
}

/**
 * 2.3 Strict Input Sanitization (XSS & HTML Injection Prevention)
 * Escapes characters that could be interpreted as executable HTML or script tags.
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return input.trim().replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Sanitizes an object of string key-values recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeInput(value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * 2.4 Magic Bytes / File Signature Validation
 * Strictly authenticates binary signatures, rejecting spoofed file extensions.
 */
export const MAGIC_BYTES: Record<string, number[][]> = {
  // JPEG / JPG
  jpeg: [[0xff, 0xd8, 0xff]],
  jpg: [[0xff, 0xd8, 0xff]],
  // PNG
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  // WebP
  webp: [
    // RIFF .... WEBP
    [0x52, 0x49, 0x46, 0x46],
  ],
  // PDF
  pdf: [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

export function validateMagicBytes(buffer: Uint8Array, allowedTypes: string[]): boolean {
  for (const type of allowedTypes) {
    const signatures = MAGIC_BYTES[type.toLowerCase()];
    if (!signatures) continue;

    for (const signature of signatures) {
      if (buffer.length < signature.length) continue;

      let match = true;
      for (let i = 0; i < signature.length; i++) {
        if (buffer[i] !== signature[i]) {
          match = false;
          break;
        }
      }

      if (match) {
        // Special check for WebP: byte 8-11 must be 'WEBP' (0x57, 0x45, 0x42, 0x50)
        if (type.toLowerCase() === "webp" && buffer.length >= 12) {
          const webpHeader = [0x57, 0x45, 0x42, 0x50];
          const isWebp = webpHeader.every((b, idx) => buffer[8 + idx] === b);
          if (!isWebp) return false;
        }
        return true;
      }
    }
  }

  return false;
}

/**
 * 2.6 Credential & Sensitive Token Scrubbing
 * Masks sensitive values in audit logs and telemetry data.
 */
const SENSITIVE_KEYS = [
  "password",
  "secret",
  "token",
  "apikey",
  "api_key",
  "authorization",
  "service_role_key",
  "recaptchatoken",
  "bearer",
];

export function scrubSensitiveData<T>(data: T): T {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => scrubSensitiveData(item)) as unknown as T;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive));

    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (value && typeof value === "object") {
      sanitized[key] = scrubSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
