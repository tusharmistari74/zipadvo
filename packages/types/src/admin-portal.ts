import type { UserProfile, UserStatus } from './user';
import type { UserRole } from './auth';
import type { BookingStatus } from './booking';
import type { DisputeStatus } from './dispute';
import type { AuditAction } from './audit';

export interface AdminDashboardMetrics {
  totalUsersCount: number;
  totalClientsCount: number;
  totalLawyersCount: number;
  verifiedLawyersCount: number;
  pendingKycCount: number;
  todayBookingsCount: number;
  totalBookingsCount: number;
  totalGrossRevenueInr: number;
  totalPlatformCommissionInr: number;
  totalRefundsInr: number;
  activeDisputesCount: number;
  momUserGrowthPercentage: number;
  momRevenueGrowthPercentage: number;
}

export interface AdminUserItem extends UserProfile {
  totalBookingsCount: number;
  totalSpentInr?: number;
  totalEarnedInr?: number;
}

export interface AdminUserFilter {
  role?: UserRole | 'all';
  status?: UserStatus | 'all';
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

export interface AdminBookingFilter {
  status?: BookingStatus | 'all';
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

export interface AdminDisputeFilter {
  status?: DisputeStatus | 'all';
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

export interface AdminAuditFilter {
  action?: AuditAction | 'all';
  actorUid?: string;
  targetEntityType?: string | 'all';
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

export interface AdminManualBookingOverridePayload {
  newStatus: BookingStatus;
  reason: string;
  adminNotes?: string;
}

export interface AdminResolveDisputePayload {
  resolution: 'client_refund' | 'lawyer_payout' | 'dismissed';
  resolutionSummary: string;
  adminNotes?: string;
  refundAmountInr?: number;
}

export interface AdminUpdatePlatformSettingsPayload {
  commissionRate?: number;
  unlockFee?: number;
  minimumWithdrawal?: number;
  supportEmail?: string;
  supportPhone?: string;
  platformVersion?: string;
  consultationUnlockFeeInr?: number;
  platformCommissionPercentage?: number;
  isMaintenanceMode?: boolean;
  maintenanceMode?: boolean;
  supportContactEmail?: string;
  supportContactPhone?: string;
  reason?: string;
}
