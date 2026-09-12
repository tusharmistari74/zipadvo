import { Badge } from './badge';
import type { BookingStatus, LawyerKYCStatus, DisputeStatus, PaymentStatus } from '@legalhub/types';

export interface StatusBadgeProps {
  status: BookingStatus | LawyerKYCStatus | DisputeStatus | PaymentStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let label = status.replace(/_/g, ' ').toUpperCase();
  let variant: 'default' | 'success' | 'warning' | 'error' | 'brand' | 'navy' = 'default';

  switch (status) {
    case 'verified':
    case 'completed':
    case 'captured':
    case 'resolved_refunded':
    case 'resolved_dismissed':
      variant = 'success';
      break;
    case 'pending_unlock_payment':
    case 'submitted':
    case 'under_review':
    case 'under_investigation':
    case 'created':
    case 'authorized':
      variant = 'warning';
      break;
    case 'unlocked':
    case 'accepted':
    case 'in_progress':
      variant = 'brand';
      break;
    case 'rejected':
    case 'cancelled_by_client':
    case 'cancelled_by_lawyer':
    case 'failed':
    case 'disputed':
    case 'opened':
      variant = 'error';
      break;
    case 'unverified':
    case 'draft':
    case 'closed':
    default:
      variant = 'default';
      break;
  }

  // Format nice human-readable labels
  if (status === 'pending_unlock_payment') label = 'Pending ₹299 Unlock';
  if (status === 'unlocked') label = 'Consultation Unlocked';
  if (status === 'under_review') label = 'KYC Under Review';
  if (status === 'verified') label = 'Bar Council Verified';

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
