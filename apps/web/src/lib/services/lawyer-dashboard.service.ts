import type {
  Booking,
  BookingDocument,
  LawyerDashboardOverview,
  LawyerEarningsReport,
  LawyerBookingFilter,
  LawyerPayoutItem,
  LawyerKYCStatus,
} from '@legalhub/types';
import { getBookingDocuments } from './document.service';
import { getUserNotifications, getUnreadNotificationCount, emitNotificationEvent } from './notifications/notification.service';
import { logger } from '@legalhub/utils';

// Standard platform service commission deducted from lawyer consultation earnings (15%)
export const PLATFORM_COMMISSION_PERCENTAGE = 15;

// In-memory store of lawyer bookings for fast test execution and offline fallback
let lawyerBookingsStore: Record<string, Booking> = {};

export function resetLawyerPortalStore(): void {
  lawyerBookingsStore = {};
}

export function seedLawyerPortalBookings(bookings: Booking[] = []): void {
  bookings.forEach((b) => {
    lawyerBookingsStore[b.id] = { ...b };
  });
}

/**
 * Masks client sensitive contact info until booking is unlocked (pending_lawyer or confirmed or later)
 */
export function sanitizeClientInfoForLawyer(booking: Booking): Booking {
  const isUnlocked =
    booking.status === 'pending_lawyer' ||
    booking.status === 'confirmed' ||
    booking.status === 'in_progress' ||
    booking.status === 'completed';

  if (!isUnlocked && booking.clientPhone) {
    return {
      ...booking,
      clientPhone: booking.clientPhone.replace(/(\+?\d{2,4})\d{5}(\d{2})/, '$1*****$2'),
    };
  }

  return booking;
}

/**
 * Returns aggregated Lawyer Dashboard Overview
 */
export async function getLawyerDashboardOverview(
  lawyerUid: string,
  providedBookings?: Booking[]
): Promise<LawyerDashboardOverview> {
  const sourceBookings = providedBookings || Object.values(lawyerBookingsStore);
  const lawyerBookings = sourceBookings.filter((b) => b.lawyerUid === lawyerUid);

  // Today's date in YYYY-MM-DD (IST approximation)
  const todayStr = new Date().toISOString().split('T')[0]!;

  // Categorize bookings
  const todayAppointments = lawyerBookings
    .filter((b) => b.preferredDate === todayStr && (b.status === 'confirmed' || b.status === 'in_progress'))
    .map(sanitizeClientInfoForLawyer);

  const pendingRequests = lawyerBookings
    .filter((b) => b.status === 'pending_lawyer')
    .map(sanitizeClientInfoForLawyer);

  const activeConsultations = lawyerBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'in_progress'
  );

  const completedConsultations = lawyerBookings.filter((b) => b.status === 'completed');

  // Calculate earnings
  const earnings = computeLawyerEarnings(lawyerUid, lawyerBookings);

  // Gather documents
  const allDocs: BookingDocument[] = [];
  for (const b of lawyerBookings) {
    const docRes = await getBookingDocuments(b.id, lawyerUid, 'lawyer');
    if (docRes.success && docRes.documents) {
      allDocs.push(...docRes.documents);
    }
  }

  // Notifications
  const notifRes = await getUserNotifications(lawyerUid, lawyerUid, { limit: 5 });
  const unreadRes = await getUnreadNotificationCount(lawyerUid, lawyerUid);

  // Sort recent bookings
  const recentSorted = [...lawyerBookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(sanitizeClientInfoForLawyer);

  // KYC Status (default verified or derived)
  const kycStatus: LawyerKYCStatus = 'verified';

  return {
    metrics: {
      todayAppointmentsCount: todayAppointments.length,
      pendingRequestsCount: pendingRequests.length,
      activeConsultationsCount: activeConsultations.length,
      completedConsultationsCount: completedConsultations.length,
      totalEarningsInr: earnings.grossTotalInr,
      monthlyEarningsInr: earnings.monthly.netInr,
      rating: 4.9,
      reviewCount: 38,
      kycStatus,
      profileCompletionPercentage: 95,
    },
    todayAppointments,
    pendingRequests,
    recentBookings: recentSorted.slice(0, 10),
    recentDocuments: allDocs.slice(0, 10),
    recentNotifications: notifRes.success ? notifRes.notifications : [],
    unreadNotificationCount: unreadRes.count,
  };
}

