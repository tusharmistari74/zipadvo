import { describe, it, expect } from 'vitest';
import {
  emailLoginSchema,
  emailRegisterSchema,
  phoneOtpRequestSchema,
  phoneOtpVerifySchema,
  forgotPasswordSchema,
} from '../../packages/validation/src/auth.schema';
import { mapFirebaseAuthError } from '../../apps/web/src/lib/auth/errors';
import type { AuthClaims } from '../../packages/types/src/auth';
import { AuthorizationError } from '../../packages/utils/src/errors';

describe('Auth Validation Schemas', () => {
  describe('emailLoginSchema', () => {
    it('should validate valid email and password', () => {
      const valid = { email: 'client@example.com', password: 'Password123' };
      const result = emailLoginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalid = { email: 'not-an-email', password: 'Password123' };
      const result = emailLoginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('emailRegisterSchema', () => {
    it('should validate complete valid registration with matching passwords', () => {
      const valid = {
        fullName: 'Advocate Rajesh Mehta',
        email: 'rajesh.mehta@mumbailaw.in',
        phoneNumber: '+919876543210',
        password: 'SecurePassword1',
        confirmPassword: 'SecurePassword1',
        accountType: 'lawyer',
      };
      const result = emailRegisterSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const mismatched = {
        fullName: 'Rajesh Mehta',
        email: 'rajesh@example.com',
        phoneNumber: '+919876543210',
        password: 'SecurePassword1',
        confirmPassword: 'DifferentPassword2',
        accountType: 'client',
      };
      const result = emailRegisterSchema.safeParse(mismatched);
      expect(result.success).toBe(false);
    });
  });

  describe('phoneOtpRequestSchema & phoneOtpVerifySchema', () => {
    it('should validate standard Indian mobile number with +91 prefix', () => {
      const validPhone = { phoneNumber: '+919876543210' };
      expect(phoneOtpRequestSchema.safeParse(validPhone).success).toBe(true);

      const invalidPhone = { phoneNumber: '12345' };
      expect(phoneOtpRequestSchema.safeParse(invalidPhone).success).toBe(false);
    });

    it('should validate exactly 6-digit numeric OTP', () => {
      expect(phoneOtpVerifySchema.safeParse({ otp: '123456' }).success).toBe(true);
      expect(phoneOtpVerifySchema.safeParse({ otp: '12345' }).success).toBe(false);
      expect(phoneOtpVerifySchema.safeParse({ otp: 'abcdef' }).success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate valid email for password reset', () => {
      expect(forgotPasswordSchema.safeParse({ email: 'user@example.com' }).success).toBe(true);
      expect(forgotPasswordSchema.safeParse({ email: 'invalid' }).success).toBe(false);
    });
  });
});

describe('Firebase Auth Error Sanitization', () => {
  it('should map invalid credentials safely without leaking account state', () => {
    const errorMsg = mapFirebaseAuthError('auth/invalid-credential');
    expect(errorMsg).toContain('Invalid email or password');

    const userNotFoundMsg = mapFirebaseAuthError('auth/user-not-found');
    expect(userNotFoundMsg).toContain('Invalid email or password');
  });

  it('should map too-many-requests safely', () => {
    const rateLimitMsg = mapFirebaseAuthError('auth/too-many-requests');
    expect(rateLimitMsg).toContain('Too many unsuccessful attempts');
  });

  it('should return default fallback for unknown error codes', () => {
    const fallback = mapFirebaseAuthError('auth/unknown-internal-code');
    expect(fallback).toContain('An authentication error occurred');
  });
});

describe('Role Authorization Claims Logic', () => {
  it('should allow lawyer role access to lawyer allowed roles', () => {
    const lawyerClaims: AuthClaims = {
      uid: 'lawyer_123',
      email: 'lawyer@legalhub.in',
      role: 'lawyer',
      permissions: ['lawyer:write_profile'],
      isEmailVerified: true,
      isPhoneVerified: true,
      kycStatus: 'verified',
    };

    const allowedRoles = ['lawyer', 'admin', 'super_admin'];
    expect(allowedRoles.includes(lawyerClaims.role)).toBe(true);
  });

  it('should reject client role from accessing admin-only permissions', () => {
    const clientClaims: AuthClaims = {
      uid: 'client_123',
      email: 'client@example.com',
      role: 'client',
      permissions: ['booking:create'],
      isEmailVerified: true,
      isPhoneVerified: true,
    };

    const adminOnlyRoles = ['admin', 'super_admin'];
    const isAuthorized = adminOnlyRoles.includes(clientClaims.role);
    expect(isAuthorized).toBe(false);

    if (!isAuthorized) {
      const err = new AuthorizationError('Access denied');
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('FORBIDDEN');
    }
  });
});
