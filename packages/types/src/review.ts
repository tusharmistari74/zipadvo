import { BaseEntity } from './common';

export type ReviewStatus = 'pending_moderation' | 'published' | 'hidden' | 'flagged';

export interface LawyerReview extends BaseEntity {
  id: string;
  bookingId: string;
  lawyerUid: string;
  clientUid: string;
  clientDisplayName: string;
  rating: number; // 1 to 5 stars (integer)
  reviewTitle?: string;
  reviewComment?: string;
  serviceCategory?: string;
  status: ReviewStatus;
  isVerifiedClient: boolean;
  moderationNotes?: string;
}

export interface ReviewEligibilityResult {
  isEligible: boolean;
  reason?: string;
  bookingId: string;
  lawyerUid?: string;
  lawyerName?: string;
  serviceCategory?: string;
  completedAt?: string;
  existingReviewId?: string;
}

export interface CreateReviewPayload {
  bookingId: string;
  rating: number; // 1 to 5
  reviewTitle?: string;
  reviewComment?: string;
}

export interface UpdateReviewPayload {
  rating?: number; // 1 to 5
  reviewTitle?: string;
  reviewComment?: string;
}

export interface LawyerRatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface AggregateRatingSummary {
  averageRating: number; // e.g. 4.8
  totalReviews: number;
  breakdown: LawyerRatingBreakdown;
}
