import { describe, it, expect } from 'vitest';
import { validateClientEnv, clientEnvSchema } from '../../packages/config/src/env';

describe('Environment Configuration Validation', () => {
  it('should parse valid client configuration', () => {
    const validClientEnv = {
      NODE_ENV: 'development',
      NEXT_PUBLIC_APP_ENV: 'development',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-proj',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '12345678',
      NEXT_PUBLIC_FIREBASE_APP_ID: '1:12345678:web:abc',
      NEXT_PUBLIC_RAZORPAY_KEY_ID: 'rzp_test_key',
    };

    const parsed = validateClientEnv(validClientEnv);
    expect(parsed.NEXT_PUBLIC_FIREBASE_PROJECT_ID).toBe('test-proj');
    expect(parsed.NEXT_PUBLIC_CONSULTATION_UNLOCK_FEE_INR).toBe(299);
  });

  it('should reject client configuration missing required keys', () => {
    const missingKeysEnv = {
      NODE_ENV: 'development',
    };

    const result = clientEnvSchema.safeParse(missingKeysEnv);
    expect(result.success).toBe(false);
  });
});