/**
 * Returns filtered lawyer bookings with authorization and data sanitization
 */
export async function getLawyerBookings(
  lawyerUid: string,
  filter?: LawyerBookingFilter,
  providedBookings?: Booking[]
): Promise<{ success: boolean; bookings: Booking[] }> {
  const sourceBookings = providedBookings || Object.values(lawyerBookingsStore);
  let results = sourceBookings.filter((b) => b.lawyerUid === lawyerUid);

  if (filter?.status && filter.status !== 'all') {
    results = results.filter((b) => b.status === filter.status);
  }

  if (filter?.searchQuery) {
    const q = filter.searchQuery.toLowerCase();
    results = results.filter(
      (b) =>
        b.bookingReferenceNumber?.toLowerCase().includes(q) ||
        b.clientName.toLowerCase().includes(q) ||
        b.serviceCategory.toLowerCase().includes(q) ||
        b.caseDescription.toLowerCase().includes(q)
    );
  }

  if (filter?.startDate) {
    results = results.filter((b) => b.preferredDate >= filter.startDate!);
  }

  if (filter?.endDate) {
    results = results.filter((b) => b.preferredDate <= filter.endDate!);
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    success: true,
    bookings: results.map(sanitizeClientInfoForLawyer),
  };
}

/**
 * Accepts a booking request (transitions from pending_lawyer -> confirmed)
 */
export async function acceptLawyerBooking(
  lawyerUid: string,
  bookingId: string,
  actorRole: string = 'lawyer'
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  const booking = lawyerBookingsStore[bookingId];

  if (!booking) {
    return { success: false, error: 'Booking not found' };
  }

  // Authorization check: Only assigned lawyer (or admin) can accept
  if (booking.lawyerUid !== lawyerUid && actorRole !== 'admin' && actorRole !== 'super_admin') {
    return { success: false, error: 'Unauthorized: You are not the assigned advocate for this consultation' };
  }

  if (booking.status !== 'pending_lawyer') {
    return { success: false, error: `Cannot accept booking in '${booking.status}' state` };
  }

  const now = new Date().toISOString();
  booking.status = 'confirmed';
  booking.updatedAt = now;
  booking.timeline = booking.timeline || [];
  booking.timeline.push({
    status: 'confirmed',
    timestamp: now,
    actorUid: lawyerUid,
    actorRole: 'lawyer',
    notes: 'Advocate accepted the consultation appointment request',
  });

  lawyerBookingsStore[bookingId] = booking;

  // Emit LAWYER_ACCEPTED notification to client
  try {
    await emitNotificationEvent({
      recipientUid: booking.clientUid,
      recipientEmail: booking.clientEmail,
      recipientPhone: booking.clientPhone,
      type: 'LAWYER_ACCEPTED',
      title: 'Consultation Confirmed',
      body: `${booking.lawyerName} has accepted your consultation request for ${booking.preferredDate} at ${booking.preferredTimeSlot}.`,
      channels: ['in_app', 'email', 'sms'],
      actionUrl: `/dashboard?tab=bookings&bookingId=${booking.id}`,
      metadata: { bookingId: booking.id, lawyerUid },
    });
  } catch (err) {
    logger.warn('Failed to emit LAWYER_ACCEPTED notification', { error: err });
  }

  return { success: true, booking: sanitizeClientInfoForLawyer(booking) };
}

/**
 * Rejects a booking request with mandatory reason (transitions from pending_lawyer -> cancelled)
 */
