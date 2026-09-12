import { BaseEntity } from './common';

export type ReviewStatus = 'pending_moderation' | 'published' | 'hidden';

export interface LawyerReview extends BaseEntity {
  id: string;
  bookingId: string;
  lawyerUid: string;
  clientUid: string;
  clientDisplayName: string;
  rating: number; // 1 to 5 stars
  reviewTitle: string;
  reviewComment: string;
  status: ReviewStatus;
  isVerifiedClient: boolean;
}
