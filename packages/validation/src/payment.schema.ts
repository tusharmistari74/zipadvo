import { z } from 'zod';
import * as crypto from 'crypto';

export const paymentStatusEnum = z.enum([
  'created',
  'pending',
  'authorized',
  'captured',
  'failed',
  'refund_initiated',
  'refunded',
  'partially_refunded',
]);

export const paymentPurposeEnum = z.enum([
  'unlock_consultation',
  'full_service_fee',
  'document_review_fee',
]);

export const createPaymentOrderSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  userId: z.string().optional(),
  clientUid: z.string().optional(),
  userRole: z.string().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  purpose: paymentPurposeEnum.optional().default('unlock_consultation'),
}).refine((data) => !!(data.userId || data.clientUid), {
  message: 'Either userId or clientUid is required',
  path: ['userId'],
});

export const initiateUnlockPaymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  lawyerUid: z.string().min(1, 'Lawyer ID is required'),
});

export const verifyPaymentSignatureSchema = z.object({
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  bookingId: z.string().min(1, 'Booking ID is required'),
  userId: z.string().optional(),
  clientUid: z.string().optional(),
  userRole: z.string().optional(),
  paymentMethod: z.string().optional(),
  method: z.string().optional(),
}).refine(
  (data) =>
    !!((data.razorpay_order_id || data.razorpayOrderId) &&
      (data.razorpay_payment_id || data.razorpayPaymentId) &&
      (data.razorpay_signature || data.razorpaySignature)),
  {
    message: 'Razorpay order ID, payment ID, and signature are required',
  }
);

export const processRefundSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  amountInr: z.number().positive('Refund amount must be greater than 0'),
  reason: z.string().min(3, 'Refund reason must be at least 3 characters').max(500),
  adminUid: z.string().min(1, 'Admin UID is required'),
  adminRole: z.enum(['admin', 'super_admin', 'client', 'lawyer']).optional(),
  callerRole: z.enum(['admin', 'super_admin', 'client', 'lawyer']).optional(),
  adminNotes: z.string().optional(),
});

export const paymentHistoryQuerySchema = z.object({
  userId: z.string().optional(),
  status: paymentStatusEnum.optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
export type InitiateUnlockPaymentInput = z.infer<typeof initiateUnlockPaymentSchema>;
export type VerifyPaymentSignatureInput = z.infer<typeof verifyPaymentSignatureSchema>;
export type ProcessRefundInput = z.infer<typeof processRefundSchema>;
export type PaymentHistoryQueryInput = z.infer<typeof paymentHistoryQuerySchema>;

/**
 * Verifies Razorpay HMAC-SHA256 payment signature server-side
 * Formula: HMAC_SHA256(order_id + "|" + payment_id, secret)
 */
export function verifyRazorpayPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret: string;
}): boolean {
  const { orderId, paymentId, signature, secret } = params;
  if (!orderId || !paymentId || !signature || !secret) {
    return false;
  }

  try {
    const payload = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Timing-safe buffer comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature, 'utf8');
    const genBuffer = Buffer.from(generatedSignature, 'utf8');

    if (sigBuffer.length !== genBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, genBuffer);
  } catch {
    return false;
  }
}

/**
 * Verifies Razorpay Webhook signature
 * Formula: HMAC_SHA256(raw_request_body, webhook_secret)
 */
export function verifyRazorpayWebhookSignature(params: {
  rawBody: string;
  signature: string;
  webhookSecret?: string;
  secret?: string;
}): boolean {
  const { rawBody, signature } = params;
  const secretKey = params.webhookSecret || params.secret || '';
  if (!rawBody || !signature || !secretKey) {
    return false;
  }

  try {
    const generatedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawBody)
      .digest('hex');

    const sigBuffer = Buffer.from(signature, 'utf8');
    const genBuffer = Buffer.from(generatedSignature, 'utf8');

    if (sigBuffer.length !== genBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, genBuffer);
  } catch {
    return false;
  }
}
