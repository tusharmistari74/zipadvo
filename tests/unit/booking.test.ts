import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firestore
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    doc: vi.fn((_db, coll, id) => ({ id, path: `${coll}/${id}` })),
    getDoc: vi.fn(async () => ({
      exists: () => false,
      data: () => null,
    })),
    setDoc: vi.fn(async () => {}),
    addDoc: vi.fn(async () => ({ id: 'mock-audit-id' })),
    collection: vi.fn((_db, coll) => ({ path: coll })),
    getDocs: vi.fn(async () => ({ docs: [], empty: true })),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    runTransaction: vi.fn(async (_db, updateFunction) => {
      const mockTransaction = {
        get: vi.fn(async () => ({ exists: () => false, data: () => null })),
        set: vi.fn(),
      };
      return updateFunction(mockTransaction);
    }),
  };
});

import {
  createBooking,
  getBookingById,
  transitionBookingStatus,
  cancelBooking,
  canTransitionBookingStatus,
  generateBookingReferenceNumber,
  listUserBookings,
} from '../../apps/web/src/lib/services/booking.service';
import {
  createBookingSchema,
  cancelBookingSchema,
} from '../../packages/validation/src/booking.schema';

describe('Production Booking Engine & State Machine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Booking Reference Number Generator', () => {
    it('should generate properly formatted reference numbers', () => {
      const ref1 = generateBookingReferenceNumber();
      const ref2 = generateBookingReferenceNumber();

      expect(ref1).toMatch(/^LHM-\d{4}-[A-F0-9]{5}$/);
      expect(ref2).toMatch(/^LHM-\d{4}-[A-F0-9]{5}$/);
      expect(ref1).not.toBe(ref2);
    });
  });

  describe('Validation Schemas', () => {
    it('should validate complete valid booking input', () => {
      const valid = {
        lawyerUid: 'lawyer-1',
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Need 30-year title search and sale deed drafting for apartment in Bandra West.',
        preferredDate: '2026-09-22',
        preferredTimeSlot: '11:00-12:00',
        consultationMode: 'in_person_office' as const,
        clientName: 'Sunil Gavaskar',
        clientPhone: '+919820011223',
        clientEmail: 'sunil@example.com',
        uploadedDocumentIds: [],
      };

      const result = createBookingSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject booking input with short case description or invalid phone', () => {
      const invalid = {
        lawyerUid: 'lawyer-1',
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'help', // Too short (< 10)
        preferredDate: '2026-09-22',
        preferredTimeSlot: '11:00-12:00',
        consultationMode: 'in_person_office' as const,
        clientName: 'S',
        clientPhone: '12345', // Invalid phone
      };

      const result = createBookingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate cancellation schema requiring minimum 5 characters', () => {
      expect(cancelBookingSchema.safeParse({ bookingId: 'b1', reason: 'Rescheduling' }).success).toBe(true);
      expect(cancelBookingSchema.safeParse({ bookingId: 'b1', reason: 'no' }).success).toBe(false);
    });
  });

  describe('State Machine Rules & Transitions', () => {
    it('should permit valid linear state transitions', () => {
      // pending_payment -> pending_lawyer (client/system)
      expect(canTransitionBookingStatus('pending_payment', 'pending_lawyer', 'client').allowed).toBe(true);
      expect(canTransitionBookingStatus('pending_payment', 'pending_lawyer', 'system').allowed).toBe(true);

      // pending_lawyer -> confirmed (lawyer)
      expect(canTransitionBookingStatus('pending_lawyer', 'confirmed', 'lawyer').allowed).toBe(true);

      // confirmed -> in_progress (lawyer)
      expect(canTransitionBookingStatus('confirmed', 'in_progress', 'lawyer').allowed).toBe(true);

      // in_progress -> completed (lawyer)
      expect(canTransitionBookingStatus('in_progress', 'completed', 'lawyer').allowed).toBe(true);
    });

    it('should forbid arbitrary state jumps', () => {
      // Cannot jump from pending_payment straight to completed
      expect(canTransitionBookingStatus('pending_payment', 'completed', 'client').allowed).toBe(false);

      // Cannot jump from pending_payment to in_progress
      expect(canTransitionBookingStatus('pending_payment', 'in_progress', 'lawyer').allowed).toBe(false);
    });

    it('should forbid transitions from terminal states', () => {
      // Completed is terminal
      expect(canTransitionBookingStatus('completed', 'in_progress', 'lawyer').allowed).toBe(false);
      expect(canTransitionBookingStatus('completed', 'cancelled', 'client').allowed).toBe(false);

      // Cancelled is terminal
      expect(canTransitionBookingStatus('cancelled', 'confirmed', 'admin').allowed).toBe(false);
    });

    it('should forbid clients from confirming their own bookings', () => {
      // Client cannot confirm their own slot (only lawyer or admin can confirm)
      const res = canTransitionBookingStatus('pending_lawyer', 'confirmed', 'client');
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Permission denied');
    });

    it('should allow admin to resolve disputes', () => {
      expect(canTransitionBookingStatus('disputed', 'completed', 'admin').allowed).toBe(true);
      expect(canTransitionBookingStatus('disputed', 'cancelled', 'admin').allowed).toBe(true);
    });
  });

  describe('Booking Creation & Concurrency Lifecycle', () => {
    it('should create booking in pending_payment status with timeline event', async () => {
      const res = await createBooking(
        {
          lawyerUid: 'lawyer-1',
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Need review of Deemed Conveyance deed and society NOC documents.',
          preferredDate: '2026-09-24',
          preferredTimeSlot: '10:00-11:00',
          consultationMode: 'in_person_office',
          clientName: 'Aarav Patel',
          clientPhone: '+919820123456',
        },
        'client-user-123'
      );

      expect(res.success).toBe(true);
      expect(res.booking).toBeDefined();
      expect(res.booking?.status).toBe('pending_payment');
      expect(res.booking?.bookingReferenceNumber).toMatch(/^LHM-\d{4}-[A-F0-9]{5}$/);
      expect(res.booking?.timeline.length).toBe(1);
      expect(res.booking?.timeline[0].status).toBe('pending_payment');
      expect(res.booking?.timeline[0].actorRole).toBe('client');
    });

    it('should transition booking across full lifecycle and append timeline entries', async () => {
      // 1. Create Booking
      const createRes = await createBooking(
        {
          lawyerUid: 'lawyer-1',
          serviceCategory: 'Title Verification & Due Diligence',
          caseDescription: 'Need 30-year title search for an apartment in Nariman Point.',
          preferredDate: '2026-09-25',
          preferredTimeSlot: '14:00-15:00',
          consultationMode: 'video_call',
          clientName: 'Meera Deshmukh',
          clientPhone: '+919819987654',
        },
        'client-meera'
      );

      const bookingId = createRes.booking!.id;

      // 2. Client pays -> pending_lawyer
      const payRes = await transitionBookingStatus({
        bookingId,
        targetStatus: 'pending_lawyer',
        actorUid: 'client-meera',
        actorRole: 'client',
        notes: '₹299 platform unlock fee paid successfully',
      });
      expect(payRes.success).toBe(true);
      expect(payRes.booking?.status).toBe('pending_lawyer');
      expect(payRes.booking?.timeline.length).toBe(2);

      // 3. Lawyer confirms -> confirmed
      const confirmRes = await transitionBookingStatus({
        bookingId,
        targetStatus: 'confirmed',
        actorUid: 'lawyer-1',
        actorRole: 'lawyer',
        notes: 'Advocate accepted and confirmed consultation slot',
      });
      expect(confirmRes.success).toBe(true);
      expect(confirmRes.booking?.status).toBe('confirmed');
      expect(confirmRes.booking?.timeline.length).toBe(3);

      // 4. Consultation starts -> in_progress
      const startRes = await transitionBookingStatus({
        bookingId,
        targetStatus: 'in_progress',
        actorUid: 'lawyer-1',
        actorRole: 'lawyer',
      });
      expect(startRes.success).toBe(true);
      expect(startRes.booking?.status).toBe('in_progress');

      // 5. Consultation finishes -> completed
      const completeRes = await transitionBookingStatus({
        bookingId,
        targetStatus: 'completed',
        actorUid: 'lawyer-1',
        actorRole: 'lawyer',
        notes: 'Consultation concluded and advice provided',
      });
      expect(completeRes.success).toBe(true);
      expect(completeRes.booking?.status).toBe('completed');
      expect(completeRes.booking?.timeline.length).toBe(5);
    });

    it('should support cancellation with reason and slot release', async () => {
      const createRes = await createBooking(
        {
          lawyerUid: 'lawyer-1',
          serviceCategory: 'RERA Advisory & Disputes',
          caseDescription: 'Need advice on delayed possession penalty claim against builder.',
          preferredDate: '2026-09-28',
          preferredTimeSlot: '11:00-12:00',
          consultationMode: 'phone_call',
          clientName: 'Nitin Kadam',
          clientPhone: '+919833344556',
        },
        'client-nitin'
      );

      const bookingId = createRes.booking!.id;

      const cancelRes = await cancelBooking({
        bookingId,
        actorUid: 'client-nitin',
        actorRole: 'client',
        reason: 'Client urgent travel conflict',
      });

      expect(cancelRes.success).toBe(true);
      expect(cancelRes.booking?.status).toBe('cancelled');
      expect(cancelRes.booking?.cancellationReason).toBe('Client urgent travel conflict');
      expect(cancelRes.booking?.cancellationDetails?.cancelledByUid).toBe('client-nitin');
    });
  });

  describe('Security & Multi-Tenant Authorization', () => {
    it('should allow clients to access only their own bookings', async () => {
      const createRes = await createBooking(
        {
          lawyerUid: 'lawyer-1',
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Property title search for land in Thane.',
          preferredDate: '2026-09-27',
          preferredTimeSlot: '11:00-12:00',
          consultationMode: 'in_person_office',
          clientName: 'Owner User',
          clientPhone: '+919820011223',
        },
        'owner-uid'
      );

      const bookingId = createRes.booking!.id;

      // Owner accesses -> Allowed
      const ownerRes = await getBookingById(bookingId, 'owner-uid', 'client');
      expect(ownerRes.success).toBe(true);
      expect(ownerRes.booking?.id).toBe(bookingId);

      // Different client accesses -> Denied (403)
      const strangerRes = await getBookingById(bookingId, 'stranger-uid', 'client');
      expect(strangerRes.success).toBe(false);
      expect(strangerRes.error).toContain('Access Denied');

      // Assigned lawyer accesses -> Allowed
      const lawyerRes = await getBookingById(bookingId, 'lawyer-1', 'lawyer');
      expect(lawyerRes.success).toBe(true);

      // Admin accesses -> Allowed
      const adminRes = await getBookingById(bookingId, 'admin-1', 'admin');
      expect(adminRes.success).toBe(true);
    });
  });
});
