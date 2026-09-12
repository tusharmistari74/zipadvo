import { z } from 'zod';

export const initiateUnlockPaymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  lawyerUid: z.string().min(1, 'Lawyer ID is required'),
});

export const verifyPaymentSignatureSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Razorpay Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay Signature is required'),
  bookingId: z.string().min(1, 'Booking ID is required'),
});

export type InitiateUnlockPaymentInput = z.infer<typeof initiateUnlockPaymentSchema>;
export type VerifyPaymentSignatureInput = z.infer<typeof verifyPaymentSignatureSchema>;
