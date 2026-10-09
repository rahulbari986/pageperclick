/**
 * Circuit Breaker Pattern Implementation
 * Conforms to SECURITY_RULES.md (Section 5.2: Fault Tolerance & Resilience)
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Number of failures to trigger OPEN state
  recoveryTimeout?: number; // Time in ms before attempting HALF_OPEN state
  timeout?: number; // Request execution timeout in ms
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly failureThreshold: number;
  private readonly recoveryTimeout: number;
  private readonly timeout: number;

  constructor(private readonly serviceName: string, options?: CircuitBreakerOptions) {
    this.failureThreshold = options?.failureThreshold ?? 5;
    this.recoveryTimeout = options?.recoveryTimeout ?? 30000; // 30s
    this.timeout = options?.timeout ?? 10000; // 10s
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    const now = Date.now();

    if (this.state === "OPEN") {
      if (now - this.lastFailureTime > this.recoveryTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error(
          `Circuit for ${this.serviceName} is OPEN. Request rejected to prevent cascading failure.`
        );
      }
    }

    try {
      // Execute with timeout
      const result = await Promise.race([
        action(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout exceeding ${this.timeout}ms`)), this.timeout)
        ),
      ]);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold || this.state === "HALF_OPEN") {
      this.state = "OPEN";
      console.warn(`[CIRCUIT_BREAKER] Circuit ${this.serviceName} has TRIPPED to OPEN state.`);
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
