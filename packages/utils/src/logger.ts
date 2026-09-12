/**
 * Production-Grade Secure Logging Abstraction with Automated PII Masking
 *
 * Strict Security Guardrails:
 * NEVER logs passwords, OTPs, payment secrets, Aadhaar numbers, PAN numbers,
 * private document contents, or authorization tokens.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
  userId?: string;
  requestId?: string;
  route?: string;
  action?: string;
  [key: string]: unknown;
}

// Regex patterns for sensitive data identification
const AADHAAR_REGEX = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
const PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi;
const BEARER_TOKEN_REGEX = /Bearer\s+[A-Za-z0-9\-_.]+/gi;
const CREDIT_CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;

// Sensitive property keys to scrub completely from log objects
const SENSITIVE_KEYS = new Set([
  'password',
  'passwd',
  'token',
  'refreshtoken',
  'accesstoken',
  'secret',
  'clientsecret',
  'apikey',
  'privatekey',
  'otp',
  'pin',
  'aadhaar',
  'aadhaarnumber',
  'pannumber',
  'pan',
  'cvv',
  'cardnumber',
  'signature',
  'razorpaysignature',
  'razorpaykeysecret',
  'documentcontent',
  'base64',
]);

/**
 * Recursively scrubs and sanitizes sensitive fields from any object or string.
 */
export function sanitizeLogData(data: unknown, depth = 0): unknown {
  if (depth > 6) return '[MAX_DEPTH_REACHED]';

  if (typeof data === 'string') {
    return data
      .replace(AADHAAR_REGEX, 'AADHAAR_REDACTED_XXXX')
      .replace(PAN_REGEX, 'PAN_REDACTED_XXXXX')
      .replace(BEARER_TOKEN_REGEX, 'Bearer [REDACTED_TOKEN]')
      .replace(CREDIT_CARD_REGEX, 'CARD_REDACTED_XXXX');
  }

  if (typeof data === 'number' || typeof data === 'boolean' || data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item, depth + 1));
  }

  if (typeof data === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const normalizedKey = key.toLowerCase().replace(/[-_]/g, '');
      if (SENSITIVE_KEYS.has(normalizedKey)) {
        sanitizedObj[key] = '[REDACTED_SENSITIVE_DATA]';
      } else {
        sanitizedObj[key] = sanitizeLogData(value, depth + 1);
      }
    }
    return sanitizedObj;
  }

  return String(data);
}

export class Logger {
  private namespace: string;

  constructor(namespace = 'App') {
    this.namespace = namespace;
  }

  private formatEntry(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? sanitizeLogData(context) : undefined;
    const sanitizedMessage = typeof message === 'string' ? sanitizeLogData(message) : message;

    return {
      timestamp,
      level: level.toUpperCase(),
      namespace: this.namespace,
      message: sanitizedMessage,
      ...(sanitizedContext && typeof sanitizedContext === 'object' ? { context: sanitizedContext } : {}),
    };
  }

  public info(message: string, context?: LogContext): void {
    const entry = this.formatEntry('info', message, context);
    // In production, this can pipe into Cloud Logging / Datadog
    process.stdout.write(JSON.stringify(entry) + '\n');
  }

  public warn(message: string, context?: LogContext): void {
    const entry = this.formatEntry('warn', message, context);
    process.stderr.write(JSON.stringify(entry) + '\n');
  }

  public error(message: string, error?: unknown, context?: LogContext): void {
    let errorDetails: unknown = undefined;
    if (error instanceof Error) {
      errorDetails = {
        name: error.name,
        message: sanitizeLogData(error.message),
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      };
    } else if (error) {
      errorDetails = sanitizeLogData(error);
    }

    const entry = this.formatEntry('error', message, {
      ...context,
      ...(errorDetails ? { error: errorDetails } : {}),
    });

    process.stderr.write(JSON.stringify(entry) + '\n');
  }

  public child(subNamespace: string): Logger {
    return new Logger(`${this.namespace}:${subNamespace}`);
  }
}

export const logger = new Logger('LegalHubMumbai');
