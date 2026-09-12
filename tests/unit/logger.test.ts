import { describe, it, expect } from 'vitest';
import { sanitizeLogData } from '../../packages/utils/src/logger';

describe('Logger PII Redaction & Sanitization', () => {
  it('should redact Aadhaar numbers in strings', () => {
    const raw = 'Client Aadhaar is 5482 9102 3847 provided during KYC';
    const sanitized = sanitizeLogData(raw);
    expect(sanitized).toBe('Client Aadhaar is AADHAAR_REDACTED_XXXX provided during KYC');
  });

  it('should redact PAN numbers in strings', () => {
    const raw = 'Lawyer PAN card number is ABCDE1234F';
    const sanitized = sanitizeLogData(raw);
    expect(sanitized).toBe('Lawyer PAN card number is PAN_REDACTED_XXXXX');
  });

  it('should redact Bearer authorization tokens', () => {
    const raw = 'Header contains Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz';
    const sanitized = sanitizeLogData(raw);
    expect(sanitized).toBe('Header contains Bearer [REDACTED_TOKEN]');
  });

  it('should scrub sensitive keys in objects', () => {
    const payload = {
      userId: 'usr_123',
      password: 'SuperSecretPassword!23',
      otp: '984512',
      razorpayKeySecret: 'secret_key_abcdef',
      token: 'jwt.token.here',
      details: {
        pan: 'ABCDE1234F',
        pin: '1234',
        safeField: 'Public Law Practice',
      },
    };

    const sanitized = sanitizeLogData(payload) as Record<string, unknown>;
    expect(sanitized.password).toBe('[REDACTED_SENSITIVE_DATA]');
    expect(sanitized.otp).toBe('[REDACTED_SENSITIVE_DATA]');
    expect(sanitized.razorpayKeySecret).toBe('[REDACTED_SENSITIVE_DATA]');
    expect(sanitized.token).toBe('[REDACTED_SENSITIVE_DATA]');
    expect((sanitized.details as Record<string, unknown>).pan).toBe('[REDACTED_SENSITIVE_DATA]');
    expect((sanitized.details as Record<string, unknown>).pin).toBe('[REDACTED_SENSITIVE_DATA]');
    expect((sanitized.details as Record<string, unknown>).safeField).toBe('Public Law Practice');
  });
});
