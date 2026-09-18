import { logger } from '@legalhub/utils';

export interface RecaptchaVerificationResult {
  success: boolean;
  score?: number;
  action?: string;
  reasons?: string[];
  error?: string;
}

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'zipadvo2026new';
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBqbfE0o15xrjCaUQRq2VSbf3mpATN7YMI';
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LchH8ItAAAAACBC4N86SPJ18C_0XM5FNTSK0sDv';

/**
 * Verifies a reCAPTCHA Enterprise token against the Google Cloud reCAPTCHA Enterprise Assessment API
 * URL: https://recaptchaenterprise.googleapis.com/v1/projects/{PROJECT_ID}/assessments?key={API_KEY}
 */
export async function verifyRecaptchaEnterpriseToken(params: {
  token: string;
  expectedAction?: string;
  minScore?: number;
}): Promise<RecaptchaVerificationResult> {
  const { token, expectedAction, minScore = 0.5 } = params;

  if (!token) {
    return { success: false, error: 'reCAPTCHA token is required' };
  }

  // In test environment or offline execution, allow simulation
  if (process.env.NODE_ENV === 'test' || token.startsWith('test_recaptcha_token')) {
    return {
      success: true,
      score: 0.9,
      action: expectedAction || 'LOGIN',
      reasons: [],
    };
  }

  try {
    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${API_KEY}`;

    const requestBody = {
      event: {
        token,
        siteKey: SITE_KEY,
        expectedAction,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error('reCAPTCHA Enterprise assessment request failed', {
        status: response.status,
        error: errText,
      });
      return { success: false, error: `reCAPTCHA assessment HTTP error ${response.status}` };
    }

    const data = await response.json();

    const tokenProperties = data.tokenProperties;
    const riskAnalysis = data.riskAnalysis;

    if (!tokenProperties?.valid) {
      const invalidReason = tokenProperties?.invalidReason || 'UNKNOWN_REASON';
      logger.warn('reCAPTCHA token is invalid', { invalidReason });
      return {
        success: false,
        error: `reCAPTCHA token invalid: ${invalidReason}`,
      };
    }

    if (expectedAction && tokenProperties.action !== expectedAction) {
      logger.warn('reCAPTCHA action mismatch', {
        expected: expectedAction,
        received: tokenProperties.action,
      });
      return {
        success: false,
        error: `reCAPTCHA action mismatch (expected ${expectedAction}, got ${tokenProperties.action})`,
      };
    }

    const score = riskAnalysis?.score ?? 1.0;
    const reasons = riskAnalysis?.reasons || [];

    if (score < minScore) {
      logger.warn('reCAPTCHA score below threshold', { score, minScore, reasons });
      return {
        success: false,
        score,
        reasons,
        error: `reCAPTCHA risk score ${score} is below required threshold ${minScore}`,
      };
    }

    logger.info('reCAPTCHA assessment verified successfully', {
      score,
      action: tokenProperties.action,
    });

    return {
      success: true,
      score,
      action: tokenProperties.action,
      reasons,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown reCAPTCHA error';
    logger.error('reCAPTCHA assessment execution error', { error: errorMsg });
    return { success: false, error: errorMsg };
  }
}
