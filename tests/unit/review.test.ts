import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkReviewEligibility,
  createReview,
  updateReview,
  calculateAggregateRating,
  getLawyerReviews,
  resetReviewStore,
  seedReviewBookingsStore,
  seedReviewsStore,
} from '../../apps/web/src/lib/services/review.service';
import type { Booking, LawyerReview } from '@legalhub/types';

describe('PHASE 18: Production Review & Rating System', () => {
  const clientA = 'usr_client_rahul';
  const clientB = 'usr_client_pooja';
  const lawyerUid = 'usr_lawyer_deshmukh';

  const completedBooking: Booking = {
    id: 'bk_comp_001',
    bookingReferenceNumber: 'LHM-2026-COMP-0001',
    clientUid: clientA,
    clientName: 'Rahul Mehta',
    clientPhone: '+919820011223',
    lawyerUid,
    lawyerName: 'Adv. Rajeshwar Deshmukh',
    lawyerSanadNumber: 'MAH/4821/2012',
    serviceCategory: 'Property Registration & Conveyancing',
    caseDescription: 'Title deed drafting and vetting',
    preferredDate: '2026-09-10',
    preferredTimeSlot: '11:00-12:00',
    consultationMode: 'in_person_office',
    status: 'completed',
    unlockAmountInr: 299,
    timeline: [],
    uploadedDocumentIds: [],
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-10T12:00:00Z',
  };

  const inProgressBooking: Booking = {
    id: 'bk_inprog_002',
    bookingReferenceNumber: 'LHM-2026-PROG-0002',
    clientUid: clientA,
    clientName: 'Rahul Mehta',
    clientPhone: '+919820011223',
    lawyerUid,
    lawyerName: 'Adv. Rajeshwar Deshmukh',
    lawyerSanadNumber: 'MAH/4821/2012',
    serviceCategory: 'RERA Advisory & Disputes',
    caseDescription: 'Ongoing dispute review',
    preferredDate: '2026-09-15',
    preferredTimeSlot: '14:00-15:00',
    consultationMode: 'video_call',
    status: 'in_progress',
    unlockAmountInr: 299,
    timeline: [],
    uploadedDocumentIds: [],
    createdAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-09-15T10:00:00Z',
  };

  const cancelledBooking: Booking = {
    id: 'bk_canc_003',
    bookingReferenceNumber: 'LHM-2026-CANC-0003',
    clientUid: clientA,
    clientName: 'Rahul Mehta',
    clientPhone: '+919820011223',
    lawyerUid,
    lawyerName: 'Adv. Rajeshwar Deshmukh',
    lawyerSanadNumber: 'MAH/4821/2012',
    serviceCategory: 'Lease & Rent Agreements',
    caseDescription: 'Cancelled appointment',
    preferredDate: '2026-09-12',
    preferredTimeSlot: '16:00-17:00',
    consultationMode: 'in_person_office',
    status: 'cancelled',
    unlockAmountInr: 299,
    timeline: [],
    uploadedDocumentIds: [],
    createdAt: '2026-09-12T10:00:00Z',
    updatedAt: '2026-09-12T10:00:00Z',
  };

  beforeEach(() => {
    resetReviewStore();
    seedReviewBookingsStore([completedBooking, inProgressBooking, cancelledBooking]);
  });

  describe('1. Review Eligibility & Anti-Abuse Checks', () => {
    it('should confirm eligibility for a client with a completed booking', async () => {
      const result = await checkReviewEligibility(clientA, 'bk_comp_001');

      expect(result.isEligible).toBe(true);
      expect(result.bookingId).toBe('bk_comp_001');
      expect(result.lawyerUid).toBe(lawyerUid);
    });

    it('should reject review eligibility for non-completed bookings', async () => {
      // In progress
      const inProgRes = await checkReviewEligibility(clientA, 'bk_inprog_002');
      expect(inProgRes.isEligible).toBe(false);
      expect(inProgRes.reason).toContain('only permitted for completed consultations');

      // Cancelled
      const cancRes = await checkReviewEligibility(clientA, 'bk_canc_003');
      expect(cancRes.isEligible).toBe(false);
      expect(cancRes.reason).toContain('only permitted for completed consultations');
    });

    it('should reject review eligibility when requesting client does not own the booking', async () => {
      const result = await checkReviewEligibility(clientB, 'bk_comp_001');

      expect(result.isEligible).toBe(false);
      expect(result.reason).toContain('Unauthorized');
    });

    it('should prevent duplicate reviews for the same booking', async () => {
      // Submit first review
      const firstReview = await createReview(clientA, 'Rahul Mehta', {
        bookingId: 'bk_comp_001',
        rating: 5,
        reviewTitle: 'Exceptional Guidance',
        reviewComment: 'Advocate solved our Bandra flat registry issue quickly.',
      });

      expect(firstReview.success).toBe(true);

      // Check eligibility again
      const eligibilityAfter = await checkReviewEligibility(clientA, 'bk_comp_001');
      expect(eligibilityAfter.isEligible).toBe(false);
      expect(eligibilityAfter.reason).toContain('already been submitted');

      // Attempt second creation
      const duplicateRes = await createReview(clientA, 'Rahul Mehta', {
        bookingId: 'bk_comp_001',
        rating: 4,
      });

      expect(duplicateRes.success).toBe(false);
      expect(duplicateRes.error).toContain('already been submitted');
    });
  });

  describe('2. Review Creation & Data Integrity', () => {
    it('should create a verified review and automatically compute aggregate ratings', async () => {
      const res = await createReview(clientA, 'Rahul Mehta', {
        bookingId: 'bk_comp_001',
        rating: 5,
        reviewTitle: 'Outstanding Property Knowledge',
        reviewComment: 'Extremely detailed explanation of RERA rules.',
      });

      expect(res.success).toBe(true);
      expect(res.review).toBeDefined();
      expect(res.review?.isVerifiedClient).toBe(true);
      expect(res.review?.status).toBe('published');
      expect(res.review?.rating).toBe(5);
      expect(res.review?.lawyerUid).toBe(lawyerUid);
      expect(res.review?.clientDisplayName).toBe('Rahul Mehta');

      // Check aggregate summary returned
      expect(res.aggregateSummary).toBeDefined();
      expect(res.aggregateSummary?.totalReviews).toBe(1);
      expect(res.aggregateSummary?.averageRating).toBe(5.0);
      expect(res.aggregateSummary?.breakdown[5]).toBe(1);
    });

    it('should reject invalid ratings outside 1-5 integer bounds', async () => {
      const resZero = await createReview(clientA, 'Rahul', {
        bookingId: 'bk_comp_001',
        rating: 0,
      });
      expect(resZero.success).toBe(false);

      const resOver = await createReview(clientA, 'Rahul', {
        bookingId: 'bk_comp_001',
        rating: 6,
      });
      expect(resOver.success).toBe(false);
    });
  });

  describe('3. Aggregate Rating Calculation Engine', () => {
    it('should handle zero reviews correctly without NaN or division by zero', () => {
      const summary = calculateAggregateRating([]);

      expect(summary.averageRating).toBe(0);
      expect(summary.totalReviews).toBe(0);
      expect(summary.breakdown[5]).toBe(0);
      expect(summary.breakdown[1]).toBe(0);
    });

    it('should accurately calculate weighted average rating and 1-5 breakdown from real reviews', () => {
      const mockReviews: LawyerReview[] = [
        {
          id: 'rev_1',
          bookingId: 'bk_1',
          lawyerUid,
          clientUid: 'user_1',
          clientDisplayName: 'User 1',
          rating: 5,
          status: 'published',
          isVerifiedClient: true,
          createdAt: '2026-09-01T10:00:00Z',
          updatedAt: '2026-09-01T10:00:00Z',
        },
        {
          id: 'rev_2',
          bookingId: 'bk_2',
          lawyerUid,
          clientUid: 'user_2',
          clientDisplayName: 'User 2',
          rating: 5,
          status: 'published',
          isVerifiedClient: true,
          createdAt: '2026-09-02T10:00:00Z',
          updatedAt: '2026-09-02T10:00:00Z',
        },
        {
          id: 'rev_3',
          bookingId: 'bk_3',
          lawyerUid,
          clientUid: 'user_3',
          clientDisplayName: 'User 3',
          rating: 4,
          status: 'published',
          isVerifiedClient: true,
          createdAt: '2026-09-03T10:00:00Z',
          updatedAt: '2026-09-03T10:00:00Z',
        },
        {
          id: 'rev_4',
          bookingId: 'bk_4',
          lawyerUid,
          clientUid: 'user_4',
          clientDisplayName: 'User 4',
          rating: 3,
          status: 'published',
          isVerifiedClient: true,
          createdAt: '2026-09-04T10:00:00Z',
          updatedAt: '2026-09-04T10:00:00Z',
        },
        {
          id: 'rev_hidden',
          bookingId: 'bk_5',
          lawyerUid,
          clientUid: 'user_5',
          clientDisplayName: 'User 5',
          rating: 1,
          status: 'hidden', // Should be excluded
          isVerifiedClient: true,
          createdAt: '2026-09-05T10:00:00Z',
          updatedAt: '2026-09-05T10:00:00Z',
        },
      ];

      const summary = calculateAggregateRating(mockReviews);

      // Published: (5 + 5 + 4 + 3) / 4 = 17 / 4 = 4.25 => 4.3 rounded to 1 decimal
      expect(summary.totalReviews).toBe(4);
      expect(summary.averageRating).toBe(4.3);
      expect(summary.breakdown[5]).toBe(2);
      expect(summary.breakdown[4]).toBe(1);
      expect(summary.breakdown[3]).toBe(1);
      expect(summary.breakdown[2]).toBe(0);
      expect(summary.breakdown[1]).toBe(0);
    });
  });

  describe('4. Review Modification & Author Authorization', () => {
    it('should allow author to update their review and recompute aggregate', async () => {
      const created = await createReview(clientA, 'Rahul Mehta', {
        bookingId: 'bk_comp_001',
        rating: 4,
        reviewComment: 'Initial review',
      });

      expect(created.success).toBe(true);
      const reviewId = created.review!.id;

      // Update to 5 stars
      const updated = await updateReview(clientA, reviewId, {
        rating: 5,
        reviewComment: 'Updated after full conveyance deed registered.',
      });

      expect(updated.success).toBe(true);
      expect(updated.review?.rating).toBe(5);
      expect(updated.review?.reviewComment).toContain('Updated after full');
      expect(updated.aggregateSummary?.averageRating).toBe(5.0);
    });

    it('should reject review modification by an unauthorized user', async () => {
      const created = await createReview(clientA, 'Rahul Mehta', {
        bookingId: 'bk_comp_001',
        rating: 4,
      });

      const reviewId = created.review!.id;

      // Client B attempts to edit Client A's review
      const unauthRes = await updateReview(clientB, reviewId, {
        rating: 1,
        reviewComment: 'Malicious modification',
      });

      expect(unauthRes.success).toBe(false);
      expect(unauthRes.error).toContain('Unauthorized');
    });
  });

  describe('5. Advocate Review Retrieval & Feed', () => {
    it('should retrieve paginated reviews sorted newest first for lawyer profile', async () => {
      // Seed reviews
      seedReviewsStore([
        {
          id: 'rev_old',
          bookingId: 'bk_old',
          lawyerUid,
          clientUid: 'user_old',
          clientDisplayName: 'Old Client',
          rating: 4,
          status: 'published',
          isVerifiedClient: true,
          createdAt: '2026-08-01T10:00:00Z',
          updatedAt: '2026-08-01T10:00:00Z',
        },
        {
          id: 'rev_new',
          bookingId: 'bk_new',
          lawyerUid,
          clientUid: 'user_new',
          clientDisplayName: 'New Client',
          rating: 5,
          status: 'published',
          isVerifiedClient: true,
          createdAt: '2026-09-01T10:00:00Z',
          updatedAt: '2026-09-01T10:00:00Z',
        },
      ]);

      const data = await getLawyerReviews(lawyerUid);

      expect(data.total).toBe(2);
      expect(data.reviews).toHaveLength(2);
      expect(data.reviews[0]!.id).toBe('rev_new'); // Newest first
      expect(data.reviews[1]!.id).toBe('rev_old');
      expect(data.aggregate.totalReviews).toBe(2);
      expect(data.aggregate.averageRating).toBe(4.5);
    });
  });
});
