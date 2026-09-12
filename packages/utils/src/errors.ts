import { ApiResponse } from '@legalhub/types';

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PAYMENT_REQUIRED'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE';

export interface AppErrorOptions {
  code: ErrorCode;
  statusCode: number;
  userMessage: string;
  internalMessage?: string;
  details?: unknown;
  cause?: unknown;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly userMessage: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(options: AppErrorOptions) {
    super(options.internalMessage || options.userMessage);
    this.name = 'AppError';
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.userMessage = options.userMessage;
    this.details = options.details;
    this.isOperational = true;

    if (options.cause) {
      this.cause = options.cause;
    }

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(userMessage: string, details?: unknown) {
    super({
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      userMessage,
      details,
    });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(userMessage = 'Authentication required to access this resource') {
    super({
      code: 'UNAUTHENTICATED',
      statusCode: 401,
      userMessage,
    });
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(userMessage = 'You do not have permission to perform this action') {
    super({
      code: 'FORBIDDEN',
      statusCode: 403,
      userMessage,
    });
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resourceName = 'Resource') {
    super({
      code: 'NOT_FOUND',
      statusCode: 404,
      userMessage: `${resourceName} not found`,
    });
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(userMessage: string) {
    super({
      code: 'CONFLICT',
      statusCode: 409,
      userMessage,
    });
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(userMessage = 'Too many requests. Please try again later.') {
    super({
      code: 'RATE_LIMITED',
      statusCode: 429,
      userMessage,
    });
    this.name = 'RateLimitError';
  }
}

/**
 * Transforms any unknown error into a secure, user-safe API response.
 * Completely strips stack traces, DB internals, and Firebase errors for end users.
 */
export function toSafeErrorResponse(error: unknown): ApiResponse<never> {
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.userMessage,
        details: error.details,
      },
      timestamp,
    };
  }

  // Fallback for unhandled internal exceptions
  return {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    },
    timestamp,
  };
}
