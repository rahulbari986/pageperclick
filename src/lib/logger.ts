import { scrubSensitiveData } from "./security";

/**
 * Enterprise Audit & Security Logger
 * Conforms to SECURITY_RULES.md (Section 2.6)
 */
export type LogLevel = "info" | "warn" | "error" | "audit";

interface LogPayload {
  action: string;
  userId?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
  error?: unknown;
}

class SecurityLogger {
  private formatLog(level: LogLevel, payload: LogPayload) {
    const timestamp = new Date().toISOString();
    const scrubbedMetadata = payload.metadata ? scrubSensitiveData(payload.metadata) : undefined;
    const errorMessage =
      payload.error instanceof Error
        ? payload.error.message
        : typeof payload.error === "string"
        ? payload.error
        : undefined;

    return {
      timestamp,
      level,
      action: payload.action,
      ip: payload.ip || "unknown",
      userId: payload.userId || "anonymous",
      metadata: scrubbedMetadata,
      ...(errorMessage ? { error: errorMessage } : {}),
    };
  }

  info(action: string, metadata?: Record<string, unknown>, ip?: string) {
    const entry = this.formatLog("info", { action, metadata, ip });
    console.info(`[SECURITY_INFO] ${JSON.stringify(entry)}`);
  }

  warn(action: string, metadata?: Record<string, unknown>, ip?: string) {
    const entry = this.formatLog("warn", { action, metadata, ip });
    console.warn(`[SECURITY_WARN] ${JSON.stringify(entry)}`);
  }

  error(action: string, error: unknown, metadata?: Record<string, unknown>, ip?: string) {
    const entry = this.formatLog("error", { action, error, metadata, ip });
    console.error(`[SECURITY_ERROR] ${JSON.stringify(entry)}`);
  }

  audit(action: string, metadata?: Record<string, unknown>, ip?: string, userId?: string) {
    const entry = this.formatLog("audit", { action, metadata, ip, userId });
    console.log(`[AUDIT_TRAIL] ${JSON.stringify(entry)}`);
  }
}

export const logger = new SecurityLogger();
