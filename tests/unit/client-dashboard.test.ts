import { describe, it, expect, beforeEach } from 'vitest';
import type { Booking } from '@legalhub/types';
import {
  getClientDashboardOverview,
  toggleSaveLawyer,
  isLawyerSaved,
  getSavedLawyers,
  resetSavedLawyersStore,
} from '../../apps/web/src/lib/services/client-dashboard.service';
import { resetNotificationSystem } from '../../apps/web/src/lib/services/notifications/notification.service';
import { resetPaymentStore } from '../../apps/web/src/lib/services/payment.service';

describe('Phase 15: Client Dashboard Service & Overview Aggregations', () => {
  const clientUidA = 'client_mumbai_user_01';
  const clientUidB = 'client_mumbai_user_02';

  beforeEach(() => {
    resetSavedLawyersStore();
    resetNotificationSystem();
    resetPaymentStore();
  });

  describe('1. Dashboard Overview Metrics & Upcoming Appointment Resolution', () => {
    const mockBookings: Booking[] = [
      {
        id: 'b1',
        bookingReferenceNumber: 'LHM-001',
        clientUid: clientUidA,
        clientName: 'Rahul Mehta',
        clientPhone: '+919820011223',
        lawyerUid: 'lawyer-1',
        lawyerName: 'Adv. Rajesh Shinde',
        lawyerTitle: 'Senior Property Advocate',
        lawyerSanadNumber: 'MAH/4512/2012',
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Flat conveyance in Dadar',
        preferredDate: '2026-10-01',
        preferredTimeSlot: '11:00-12:00',
        consultationMode: 'in_person_office',
        status: 'confirmed',
        timeline: [],
        unlockAmountInr: 299,
        createdAt: '2026-09-15T10:00:00Z',
        updatedAt: '2026-09-15T10:30:00Z',
      },
      {
        id: 'b2',
        bookingReferenceNumber: 'LHM-002',
        clientUid: clientUidA,
        clientName: 'Rahul Mehta',
        clientPhone: '+919820011223',
        lawyerUid: 'lawyer-2',
        lawyerName: 'Adv. Priya Sharma',
        lawyerTitle: 'RERA Litigation Advocate',
        lawyerSanadNumber: 'MAH/8921/2015',
        serviceCategory: 'RERA Complaints & Builder Delay',
        caseDescription: 'Possession delay in Andheri',
        preferredDate: '2026-09-10',
        preferredTimeSlot: '15:00-16:00',
        consultationMode: 'video_call',
        status: 'completed',
        timeline: [],
        unlockAmountInr: 299,
        createdAt: '2026-09-08T10:00:00Z',
        updatedAt: '2026-09-10T16:00:00Z',
      },
      {
        id: 'b3',
        bookingReferenceNumber: 'LHM-003',
        clientUid: clientUidB, // belongs to user B!
        clientName: 'Sneha Patil',
        clientPhone: '+919820099887',
        lawyerUid: 'lawyer-3',
        lawyerName: 'Adv. Amit Kulkarni',
        lawyerTitle: 'Title Verification Specialist',
        lawyerSanadNumber: 'MAH/3321/2018',
        serviceCategory: '7/12 Extract & Title Verification',
        caseDescription: 'Land verification in Thane',
        preferredDate: '2026-10-05',
        preferredTimeSlot: '16:00-17:00',
        consultationMode: 'phone_call',
        status: 'pending_payment',
        timeline: [],
        unlockAmountInr: 299,
        createdAt: '2026-09-16T10:00:00Z',
        updatedAt: '2026-09-16T10:00:00Z',
      },
    ];

    it('should aggregate metrics and filter bookings strictly for the querying client', async () => {
      const overviewA = await getClientDashboardOverview(clientUidA, mockBookings);

      expect(overviewA.recentBookings.length).toBe(2);
      expect(overviewA.recentBookings.every((b) => b.clientUid === clientUidA)).toBe(true);

      expect(overviewA.metrics.activeBookingsCount).toBe(1); // confirmed b1
      expect(overviewA.metrics.completedBookingsCount).toBe(1); // completed b2
      expect(overviewA.upcomingBooking).toBeDefined();
      expect(overviewA.upcomingBooking?.id).toBe('b1');
    });

    it('should isolate User B dashboard overview from User A bookings', async () => {
      const overviewB = await getClientDashboardOverview(clientUidB, mockBookings);

      expect(overviewB.recentBookings.length).toBe(1);
      expect(overviewB.recentBookings[0]!.id).toBe('b3');
      expect(overviewB.metrics.activeBookingsCount).toBe(1); // pending_payment
      expect(overviewB.metrics.completedBookingsCount).toBe(0);
    });
  });

  describe('2. Saved Advocates Bookmarking Management', () => {
    it('should toggle saving and unsaving advocates per user', async () => {
      expect(isLawyerSaved(clientUidA, 'lawyer-1')).toBe(false);

      // Bookmark lawyer-1
      const saveRes1 = await toggleSaveLawyer(clientUidA, 'lawyer-1');
      expect(saveRes1.success).toBe(true);
      expect(saveRes1.isSaved).toBe(true);
      expect(isLawyerSaved(clientUidA, 'lawyer-1')).toBe(true);

      // Un-bookmark lawyer-1
      const saveRes2 = await toggleSaveLawyer(clientUidA, 'lawyer-1');
      expect(saveRes2.success).toBe(true);
      expect(saveRes2.isSaved).toBe(false);
      expect(isLawyerSaved(clientUidA, 'lawyer-1')).toBe(false);
    });

    it('should retrieve bookmarked lawyer profiles for client', async () => {
      await toggleSaveLawyer(clientUidA, 'lawyer-1');

      const savedList = await getSavedLawyers(clientUidA);
      expect(savedList.success).toBe(true);
      expect(savedList.lawyers.length).toBe(1);
      expect(savedList.lawyers[0]!.id).toBe('lawyer-1');
      expect(savedList.lawyers[0]!.fullName).toContain('Deshmukh');

      // User B has no saved lawyers
      const savedListB = await getSavedLawyers(clientUidB);
      expect(savedListB.lawyers.length).toBe(0);
    });
  });
});
