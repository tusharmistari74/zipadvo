import { describe, it, expect, beforeEach } from 'vitest';
import {
  getLawyerDashboardOverview,
  getLawyerBookings,
  acceptLawyerBooking,
  rejectLawyerBooking,
  updateLawyerBookingStatus,
  getLawyerEarningsReport,
  computeLawyerEarnings,
  sanitizeClientInfoForLawyer,
  seedLawyerPortalBookings,
  resetLawyerPortalStore,
  PLATFORM_COMMISSION_PERCENTAGE,
} from '../../apps/web/src/lib/services/lawyer-dashboard.service';
import {
  resetNotificationSystem,
  getUserNotifications,
  getSentEmailSpool,
} from '../../apps/web/src/lib/services/notifications/notification.service';
import type { Booking } from '@legalhub/types';

describe('PHASE 16: Lawyer Portal & Dashboard Service', () => {
  const lawyerA = 'lawyer-deshmukh';
  const lawyerB = 'lawyer-kulkarni';
  const clientUid = 'client-rahul';

  const todayStr = new Date().toISOString().split('T')[0]!;
  const now = new Date().toISOString();

  const mockBookings: Booking[] = [
    {
      id: 'book-01',
      bookingReferenceNumber: 'LHM-2026-0929-0001',
      clientUid,
      clientName: 'Rahul Mehta',
      clientPhone: '+919820011223',
      clientEmail: 'rahul@example.com',
      lawyerUid: lawyerA,
      lawyerName: 'Adv. Rajeshwar Deshmukh',
      lawyerTitle: 'Senior Property Advocate',
      lawyerSanadNumber: 'MAH/4821/2012',
      serviceCategory: 'Property Registration & Conveyancing',
      caseDescription: 'Draft Sale Deed for 2BHK flat in Bandra',
      preferredDate: todayStr,
      preferredTimeSlot: '11:00-12:00',
      consultationMode: 'in_person_office',
      status: 'confirmed',
      unlockAmountInr: 1500,
      createdAt: now,
      updatedAt: now,
      timeline: [],
    },
    {
      id: 'book-02',
      bookingReferenceNumber: 'LHM-2026-0929-0002',
      clientUid,
      clientName: 'Pooja Sharma',
      clientPhone: '+919811122334',
      clientEmail: 'pooja@example.com',
      lawyerUid: lawyerA,
      lawyerName: 'Adv. Rajeshwar Deshmukh',
      lawyerTitle: 'Senior Property Advocate',
      lawyerSanadNumber: 'MAH/4821/2012',
      serviceCategory: 'Title Verification & Due Diligence',
      caseDescription: '30-year TSR for plot in Thane',
      preferredDate: todayStr,
      preferredTimeSlot: '14:00-15:00',
      consultationMode: 'video_call',
      status: 'pending_lawyer',
      unlockAmountInr: 2000,
      createdAt: now,
      updatedAt: now,
      timeline: [],
    },
    {
      id: 'book-03',
      bookingReferenceNumber: 'LHM-2026-0929-0003',
      clientUid: 'client-other',
      clientName: 'Kishore Varma',
      clientPhone: '+919877766554',
      clientEmail: 'kishore@example.com',
      lawyerUid: lawyerA,
      lawyerName: 'Adv. Rajeshwar Deshmukh',
      lawyerTitle: 'Senior Property Advocate',
      lawyerSanadNumber: 'MAH/4821/2012',
      serviceCategory: 'RERA Advisory & Disputes',
      caseDescription: 'MahaRERA builder delay complaint',
      preferredDate: '2026-09-10',
      preferredTimeSlot: '16:00-17:00',
      consultationMode: 'in_person_office',
      status: 'completed',
      unlockAmountInr: 1500,
      createdAt: '2026-09-10T10:00:00Z',
      updatedAt: '2026-09-10T17:00:00Z',
      timeline: [],
    },
    {
      id: 'book-04',
      bookingReferenceNumber: 'LHM-2026-0929-0004',
      clientUid: 'client-unlocked',
      clientName: 'Sunita Rao',
      clientPhone: '+919988776655',
      clientEmail: 'sunita@example.com',
      lawyerUid: lawyerA,
      lawyerName: 'Adv. Rajeshwar Deshmukh',
      lawyerTitle: 'Senior Property Advocate',
      lawyerSanadNumber: 'MAH/4821/2012',
      serviceCategory: 'Lease & Rent Agreements',
      caseDescription: 'Commercial lease drafting',
      preferredDate: '2026-10-01',
      preferredTimeSlot: '10:00-11:00',
      consultationMode: 'in_person_office',
      status: 'pending_payment',
      unlockAmountInr: 1000,
      createdAt: now,
      updatedAt: now,
      timeline: [],
    },
    {
      id: 'book-other-lawyer',
      bookingReferenceNumber: 'LHM-2026-0929-9999',
      clientUid: 'client-someone',
      clientName: 'Vikram Joshi',
      clientPhone: '+919123456789',
      clientEmail: 'vikram@example.com',
      lawyerUid: lawyerB,
      lawyerName: 'Adv. Priya Kulkarni',
      lawyerTitle: 'MahaRERA Counsel',
      lawyerSanadNumber: 'MAH/3190/2015',
      serviceCategory: 'RERA Advisory & Disputes',
      caseDescription: 'Redevelopment agreement vetting',
      preferredDate: todayStr,
      preferredTimeSlot: '12:00-13:00',
      consultationMode: 'in_person_office',
      status: 'confirmed',
      unlockAmountInr: 1200,
      createdAt: now,
      updatedAt: now,
      timeline: [],
    },
  ];

  beforeEach(() => {
    resetLawyerPortalStore();
    resetNotificationSystem();
    seedLawyerPortalBookings(mockBookings);
  });

  describe('1. Lawyer Dashboard Overview Aggregation', () => {
    it("should aggregate today's appointments, pending requests, and financial metrics accurately", async () => {
      const overview = await getLawyerDashboardOverview(lawyerA, mockBookings);

      expect(overview.metrics.todayAppointmentsCount).toBe(1); // book-01 is confirmed today
      expect(overview.metrics.pendingRequestsCount).toBe(1); // book-02 is pending_lawyer
      expect(overview.metrics.completedConsultationsCount).toBe(1); // book-03 is completed
      expect(overview.metrics.activeConsultationsCount).toBe(1); // book-01
      expect(overview.todayAppointments).toHaveLength(1);
      expect(overview.todayAppointments[0]!.id).toBe('book-01');
      expect(overview.pendingRequests).toHaveLength(1);
      expect(overview.pendingRequests[0]!.id).toBe('book-02');
      expect(overview.metrics.kycStatus).toBe('verified');
    });
  });

  describe('2. Booking Action Workflows & Lifecycle', () => {
    it('should allow advocate to accept a pending booking and emit LAWYER_ACCEPTED notification', async () => {
      const result = await acceptLawyerBooking(lawyerA, 'book-02');

      expect(result.success).toBe(true);
      expect(result.booking?.status).toBe('confirmed');

      const clientFeed = await getUserNotifications(clientUid, clientUid);
      expect(clientFeed.notifications.some((n) => n.type === 'LAWYER_ACCEPTED')).toBe(true);
      expect(getSentEmailSpool().length).toBeGreaterThan(0);
    });

    it('should reject decline without a valid reason', async () => {
      const result = await rejectLawyerBooking(lawyerA, 'book-02', '  ');
      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 5 characters');
    });

    it('should allow advocate to decline a booking with reason and emit LAWYER_REJECTED notification', async () => {
      const reason = 'High Court Bench hearing conflict';
      const result = await rejectLawyerBooking(lawyerA, 'book-02', reason);

      expect(result.success).toBe(true);
      expect(result.booking?.status).toBe('cancelled');
      expect(result.booking?.cancellationReason).toBe(reason);

      const clientFeed = await getUserNotifications(clientUid, clientUid);
      expect(clientFeed.notifications.some((n) => n.type === 'LAWYER_REJECTED')).toBe(true);
    });

    it('should update execution status through in_progress to completed', async () => {
      // 1. Confirmed -> In Progress
      const inProgressRes = await updateLawyerBookingStatus(lawyerA, 'book-01', 'in_progress');
      expect(inProgressRes.success).toBe(true);
      expect(inProgressRes.booking?.status).toBe('in_progress');

      // 2. In Progress -> Completed
      const completedRes = await updateLawyerBookingStatus(
        lawyerA,
        'book-01',
        'completed',
        'TSR report issued.'
      );
      expect(completedRes.success).toBe(true);
      expect(completedRes.booking?.status).toBe('completed');
    });

    it('should prevent unauthorized advocate from accepting or declining another advocate bookings', async () => {
      // Lawyer B tries to accept Lawyer A's booking
      const unauthAccept = await acceptLawyerBooking(lawyerB, 'book-02');
      expect(unauthAccept.success).toBe(false);
      expect(unauthAccept.error).toContain('Unauthorized');

      // Lawyer B tries to decline Lawyer A's booking
      const unauthReject = await rejectLawyerBooking(lawyerB, 'book-02', 'Reason note');
      expect(unauthReject.success).toBe(false);
      expect(unauthReject.error).toContain('Unauthorized');
    });
  });

  describe('3. Server-Side Earnings Calculation & Commission Deduction', () => {
    it('should compute exact 15% platform commission and net payouts', () => {
      const report = computeLawyerEarnings(lawyerA, mockBookings);

      // Total eligible: book-01 (1500) + book-03 (1500) = 3000
      expect(report.grossTotalInr).toBe(3000);
      expect(report.commissionRatePercentage).toBe(PLATFORM_COMMISSION_PERCENTAGE);
      expect(report.commissionRatePercentage).toBe(15);

      // 15% of 3000 = 450
      expect(report.totalCommissionInr).toBe(450);
      // Net = 3000 - 450 = 2550
      expect(report.netEarningsInr).toBe(2550);

      // book-01 is confirmed (pending payout: 1500 - 225 = 1275)
      expect(report.pendingBalanceInr).toBe(1275);
    });

    it('should provide daily, weekly, and monthly aggregations', async () => {
      const report = await getLawyerEarningsReport(lawyerA, mockBookings);

      expect(report.daily.grossInr).toBe(1500); // book-01 today
      expect(report.daily.netInr).toBe(1275);
      expect(report.weekly.grossInr).toBe(1500);
    });
  });

  describe('4. Client Privacy Protection & Data Masking', () => {
    it('should mask client phone for unverified/pending payment bookings', () => {
      const unverifiedBooking = mockBookings.find((b) => b.id === 'book-04')!;
      const sanitized = sanitizeClientInfoForLawyer(unverifiedBooking);

      // Client phone should be masked
      expect(sanitized.clientPhone).not.toBe('+919988776655');
      expect(sanitized.clientPhone).toContain('*****');
    });

    it('should reveal client phone for confirmed or unlocked bookings', () => {
      const confirmedBooking = mockBookings.find((b) => b.id === 'book-01')!;
      const sanitized = sanitizeClientInfoForLawyer(confirmedBooking);

      expect(sanitized.clientPhone).toBe('+919820011223');
    });
  });

  describe('5. Multi-Tenant Segregation', () => {
    it('should isolate bookings so lawyer A cannot see lawyer B consultations', async () => {
      const resA = await getLawyerBookings(lawyerA, undefined, mockBookings);
      expect(resA.bookings.every((b) => b.lawyerUid === lawyerA)).toBe(true);
      expect(resA.bookings.some((b) => b.id === 'book-other-lawyer')).toBe(false);

      const resB = await getLawyerBookings(lawyerB, undefined, mockBookings);
      expect(resB.bookings).toHaveLength(1);
      expect(resB.bookings[0]!.id).toBe('book-other-lawyer');
    });
  });
});
