import { BaseEntity } from './common';

export type PaymentStatus =
  | 'created'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refund_initiated'
  | 'refunded';

export type PaymentGateway = 'razorpay';

export type PaymentPurpose = 'unlock_consultation' | 'full_service_fee' | 'document_review_fee';

export interface RefundDetails {
  refundId: string;
  amountInr: number;
  reason: string;
  processedAt: string;
  status: 'pending' | 'processed' | 'failed';
}

export interface PaymentTransaction extends BaseEntity {
  id: string;
  bookingId: string;
  clientUid: string;
  lawyerUid: string;
  amountInr: number;
  currency: 'INR';
  purpose: PaymentPurpose;
  gateway: PaymentGateway;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  failureReason?: string;
  refunds: RefundDetails[];
  metadata?: Record<string, string>;
}
