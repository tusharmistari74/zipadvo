import { logger } from '@legalhub/utils';

export const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LchH8ItAAAAACBC4N86SPJ18C_0XM5FNTSK0sDv';

declare global {
  interface Window {
    grecaptcha?: {
      enterprise?: {
        ready: (callback: () => void | Promise<void>) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
      ready?: (callback: () => void | Promise<void>) => void;
      execute?: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

/**
 * Executes reCAPTCHA Enterprise verification for a specified user action
 * e.g., 'LOGIN', 'REGISTER', 'BOOKING_CREATE', 'DISPUTE_SUBMIT'
 */
export async function executeRecaptchaAction(action: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const grecaptcha = window.grecaptcha;
    if (grecaptcha?.enterprise?.execute) {
      return new Promise((resolve) => {
        grecaptcha.enterprise!.ready(async () => {
          try {
            const token = await grecaptcha.enterprise!.execute(RECAPTCHA_SITE_KEY, { action });
            resolve(token);
          } catch (err) {
            logger.warn('reCAPTCHA Enterprise execution failed', { error: err });
            resolve(null);
          }
        });
      });
    }

    // Fallback for standard grecaptcha if loaded
    if (grecaptcha?.execute) {
      return new Promise((resolve) => {
        grecaptcha.ready!(async () => {
          try {
            const token = await grecaptcha.execute!(RECAPTCHA_SITE_KEY, { action });
            resolve(token);
          } catch (err) {
            logger.warn('reCAPTCHA standard execution failed', { error: err });
            resolve(null);
          }
        });
      });
    }

    return null;
  } catch (error) {
    logger.warn('Failed to execute reCAPTCHA Enterprise token generation', { error });
    return null;
  }
}