export async function rejectLawyerBooking(
  lawyerUid: string,
  bookingId: string,
  reason: string,
  actorRole: string = 'lawyer'
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  if (!reason || reason.trim().length < 5) {
    return { success: false, error: 'A valid rejection reason of at least 5 characters is required' };
  }

  const booking = lawyerBookingsStore[bookingId];
  if (!booking) {
    return { success: false, error: 'Booking not found' };
  }

  // Authorization check
  if (booking.lawyerUid !== lawyerUid && actorRole !== 'admin' && actorRole !== 'super_admin') {
    return { success: false, error: 'Unauthorized: You are not the assigned advocate for this consultation' };
  }

  if (booking.status !== 'pending_lawyer') {
    return { success: false, error: `Cannot reject booking in '${booking.status}' state` };
  }

  const now = new Date().toISOString();
  booking.status = 'cancelled';
  booking.updatedAt = now;
  booking.cancellationReason = reason.trim();
  booking.timeline = booking.timeline || [];
  booking.timeline.push({
    status: 'cancelled',
    timestamp: now,
    actorUid: lawyerUid,
    actorRole: 'lawyer',
    notes: `Advocate declined consultation: ${reason.trim()}`,
  });

  lawyerBookingsStore[bookingId] = booking;

  // Emit LAWYER_REJECTED notification to client
  try {
    await emitNotificationEvent({
      recipientUid: booking.clientUid,
      recipientEmail: booking.clientEmail,
      recipientPhone: booking.clientPhone,
      type: 'LAWYER_REJECTED',
      title: 'Consultation Request Declined',
      body: `${booking.lawyerName} was unable to accept your booking for ${booking.preferredDate}. Reason: ${reason.trim()}. Your fee will be refunded.`,
      channels: ['in_app', 'email', 'sms'],
      actionUrl: `/dashboard?tab=bookings`,
      metadata: { bookingId: booking.id, lawyerUid, reason: reason.trim() },
    });
  } catch (err) {
    logger.warn('Failed to emit LAWYER_REJECTED notification', { error: err });
  }

  return { success: true, booking: sanitizeClientInfoForLawyer(booking) };
}

/**
 * Updates booking execution status ('in_progress' or 'completed')
 */
export async function updateLawyerBookingStatus(
  lawyerUid: string,
  bookingId: string,
  newStatus: 'in_progress' | 'completed',
  completionNotes?: string,
  actorRole: string = 'lawyer'
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  const booking = lawyerBookingsStore[bookingId];
  if (!booking) {
    return { success: false, error: 'Booking not found' };
  }

  if (booking.lawyerUid !== lawyerUid && actorRole !== 'admin' && actorRole !== 'super_admin') {
    return { success: false, error: 'Unauthorized: You are not the assigned advocate for this consultation' };
  }

  const now = new Date().toISOString();

  if (newStatus === 'in_progress') {
    if (booking.status !== 'confirmed') {
      return { success: false, error: `Cannot start consultation from '${booking.status}' state. Must be 'confirmed'.` };
    }
    booking.status = 'in_progress';
    booking.timeline = booking.timeline || [];
    booking.timeline.push({
      status: 'in_progress',
      timestamp: now,
      actorUid: lawyerUid,
      actorRole: 'lawyer',
      notes: 'Consultation / document review marked in progress',
    });
  } else if (newStatus === 'completed') {
    if (booking.status !== 'in_progress' && booking.status !== 'confirmed') {
      return { success: false, error: `Cannot complete consultation from '${booking.status}' state.` };
    }
    booking.status = 'completed';
    booking.timeline = booking.timeline || [];
    booking.timeline.push({
      status: 'completed',
      timestamp: now,
      actorUid: lawyerUid,
      actorRole: 'lawyer',
      notes: completionNotes || 'Consultation successfully completed and deliverables provided',
    });
  }

  booking.updatedAt = now;
  lawyerBookingsStore[bookingId] = booking;

  return { success: true, booking: sanitizeClientInfoForLawyer(booking) };
}

/**
 * Computes tamper-proof server-side earnings report for a lawyer
 */
