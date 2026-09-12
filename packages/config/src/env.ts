import { z } from 'zod';

/**
 * Client-Safe Environment Variables Schema (accessible in browser via NEXT_PUBLIC_)
 */
export const clientEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_BASE_URL: z.string().default('http://localhost:3000/api'),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'Firebase API Key is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase Auth Domain is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase Storage Bucket is required'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase Messaging Sender ID is required'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'Firebase App ID is required'),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: z.string().transform((v) => v === 'true').default('false'),
  NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),
  NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1, 'Razorpay Key ID is required'),
  NEXT_PUBLIC_CONSULTATION_UNLOCK_FEE_INR: z.coerce.number().positive().default(299),
});

/**
 * Server-Only Environment Variables Schema (must NEVER be leaked to browser)
 */
export const serverEnvSchema = z.object({
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1, 'Firebase Admin Project ID is required'),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email('Firebase Admin Client Email must be valid'),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1, 'Firebase Admin Private Key is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'Razorpay Key Secret is required'),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'Razorpay Webhook Secret is required'),
  STORAGE_PRIVATE_BUCKET: z.string().min(1, 'Private storage bucket is required'),
  SIGNED_URL_EXPIRY_SECONDS: z.coerce.number().positive().default(900),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validate Client Environment Variables
 */
export function validateClientEnv(env: Record<string, unknown> = process.env): ClientEnv {
  const result = clientEnvSchema.safeParse(env);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`[LegalHubMumbai Config Error] Invalid client environment configuration:\n${errorDetails}`);
  }
  return result.data;
}

/**
 * Validate Server Environment Variables
 */
export function validateServerEnv(env: Record<string, unknown> = process.env): ServerEnv {
  const result = serverEnvSchema.safeParse(env);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`[LegalHubMumbai Config Error] Invalid server environment configuration:\n${errorDetails}`);
  }
  return result.data;
}
