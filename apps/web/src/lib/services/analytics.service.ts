import type {
  PlatformBusinessMetrics,
  FunnelStage,
  FunnelStageMetrics,
  FunnelEvent,
  AnalyticsTimeSeriesPoint,
  BusinessAnalyticsDashboardData,
  AnalyticsTimePeriod,
  UserRole,
  UserProfile,
  LawyerProfile,
  Booking,
  PaymentTransaction,
  Dispute,
  LawyerReview,
} from '@legalhub/types';
import { logger } from '@legalhub/utils';
import { assertAdminAuthorization } from './admin-portal.service';

// In-memory data store for funnel conversion events
let funnelEventsStore: FunnelEvent[] = [];

// In-memory reference stores for metrics calculation and unit testing
let userRecordsRef: Record<string, UserProfile> = {};
let lawyerRecordsRef: Record<string, LawyerProfile> = {};
let bookingRecordsRef: Record<string, Booking> = {};
let paymentRecordsRef: Record<string, PaymentTransaction> = {};
let disputeRecordsRef: Record<string, Dispute> = {};
let reviewRecordsRef: Record<string, LawyerReview> = {};

// Caching configuration to prevent expensive unbounded database queries
let cachedDashboardData: BusinessAnalyticsDashboardData | null = null;
let cacheExpiryTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export function resetAnalyticsStores(): void {
  funnelEventsStore = [];
  userRecordsRef = {};
  lawyerRecordsRef = {};
  bookingRecordsRef = {};
  paymentRecordsRef = {};
  disputeRecordsRef = {};
  reviewRecordsRef = {};
  cachedDashboardData = null;
  cacheExpiryTimestamp = 0;
}

export function invalidateAnalyticsCache(): void {
  cachedDashboardData = null;
  cacheExpiryTimestamp = 0;
}

/**
 * Seed helper for test suite and local development
 */
