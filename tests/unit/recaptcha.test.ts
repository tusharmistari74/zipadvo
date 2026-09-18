import { describe, it, expect } from 'vitest';
import { verifyRecaptchaEnterpriseToken } from '../../apps/web/src/lib/auth/recaptcha-server';

describe('Google reCAPTCHA Enterprise Assessment Verification', () => {
  it('should return error if token is missing', async () => {
    const result = await verifyRecaptchaEnterpriseToken({ token: '' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('token is required');
  });

  it('should successfully verify valid simulated test token', async () => {
    const result = await verifyRecaptchaEnterpriseToken({
      token: 'test_recaptcha_token_valid',
      expectedAction: 'LOGIN',
      minScore: 0.5,
    });

    expect(result.success).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0.5);
    expect(result.action).toBe('LOGIN');
  });
});
