import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  NotFoundError,
  toSafeErrorResponse,
} from '../../packages/utils/src/errors';

describe('Error Handling & Safe Response Formatting', () => {
  it('should instantiate AppError and subclasses correctly', () => {
    const valErr = new ValidationError('Invalid mobile number', { field: 'phoneNumber' });
    expect(valErr.statusCode).toBe(400);
    expect(valErr.code).toBe('VALIDATION_ERROR');
    expect(valErr.userMessage).toBe('Invalid mobile number');

    const notFoundErr = new NotFoundError('Lawyer');
    expect(notFoundErr.statusCode).toBe(404);
    expect(notFoundErr.code).toBe('NOT_FOUND');
    expect(notFoundErr.userMessage).toBe('Lawyer not found');
  });

  it('toSafeErrorResponse should return clean user message for AppError', () => {
    const error = new AppError({
      code: 'FORBIDDEN',
      statusCode: 403,
      userMessage: 'You are not authorized to access this document.',
      internalMessage: 'Firestore read rule rejected by security evaluator',
    });

    const safeResponse = toSafeErrorResponse(error);
    expect(safeResponse.success).toBe(false);
    expect(safeResponse.error?.code).toBe('FORBIDDEN');
    expect(safeResponse.error?.message).toBe('You are not authorized to access this document.');
  });

  it('toSafeErrorResponse should sanitize unexpected native errors without leaking stack traces', () => {
    const rawException = new Error('FATAL: Database connection timeout in firestore.internal.grpc');
    const safeResponse = toSafeErrorResponse(rawException);

    expect(safeResponse.success).toBe(false);
    expect(safeResponse.error?.code).toBe('INTERNAL_SERVER_ERROR');
    expect(safeResponse.error?.message).toBe('An unexpected error occurred. Please try again later.');
    expect(JSON.stringify(safeResponse)).not.toContain('firestore.internal.grpc');
  });
});
