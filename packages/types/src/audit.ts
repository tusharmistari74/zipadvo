import { BaseEntity } from './common';
import { UserRole } from './auth';

export type AuditAction =
  | 'user_login'
  | 'user_blocked'
  | 'user_unblocked'
  | 'lawyer_kyc_draft_saved'
  | 'lawyer_kyc_submitted'
  | 'lawyer_kyc_under_review'
  | 'lawyer_kyc_updated'
  | 'lawyer_kyc_approved'
  | 'lawyer_kyc_rejected'
  | 'lawyer_kyc_suspended'
  | 'lawyer_kyc_restored'
  | 'booking_created'
  | 'booking_unlocked'
  | 'booking_status_updated'
  | 'booking_manual_override'
  | 'payment_captured'
  | 'payment_refunded'
  | 'document_uploaded'
  | 'document_accessed'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'dispute_refunded'
  | 'dispute_dismissed'
  | 'platform_settings_updated';

export interface AuditLog extends BaseEntity {
  id: string;
  actorUid: string;
  actorRole: UserRole;
  action: AuditAction;
  targetEntityId: string;
  targetEntityType: 'user' | 'lawyer' | 'booking' | 'payment' | 'document' | 'dispute' | 'platformSettings';
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}