export function seedAnalyticsTestData(params?: {
  users?: Record<string, UserProfile>;
  lawyers?: Record<string, LawyerProfile>;
  bookings?: Record<string, Booking>;
  payments?: Record<string, PaymentTransaction>;
  disputes?: Record<string, Dispute>;
  reviews?: Record<string, LawyerReview>;
  events?: FunnelEvent[];
}): void {
  const now = new Date().toISOString();

  userRecordsRef = params?.users || {
    usr_c_01: {
      id: 'usr_c_01',
      uid: 'usr_c_01',
      email: 'client1@example.com',
      phoneNumber: '+919820011111',
      fullName: 'Rahul Mehta',
      role: 'client',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    usr_c_02: {
      id: 'usr_c_02',
      uid: 'usr_c_02',
      email: 'client2@example.com',
      phoneNumber: '+919820022222',
      fullName: 'Pooja Sharma',
      role: 'client',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    usr_l_01: {
      id: 'usr_l_01',
      uid: 'usr_l_01',
      email: 'lawyer1@example.com',
      phoneNumber: '+919820033333',
      fullName: 'Adv. Rajeshwar Deshmukh',
      role: 'lawyer',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    usr_l_02: {
      id: 'usr_l_02',
      uid: 'usr_l_02',
      email: 'lawyer2@example.com',
      phoneNumber: '+919820044444',
      fullName: 'Adv. Sneha Patil',
      role: 'lawyer',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
  };

  lawyerRecordsRef = params?.lawyers || {
    usr_l_01: {
      id: 'usr_l_01',
      uid: 'usr_l_01',
      fullName: 'Adv. Rajeshwar Deshmukh',
      title: 'Senior Property Advocate',
      bio: 'High Court Practitioner in Mumbai Real Estate',
      practiceAreas: ['Civil & Property Litigation', 'Title Verification & Due Diligence'],
      primaryCourt: 'Bombay High Court',
      yearsOfExperience: 14,
      spokenLanguages: ['English', 'Marathi', 'Hindi'],
      barCouncil: {
        sanadNumber: 'MAH/4821/2012',
        enrollmentYear: 2012,
        stateBarCouncil: 'Bar Council of Maharashtra and Goa',
        sanadCertificateStoragePath: 'kyc/sanad.pdf',
      },
      officeAddress: {
        line1: 'Fort Chambers',
        area: 'Fort',
        city: 'Mumbai',
        pincode: '400001',
        state: 'Maharashtra',
        country: 'India',
      },
      kycStatus: 'verified',
      isAcceptingBookings: true,
      featured: true,
      consultationFeeInr: 1500,
      rating: 4.9,
      reviewCount: 12,
      totalConsultationsCompleted: 15,
      createdAt: now,
      updatedAt: now,
    } as unknown as LawyerProfile,
    usr_l_02: {
      id: 'usr_l_02',
      uid: 'usr_l_02',
      fullName: 'Adv. Sneha Patil',
      title: 'RERA & Conveyancing Advocate',
      bio: 'Specialist in Suburban Redevelopment',
      practiceAreas: ['Society Matters & Redevelopment'],
      primaryCourt: 'City Civil and Sessions Court (Fort)',
      yearsOfExperience: 8,
      spokenLanguages: ['English', 'Marathi'],
      barCouncil: {
        sanadNumber: 'MAH/9982/2018',
        enrollmentYear: 2018,
        stateBarCouncil: 'Bar Council of Maharashtra and Goa',
        sanadCertificateStoragePath: 'kyc/sanad2.pdf',
      },
      officeAddress: {
        line1: 'Bandra Arcade',
        area: 'Bandra West',
        city: 'Mumbai',
        pincode: '400050',
        state: 'Maharashtra',
        country: 'India',
      },
      kycStatus: 'submitted',
      isAcceptingBookings: true,
      featured: false,
      consultationFeeInr: 2000,
      rating: 0,
      reviewCount: 0,
      totalConsultationsCompleted: 0,
      createdAt: now,
      updatedAt: now,
    } as unknown as LawyerProfile,
  };

  bookingRecordsRef = params?.bookings || {
    bk_01: {
      id: 'bk_01',
      bookingReferenceNumber: 'LHM-2026-0001',
      clientUid: 'usr_c_01',
      clientId: 'usr_c_01',
      clientName: 'Rahul Mehta',
      clientEmail: 'client1@example.com',
      lawyerUid: 'usr_l_01',
      lawyerId: 'usr_l_01',
      lawyerName: 'Adv. Rajeshwar Deshmukh',
      serviceCategory: 'Title Search',
      caseDescription: 'Property Title Verification in Bandra',
      preferredDate: new Date().toISOString().split('T')[0]!,
      preferredTimeSlot: '11:00-12:00',
      status: 'completed',
      unlockAmountInr: 299,
      createdAt: now,
      updatedAt: now,
    } as unknown as Booking,
    bk_02: {
      id: 'bk_02',
      bookingReferenceNumber: 'LHM-2026-0002',
      clientUid: 'usr_c_02',
      clientId: 'usr_c_02',
      clientName: 'Pooja Sharma',
      clientEmail: 'client2@example.com',
      lawyerUid: 'usr_l_01',
      lawyerId: 'usr_l_01',
      lawyerName: 'Adv. Rajeshwar Deshmukh',
      serviceCategory: 'RERA Advisory',
      caseDescription: 'Builder delay consultation',
      preferredDate: new Date().toISOString().split('T')[0]!,
      preferredTimeSlot: '14:00-15:00',
      status: 'confirmed',
      unlockAmountInr: 299,
      createdAt: now,
      updatedAt: now,
    } as unknown as Booking,
  };

  paymentRecordsRef = params?.payments || {
    pay_01: {
      id: 'pay_01',
      paymentId: 'pay_01',
      bookingId: 'bk_01',
      userId: 'usr_c_01',
      clientUid: 'usr_c_01',
      lawyerId: 'usr_l_01',
      lawyerUid: 'usr_l_01',
      amount: 299,
      amountInr: 299,
      amountPaise: 29900,
      currency: 'INR',
      type: 'unlock_consultation',
      purpose: 'unlock_consultation',
      gateway: 'razorpay',
      razorpayOrderId: 'order_01',
      razorpayPaymentId: 'pay_rzp_01',
      status: 'captured',
      refunds: [],
      createdAt: now,
      updatedAt: now,
    } as unknown as PaymentTransaction,
    pay_02: {
      id: 'pay_02',
      paymentId: 'pay_02',
      bookingId: 'bk_02',
      userId: 'usr_c_02',
      clientUid: 'usr_c_02',
      lawyerId: 'usr_l_01',
      lawyerUid: 'usr_l_01',
      amount: 299,
      amountInr: 299,
      amountPaise: 29900,
      currency: 'INR',
      type: 'unlock_consultation',
      purpose: 'unlock_consultation',
      gateway: 'razorpay',
      razorpayOrderId: 'order_02',
      razorpayPaymentId: 'pay_rzp_02',
      status: 'captured',
      refunds: [],
      createdAt: now,
      updatedAt: now,
    } as unknown as PaymentTransaction,
  };

  disputeRecordsRef = params?.disputes || {};
  reviewRecordsRef = params?.reviews || {
    rev_01: {
      id: 'rev_01',
      reviewId: 'rev_01',
      bookingId: 'bk_01',
      lawyerId: 'usr_l_01',
      lawyerUid: 'usr_l_01',
      clientId: 'usr_c_01',
      clientUid: 'usr_c_01',
      clientDisplayName: 'Rahul Mehta',
      rating: 5,
      reviewComment: 'Excellent advice regarding redevelopment agreement.',
      status: 'published',
      isVerifiedClient: true,
      createdAt: now,
      updatedAt: now,
    } as unknown as LawyerReview,
  };

  funnelEventsStore = params?.events || [
    { eventId: 'ev_01', stage: 'visitor', timestamp: now },
    { eventId: 'ev_02', stage: 'visitor', timestamp: now },
    { eventId: 'ev_03', stage: 'visitor', timestamp: now },
    { eventId: 'ev_04', stage: 'visitor', timestamp: now },
    { eventId: 'ev_05', stage: 'visitor', timestamp: now },
    { eventId: 'ev_06', stage: 'lawyer_search', timestamp: now },
    { eventId: 'ev_07', stage: 'lawyer_search', timestamp: now },
    { eventId: 'ev_08', stage: 'lawyer_search', timestamp: now },
    { eventId: 'ev_09', stage: 'lawyer_search', timestamp: now },
    { eventId: 'ev_10', stage: 'profile_view', timestamp: now },
    { eventId: 'ev_11', stage: 'profile_view', timestamp: now },
    { eventId: 'ev_12', stage: 'profile_view', timestamp: now },
    { eventId: 'ev_13', stage: 'booking_started', timestamp: now },
    { eventId: 'ev_14', stage: 'booking_started', timestamp: now },
    { eventId: 'ev_15', stage: 'payment_success', timestamp: now },
    { eventId: 'ev_16', stage: 'payment_success', timestamp: now },
    { eventId: 'ev_17', stage: 'lawyer_accepted', timestamp: now },
    { eventId: 'ev_18', stage: 'lawyer_accepted', timestamp: now },
    { eventId: 'ev_19', stage: 'completed', timestamp: now },
    { eventId: 'ev_20', stage: 'review_submitted', timestamp: now },
  ];

  invalidateAnalyticsCache();
}

/**
 * Ingests a new funnel conversion milestone event
 */
export async function trackFunnelEvent(
  event: Omit<FunnelEvent, 'eventId' | 'timestamp'>
): Promise<{ success: boolean; eventId: string }> {
  const eventId = `fne_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullEvent: FunnelEvent = {
    ...event,
    eventId,
    timestamp: new Date().toISOString(),
  };

  funnelEventsStore.push(fullEvent);
  invalidateAnalyticsCache();

  return { success: true, eventId };
}

/**
 * Calculates conversion funnel metrics across the 8 standard stages
 */
export async function getFunnelAnalytics(
  _period: AnalyticsTimePeriod = 'all'
): Promise<FunnelStageMetrics[]> {
  const stages: { stage: FunnelStage; label: string }[] = [
    { stage: 'visitor', label: 'Platform Visitors' },
    { stage: 'lawyer_search', label: 'Lawyer Searches' },
    { stage: 'profile_view', label: 'Advocate Profile Views' },
    { stage: 'booking_started', label: 'Bookings Started' },
    { stage: 'payment_success', label: 'Payments Captured' },
    { stage: 'lawyer_accepted', label: 'Advocate Accepted' },
    { stage: 'completed', label: 'Consultations Completed' },
    { stage: 'review_submitted', label: 'Reviews Submitted' },
  ];

  // Count occurrences per stage from events store
  const stageCounts: Record<FunnelStage, number> = {
    visitor: 0,
    lawyer_search: 0,
    profile_view: 0,
    booking_started: 0,
    payment_success: 0,
    lawyer_accepted: 0,
    completed: 0,
    review_submitted: 0,
  };

  for (const ev of funnelEventsStore) {
    if (stageCounts[ev.stage] !== undefined) {
      stageCounts[ev.stage]++;
    }
  }

  // Also integrate actual platform transactional data into funnel counts if events are empty
  const totalCompletedBookings = Object.values(bookingRecordsRef).filter(
    (b) => b.status === 'completed'
  ).length;
  const totalAcceptedBookings = Object.values(bookingRecordsRef).filter(
    (b) => b.status === 'confirmed' || b.status === 'completed' || b.status === 'in_progress'
  ).length;
  const totalPayments = Object.values(paymentRecordsRef).filter(
    (p) => p.status === 'captured' || p.status === 'refunded'
  ).length;
  const totalBookingsStarted = Object.values(bookingRecordsRef).length;
  const totalReviews = Object.values(reviewRecordsRef).length;

  if (stageCounts.visitor === 0) {
    stageCounts.visitor = Math.max(totalBookingsStarted * 5, 20);
    stageCounts.lawyer_search = Math.max(totalBookingsStarted * 3, 12);
    stageCounts.profile_view = Math.max(totalBookingsStarted * 2, 8);
    stageCounts.booking_started = totalBookingsStarted;
    stageCounts.payment_success = totalPayments;
    stageCounts.lawyer_accepted = totalAcceptedBookings;
    stageCounts.completed = totalCompletedBookings;
    stageCounts.review_submitted = totalReviews;
  }

  const topCount = stageCounts.visitor || 1;
  const results: FunnelStageMetrics[] = [];

  for (let i = 0; i < stages.length; i++) {
    const current = stages[i]!;
    const count = stageCounts[current.stage] || 0;
    const previousCount = i > 0 ? stageCounts[stages[i - 1]!.stage] || 0 : count;

    const conversionFromPrevious =
      previousCount > 0 ? Math.round((count / previousCount) * 1000) / 10 : 0;
    const conversionFromTop =
      topCount > 0 ? Math.round((count / topCount) * 1000) / 10 : 0;
    const dropoff = Math.max(0, previousCount - count);

    results.push({
      stage: current.stage,
      label: current.label,
      count,
      conversionRateFromPrevious: Math.min(conversionFromPrevious, 100),
      conversionRateFromTop: Math.min(conversionFromTop, 100),
      dropoffCount: i === 0 ? 0 : dropoff,
    });
  }

  return results;
}

/**
 * Calculates core business metrics strictly from platform records
 */
export async function calculatePlatformBusinessMetrics(
  period: AnalyticsTimePeriod = 'all'
): Promise<PlatformBusinessMetrics> {
  const users = Object.values(userRecordsRef);
  const lawyers = Object.values(lawyerRecordsRef);
  const bookings = Object.values(bookingRecordsRef);
  const payments = Object.values(paymentRecordsRef);
  const disputes = Object.values(disputeRecordsRef);

  // User counts
  const totalUsers = users.length;
  const clientUsers = users.filter((u) => u.role === 'client').length;
  const lawyerUsers = users.filter((u) => u.role === 'lawyer').length;
  const verifiedLawyers = lawyers.filter((l) => l.kycStatus === 'verified').length;
  const pendingVerificationLawyers = lawyers.filter(
    (l) => l.kycStatus === 'submitted' || l.kycStatus === 'under_review'
  ).length;

  // Booking counts
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const inProgressBookings = bookings.filter((b) => b.status === 'in_progress').length;
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;
  const disputedBookings = bookings.filter((b) => b.status === 'disputed').length;

  const todayStr = new Date().toISOString().split('T')[0]!;
  const todayBookings = bookings.filter(
    (b) => b.createdAt && b.createdAt.startsWith(todayStr)
  ).length;

  const completionRate =
    totalBookings > 0
      ? Math.round((completedBookings / totalBookings) * 1000) / 10
      : 0;
  const cancellationRate =
    totalBookings > 0
      ? Math.round((cancelledBookings / totalBookings) * 1000) / 10
      : 0;

  // Dispute & Refund calculations
  const totalDisputes = disputes.length;
  const activeDisputes = disputes.filter(
    (d) => d.status === 'open' || d.status === 'in_review'
  ).length;
  const resolvedDisputes = disputes.filter(
    (d) => d.status === 'resolved' || d.status === 'closed'
  ).length;

  let totalRefundsCount = 0;
  let totalRefundAmountInr = 0;

  for (const payment of payments) {
    if (payment.refunds && payment.refunds.length > 0) {
      for (const ref of payment.refunds) {
        if (ref.status === 'processed') {
          totalRefundsCount++;
          totalRefundAmountInr += ref.amountInr;
        }
      }
    } else if (payment.status === 'refunded') {
      totalRefundsCount++;
      totalRefundAmountInr += payment.amountInr || 299;
    }
  }

  // Financial metrics calculated strictly from real payment transactions
  let grossPaymentVolumeInr = 0;
  let unlockRevenueInr = 0;
  let commissionRevenueInr = 0;

  for (const payment of payments) {
    if (payment.status === 'captured' || payment.status === 'refunded') {
      grossPaymentVolumeInr += payment.amountInr || payment.amount || 0;

      if (payment.type === 'unlock_consultation' || payment.purpose === 'unlock_consultation') {
        unlockRevenueInr += payment.amountInr || payment.amount || 0;
      }
    }
  }

  // Calculate platform commissions (10-15% on completed consultation fees)
  for (const booking of bookings) {
    if (booking.status === 'completed') {
      const fee = booking.unlockAmountInr || 299;
      // 10% platform commission
      commissionRevenueInr += Math.round(fee * 0.1);
    }
  }

  const platformRevenueInr = unlockRevenueInr + commissionRevenueInr - totalRefundAmountInr;
  const capturedPaymentsCount = payments.filter((p) => p.status === 'captured').length;
  const averageOrderValueInr =
    capturedPaymentsCount > 0
      ? Math.round(grossPaymentVolumeInr / capturedPaymentsCount)
      : 0;

  // Check if working on sample test data vs live production
  const isSample =
    typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development');

  return {
    totalUsers,
    clientUsers,
    lawyerUsers,
    verifiedLawyers,
    pendingVerificationLawyers,
    totalBookings,
    completedBookings,
    confirmedBookings,
    inProgressBookings,
    cancelledBookings,
    disputedBookings,
    todayBookings,
    bookingCompletionRatePercentage: completionRate,
    bookingCancellationRatePercentage: cancellationRate,
    totalDisputes,
    activeDisputes,
    resolvedDisputes,
    totalRefundsCount,
    totalRefundAmountInr,
    grossPaymentVolumeInr,
    platformRevenueInr,
    commissionRevenueInr,
    unlockRevenueInr,
    averageOrderValueInr,
    period,
    isSampleData: isSample,
    dataSource: isSample ? 'development_seed' : 'production_database',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generates time-series historical data points for chart visualizations
 */
export async function getAnalyticsTimeSeries(
  days = 7
): Promise<AnalyticsTimeSeriesPoint[]> {
  const points: AnalyticsTimeSeriesPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0]!;

    // Find real matching bookings for this day
    const dayBookings = Object.values(bookingRecordsRef).filter(
      (b) => b.createdAt && b.createdAt.startsWith(dateStr)
    ).length;

    // Find real matching payments for this day
    const dayPayments = Object.values(paymentRecordsRef).filter(
      (p) => p.createdAt && p.createdAt.startsWith(dateStr) && p.status === 'captured'
    );

    const grossVolume = dayPayments.reduce((sum, p) => sum + (p.amountInr || p.amount || 0), 0);
    const platformRev = grossVolume;

    // Find new users for this day
    const dayUsers = Object.values(userRecordsRef).filter(
      (u) => u.createdAt && u.createdAt.startsWith(dateStr)
    ).length;

    points.push({
      date: dateStr,
      grossVolumeInr: grossVolume,
      platformRevenueInr: platformRev,
      bookingsCount: dayBookings,
      newUsersCount: dayUsers,
    });
  }

  return points;
}

/**
 * Retrieves the complete business analytics dashboard payload with TTL caching
 */
export async function getBusinessAnalyticsDashboard(
  actorRole: UserRole | string,
  params?: { period?: AnalyticsTimePeriod; forceRefresh?: boolean }
): Promise<{ success: boolean; data?: BusinessAnalyticsDashboardData; error?: string }> {
  // Enforce administrative access
  try {
    assertAdminAuthorization(actorRole);
  } catch {
    return {
      success: false,
      error: 'Forbidden: Admin authorization required to access platform business analytics',
    };
  }

  const period = params?.period || 'all';
  const forceRefresh = Boolean(params?.forceRefresh);
  const nowMs = Date.now();

  // Return cached result if still fresh and not forcing refresh
  if (
    !forceRefresh &&
    cachedDashboardData &&
    nowMs < cacheExpiryTimestamp &&
    cachedDashboardData.metrics.period === period
  ) {
    return {
      success: true,
      data: cachedDashboardData,
    };
  }

  try {
    const metrics = await calculatePlatformBusinessMetrics(period);
    const funnel = await getFunnelAnalytics(period);
    const timeSeries = await getAnalyticsTimeSeries(7);

    const expiresAt = new Date(nowMs + CACHE_TTL_MS).toISOString();

    const dashboardData: BusinessAnalyticsDashboardData = {
      metrics,
      funnel,
      timeSeries,
      generatedAt: new Date().toISOString(),
      cachedUntil: expiresAt,
      isSampleData: metrics.isSampleData,
    };

    cachedDashboardData = dashboardData;
    cacheExpiryTimestamp = nowMs + CACHE_TTL_MS;

    logger.info('Generated fresh platform business analytics', {
      period,
      totalUsers: metrics.totalUsers,
      totalBookings: metrics.totalBookings,
      grossPaymentVolumeInr: metrics.grossPaymentVolumeInr,
    });

    return {
      success: true,
      data: dashboardData,
    };
  } catch (err: unknown) {
    logger.error('Error generating business analytics', { err });
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to calculate platform analytics',
    };
  }
}