export function computeLawyerEarnings(
  lawyerUid: string,
  sourceBookings: Booking[]
): LawyerEarningsReport {
  const lawyerBookings = sourceBookings.filter((b) => b.lawyerUid === lawyerUid);

  const transactions: LawyerPayoutItem[] = [];
  let grossTotalInr = 0;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0]!;
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let dailyGross = 0;
  let dailyCount = 0;
  let weeklyGross = 0;
  let weeklyCount = 0;
  let monthlyGross = 0;
  let monthlyCount = 0;

  // 7 days ago timestamp
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const b of lawyerBookings) {
    // Only paid/unlocked or completed consultations count towards revenue
    const isEarningEligible =
      b.status === 'confirmed' ||
      b.status === 'in_progress' ||
      b.status === 'completed';

    if (isEarningEligible) {
      // Base fee (either unlock payment or consultation fee)
      const gross = b.unlockAmountInr || 299;
      const commission = Math.round((gross * PLATFORM_COMMISSION_PERCENTAGE) / 100);
      const net = gross - commission;

      grossTotalInr += gross;

      const bookingDate = b.preferredDate || b.createdAt.split('T')[0]!;
      const bookingTime = new Date(b.createdAt);

      if (bookingDate === todayStr) {
        dailyGross += gross;
        dailyCount++;
      }
      if (bookingTime >= sevenDaysAgo) {
        weeklyGross += gross;
        weeklyCount++;
      }
      if (bookingDate.startsWith(currentMonthStr)) {
        monthlyGross += gross;
        monthlyCount++;
      }

      transactions.push({
        id: `pay_${b.id}`,
        bookingId: b.id,
        bookingReferenceNumber: b.bookingReferenceNumber || `LHM-${b.id.slice(0, 8)}`,
        clientDisplayName: b.clientName,
        serviceCategory: b.serviceCategory,
        date: b.preferredDate || b.createdAt,
        grossAmountInr: gross,
        platformCommissionInr: commission,
        netPayoutInr: net,
        status: b.status === 'completed' ? 'settled' : 'pending',
        settledAt: b.status === 'completed' ? b.updatedAt : undefined,
      });
    }
  }

  const totalCommissionInr = Math.round((grossTotalInr * PLATFORM_COMMISSION_PERCENTAGE) / 100);
  const netEarningsInr = grossTotalInr - totalCommissionInr;

  const pendingBalanceInr = transactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.netPayoutInr, 0);

  const withdrawnBalanceInr = transactions
    .filter((t) => t.status === 'withdrawn')
    .reduce((sum, t) => sum + t.netPayoutInr, 0);

  const dailyCommission = Math.round((dailyGross * PLATFORM_COMMISSION_PERCENTAGE) / 100);
  const weeklyCommission = Math.round((weeklyGross * PLATFORM_COMMISSION_PERCENTAGE) / 100);
  const monthlyCommission = Math.round((monthlyGross * PLATFORM_COMMISSION_PERCENTAGE) / 100);

  return {
    grossTotalInr,
    totalCommissionInr,
    netEarningsInr,
    pendingBalanceInr,
    withdrawnBalanceInr,
    commissionRatePercentage: PLATFORM_COMMISSION_PERCENTAGE,
    daily: {
      period: 'Today',
      grossInr: dailyGross,
      commissionInr: dailyCommission,
      netInr: dailyGross - dailyCommission,
      consultationCount: dailyCount,
    },
    weekly: {
      period: 'Last 7 Days',
      grossInr: weeklyGross,
      commissionInr: weeklyCommission,
      netInr: weeklyGross - weeklyCommission,
      consultationCount: weeklyCount,
    },
    monthly: {
      period: 'This Month',
      grossInr: monthlyGross,
      commissionInr: monthlyCommission,
      netInr: monthlyGross - monthlyCommission,
      consultationCount: monthlyCount,
    },
    transactions,
  };
}

/**
 * Returns lawyer earnings report
 */
export async function getLawyerEarningsReport(
  lawyerUid: string,
  providedBookings?: Booking[]
): Promise<LawyerEarningsReport> {
  const sourceBookings = providedBookings || Object.values(lawyerBookingsStore);
  return computeLawyerEarnings(lawyerUid, sourceBookings);
}

/**
 * Returns all documents across advocate's consultation bookings
 */
export async function getLawyerAllDocuments(
  lawyerUid: string,
  providedBookings?: Booking[]
): Promise<{ success: boolean; documents: BookingDocument[] }> {
  const sourceBookings = providedBookings || Object.values(lawyerBookingsStore);
  const lawyerBookings = sourceBookings.filter((b) => b.lawyerUid === lawyerUid);

  const allDocs: BookingDocument[] = [];
  for (const b of lawyerBookings) {
    const docRes = await getBookingDocuments(b.id, lawyerUid, 'lawyer');
    if (docRes.success && docRes.documents) {
      allDocs.push(...docRes.documents);
    }
  }

  allDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { success: true, documents: allDocs };
}
