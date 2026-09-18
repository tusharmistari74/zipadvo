import type { Booking, BookingStatus } from './booking';
import type { BookingDocument } from './document';
import type { LawyerKYCStatus, PracticeArea, MumbaiCourt } from './lawyer';
import type { AppNotification } from './notification';

export interface LawyerDashboardMetrics {
  todayAppointmentsCount: number;
  pendingRequestsCount: number;
  activeConsultationsCount: number;
  completedConsultationsCount: number;
  totalEarningsInr: number;
  monthlyEarningsInr: number;
  rating: number;
  reviewCount: number;
  kycStatus: LawyerKYCStatus;
  profileCompletionPercentage: number;
}

export interface LawyerDashboardOverview {
  metrics: LawyerDashboardMetrics;
  todayAppointments: Booking[];
  pendingRequests: Booking[];
  recentBookings: Booking[];
  recentDocuments: BookingDocument[];
  recentNotifications: AppNotification[];
  unreadNotificationCount: number;
}

export interface LawyerEarningBreakdownItem {
  period: string;
  grossInr: number;
  commissionInr: number;
  netInr: number;
  consultationCount: number;
}

export interface LawyerPayoutItem {
  id: string;
  bookingId: string;
  bookingReferenceNumber: string;
  clientDisplayName: string;
  serviceCategory: string;
  date: string;
  grossAmountInr: number;
  platformCommissionInr: number;
  netPayoutInr: number;
  status: 'pending' | 'processing' | 'settled' | 'withdrawn';
  settledAt?: string;
}

export interface LawyerEarningsReport {
  grossTotalInr: number;
  totalCommissionInr: number;
  netEarningsInr: number;
  pendingBalanceInr: number;
  withdrawnBalanceInr: number;
  commissionRatePercentage: number;
  daily: LawyerEarningBreakdownItem;
  weekly: LawyerEarningBreakdownItem;
  monthly: LawyerEarningBreakdownItem;
  transactions: LawyerPayoutItem[];
}

export interface LawyerBookingFilter {
  status?: BookingStatus | 'all';
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

export interface LawyerRejectBookingPayload {
  reason: string;
  internalNote?: string;
}

export interface LawyerUpdateStatusPayload {
  status: 'in_progress' | 'completed';
  completionNotes?: string;
}

export interface LawyerProfileUpdatePayload {
  title?: string;
  bio?: string;
  practiceAreas?: PracticeArea[];
  primaryCourt?: MumbaiCourt;
  consultationFeeInr?: number;
  spokenLanguages?: string[];
  chamberAddress?: string;
  isAcceptingBookings?: boolean;
}
