export type AnalyticsTimePeriod = 'today' | '7d' | '30d' | '90d' | 'all';

export interface PlatformBusinessMetrics {
  // User metrics
  totalUsers: number;
  clientUsers: number;
  lawyerUsers: number;
  verifiedLawyers: number;
  pendingVerificationLawyers: number;

  // Booking & Consultation metrics
  totalBookings: number;
  completedBookings: number;
  confirmedBookings: number;
  inProgressBookings: number;
  cancelledBookings: number;
  disputedBookings: number;
  todayBookings: number;
  bookingCompletionRatePercentage: number;
  bookingCancellationRatePercentage: number;

  // Dispute & Refund metrics
  totalDisputes: number;
  activeDisputes: number;
  resolvedDisputes: number;
  totalRefundsCount: number;
  totalRefundAmountInr: number;

  // Revenue & Financial metrics
  grossPaymentVolumeInr: number; // Gross total processed (₹)
  platformRevenueInr: number; // Net revenue retained by platform (Unlock fees + commissions)
  commissionRevenueInr: number; // Commission retained from completed consultations
  unlockRevenueInr: number; // Revenue from booking unlock fees
  averageOrderValueInr: number; // Average gross transaction amount

  // Metadata & Data Source Integrity
  period: AnalyticsTimePeriod;
  isSampleData: boolean; // Flag to clearly distinguish real data from sample dev data
  dataSource: 'production_database' | 'development_seed';
  generatedAt: string;
}

export type FunnelStage =
  | 'visitor'
  | 'lawyer_search'
  | 'profile_view'
  | 'booking_started'
  | 'payment_success'
  | 'lawyer_accepted'
  | 'completed'
  | 'review_submitted';

export interface FunnelStageMetrics {
  stage: FunnelStage;
  label: string;
  count: number;
  conversionRateFromPrevious: number; // percentage (0 - 100)
  conversionRateFromTop: number; // percentage (0 - 100)
  dropoffCount: number;
}

export interface FunnelEvent {
  eventId: string;
  stage: FunnelStage;
  userId?: string;
  sessionId?: string;
  targetId?: string; // e.g. lawyerId, bookingId, paymentId
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface AnalyticsTimeSeriesPoint {
  date: string;
  grossVolumeInr: number;
  platformRevenueInr: number;
  bookingsCount: number;
  newUsersCount: number;
}

export interface BusinessAnalyticsDashboardData {
  metrics: PlatformBusinessMetrics;
  funnel: FunnelStageMetrics[];
  timeSeries: AnalyticsTimeSeriesPoint[];
  generatedAt: string;
  cachedUntil: string;
  isSampleData: boolean;
}
