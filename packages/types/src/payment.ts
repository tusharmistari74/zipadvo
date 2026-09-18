import { BaseEntity } from './common';

export type PaymentStatus =
  | 'created'
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refund_initiated'
  | 'refunded'
  | 'partially_refunded';

export type PaymentGateway = 'razorpay';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'other';

export type PaymentPurpose =
  | 'unlock_consultation'
  | 'full_service_fee'
  | 'document_review_fee';

export interface RefundDetails {
  refundId: string;
  paymentId: string;
  amountInr: number;
  reason: string;
  processedBy: string; // Admin UID
  adminUid?: string; // Alias for processedBy
  adminNotes?: string;
  providerReference?: string; // Razorpay refund ID (e.g. rfnd_...)
  refundProviderId?: string; // Alias for providerReference
  status: 'pending' | 'processed' | 'failed';
  processedAt: string;
  createdAt?: string;
}

/**
 * Canonical Payment Record stored in Firestore
 */
export interface PaymentTransaction extends BaseEntity {
  paymentId: string; // Canonical identifier matching id
  id: string;
  userId: string; // Client UID
  clientUid: string; // Backward compatibility alias
  lawyerId: string; // Lawyer UID
  lawyerUid: string; // Backward compatibility alias
  bookingId: string;
  amount: number; // Amount in INR (e.g. 299)
  amountInr: number; // Amount in INR
  amountPaise: number; // Amount in paise (e.g. 29900)
  currency: 'INR';
  type: PaymentPurpose;
  purpose: PaymentPurpose; // Backward compatibility alias
  gateway: PaymentGateway;
  method?: PaymentMethod;
  paymentMethod?: PaymentMethod; // Alias
  transactionId?: string; // Razorpay payment ID (e.g. pay_...)
  status: PaymentStatus;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  receipt?: string;
  notes?: Record<string, string>;
  providerMetadata?: Record<string, unknown>;
  idempotencyKey?: string;
  failureReason?: string;
  refunds: RefundDetails[];
  refundDetails?: RefundDetails;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface RazorpayOrderCreationResponse {
  id: string; // Order ID (order_...)
  entity: 'order';
  amount: number; // in paise
  amount_paid: number;
  amount_due: number;
  currency: 'INR';
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayWebhookPayload {
  id?: string;
  entity: 'event';
  account_id: string;
  event:
    | 'payment.captured'
    | 'payment.failed'
    | 'payment.authorized'
    | 'order.paid'
    | 'refund.processed'
    | 'refund.created'
    | 'refund.failed';
  contains: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        entity: 'payment';
        amount: number;
        currency: 'INR';
        status: string;
        order_id: string;
        method?: string;
        error_code?: string;
        error_description?: string;
        [key: string]: unknown;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        currency: 'INR';
        status: string;
        [key: string]: unknown;
      };
    };
    refund?: {
      entity: {
        id: string;
        amount: number;
        payment_id: string;
        status: string;
        [key: string]: unknown;
      };
    };
  };
  created_at: number;
}
