import type {
  LawyerReview,
  ReviewEligibilityResult,
  CreateReviewPayload,
  UpdateReviewPayload,
  AggregateRatingSummary,
  LawyerRatingBreakdown,
  Booking,
} from '@legalhub/types';
import { logger } from '@legalhub/utils';
import { emitNotificationEvent } from './notifications/notification.service';

// In-memory review and booking registry for deterministic execution and testability
let reviewsStore: Record<string, LawyerReview> = {};
let bookingsStoreRef: Record<string, Booking> = {};

export function resetReviewStore(): void {
  reviewsStore = {};
  bookingsStoreRef = {};
}

export function seedReviewsStore(reviews: LawyerReview[]): void {
  reviews.forEach((r) => {
    reviewsStore[r.id] = { ...r };
  });
}

export function seedReviewBookingsStore(bookings: Booking[]): void {
  bookings.forEach((b) => {
    bookingsStoreRef[b.id] = { ...b };
  });
}

/**
 * Calculates the exact aggregate rating and 1-5 star breakdown distribution
 * Strictly computes from actual provided reviews with zero synthetic inflation.
 */
export function calculateAggregateRating(reviews: LawyerReview[]): AggregateRatingSummary {
  const publishedReviews = reviews.filter((r) => r.status === 'published');
  const total = publishedReviews.length;

  const breakdown: LawyerRatingBreakdown = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  if (total === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      breakdown,
    };
  }

  let ratingSum = 0;
  for (const rev of publishedReviews) {
    const star = Math.max(1, Math.min(5, Math.round(rev.rating))) as 1 | 2 | 3 | 4 | 5;
    breakdown[star] = (breakdown[star] || 0) + 1;
    ratingSum += rev.rating;
  }

  const averageRating = Number((ratingSum / total).toFixed(1));

  return {
    averageRating,
    totalReviews: total,
    breakdown,
  };
}

/**
 * Checks whether a client is strictly eligible to review a consultation booking
 * Anti-Abuse Rules:
 * 1. Booking must exist.
 * 2. Booking must belong to the requesting client.
 * 3. Booking status must strictly be 'completed'.
 * 4. Duplicate review prevention: A booking cannot be reviewed more than once.
 */
export async function checkReviewEligibility(
  clientUid: string,
  bookingId: string,
  customBookings?: Record<string, Booking>,
  customReviews?: Record<string, LawyerReview>
): Promise<ReviewEligibilityResult> {
  const currentBookings = customBookings || bookingsStoreRef;
  const currentReviews = customReviews || reviewsStore;

  const booking = currentBookings[bookingId];

  if (!booking) {
    return {
      isEligible: false,
      reason: 'Booking not found',
      bookingId,
    };
  }

  if (booking.clientUid !== clientUid) {
    return {
      isEligible: false,
      reason: 'Unauthorized: Booking does not belong to this client account',
      bookingId,
    };
  }

  if (booking.status !== 'completed') {
    return {
      isEligible: false,
      reason: `Reviews are only permitted for completed consultations. Current status: ${booking.status}`,
      bookingId,
      lawyerUid: booking.lawyerUid,
      lawyerName: booking.lawyerName,
      serviceCategory: booking.serviceCategory,
    };
  }

  // Check if a review has already been submitted for this booking
  const existingReview = Object.values(currentReviews).find((r) => r.bookingId === bookingId);
  if (existingReview) {
    return {
      isEligible: false,
      reason: 'A review has already been submitted for this consultation booking',
      bookingId,
      existingReviewId: existingReview.id,
      lawyerUid: booking.lawyerUid,
      lawyerName: booking.lawyerName,
    };
  }

  return {
    isEligible: true,
    bookingId,
    lawyerUid: booking.lawyerUid,
    lawyerName: booking.lawyerName,
    serviceCategory: booking.serviceCategory,
    completedAt: booking.updatedAt || booking.createdAt,
  };
}

/**
 * Submits a new verified client review for a completed consultation
 */
export async function createReview(
  clientUid: string,
  clientDisplayName: string,
  payload: CreateReviewPayload,
  customBookings?: Record<string, Booking>,
  customReviews?: Record<string, LawyerReview>
): Promise<{
  success: boolean;
  review?: LawyerReview;
  aggregateSummary?: AggregateRatingSummary;
  error?: string;
}> {
  const currentBookings = customBookings || bookingsStoreRef;
  const currentReviews = customReviews || reviewsStore;

  // 1. Enforce strict anti-abuse eligibility check
  const eligibility = await checkReviewEligibility(
    clientUid,
    payload.bookingId,
    currentBookings,
    currentReviews
  );

  if (!eligibility.isEligible) {
    logger.warn('Review creation rejected by anti-abuse check', {
      clientUid,
      bookingId: payload.bookingId,
      reason: eligibility.reason,
    });
    return {
      success: false,
      error: eligibility.reason || 'Client is not eligible to review this booking',
    };
  }

  const booking = currentBookings[payload.bookingId]!;

  // 2. Validate rating range (1 - 5 stars)
  if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
    return {
      success: false,
      error: 'Rating must be an integer between 1 and 5 stars',
    };
  }

  const now = new Date().toISOString();
  const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const review: LawyerReview = {
    id: reviewId,
    bookingId: payload.bookingId,
    lawyerUid: booking.lawyerUid,
    clientUid,
    clientDisplayName: clientDisplayName.trim() || 'Verified Client',
    rating: Math.round(payload.rating),
    reviewTitle: payload.reviewTitle?.trim() || undefined,
    reviewComment: payload.reviewComment?.trim() || undefined,
    serviceCategory: booking.serviceCategory,
    status: 'published',
    isVerifiedClient: true,
    createdAt: now,
    updatedAt: now,
  };

  // 3. Persist review
  currentReviews[reviewId] = review;

  // 4. Compute updated aggregate rating for target lawyer
  const lawyerReviews = Object.values(currentReviews).filter(
    (r) => r.lawyerUid === booking.lawyerUid && r.status === 'published'
  );
  const aggregateSummary = calculateAggregateRating(lawyerReviews);

  logger.info('Verified advocate review published', {
    reviewId,
    lawyerUid: booking.lawyerUid,
    clientUid,
    rating: review.rating,
    newAverageRating: aggregateSummary.averageRating,
  });

  // 5. Emit notification event for advocate
  try {
    await emitNotificationEvent({
      type: 'BOOKING_CREATED', // System activity notification
      recipientUid: booking.lawyerUid,
      title: 'New Client Review Received ⭐',
      body: `${review.clientDisplayName} rated your consultation ${review.rating}/5 stars.`,
      metadata: {
        reviewId,
        bookingId: booking.id,
        rating: review.rating,
      },
    });
  } catch (err) {
    logger.warn('Failed to emit review notification event', { err });
  }

  return {
    success: true,
    review,
    aggregateSummary,
  };
}

/**
 * Updates an existing review with strict author-only authorization
 */
export async function updateReview(
  clientUid: string,
  reviewId: string,
  payload: UpdateReviewPayload,
  customReviews?: Record<string, LawyerReview>
): Promise<{
  success: boolean;
  review?: LawyerReview;
  aggregateSummary?: AggregateRatingSummary;
  error?: string;
}> {
  const currentReviews = customReviews || reviewsStore;
  const review = currentReviews[reviewId];

  if (!review) {
    return { success: false, error: 'Review not found' };
  }

  // Anti-abuse: Strict ownership authorization
  if (review.clientUid !== clientUid) {
    logger.warn('Unauthorized attempt to modify review', { clientUid, reviewId });
    return { success: false, error: 'Unauthorized: You can only edit your own reviews' };
  }

  if (payload.rating !== undefined) {
    if (payload.rating < 1 || payload.rating > 5) {
      return { success: false, error: 'Rating must be an integer between 1 and 5 stars' };
    }
    review.rating = Math.round(payload.rating);
  }

  if (payload.reviewTitle !== undefined) {
    review.reviewTitle = payload.reviewTitle.trim() || undefined;
  }

  if (payload.reviewComment !== undefined) {
    review.reviewComment = payload.reviewComment.trim() || undefined;
  }

  review.updatedAt = new Date().toISOString();
  currentReviews[reviewId] = review;

  const lawyerReviews = Object.values(currentReviews).filter(
    (r) => r.lawyerUid === review.lawyerUid && r.status === 'published'
  );
  const aggregateSummary = calculateAggregateRating(lawyerReviews);

  logger.info('Advocate review updated', {
    reviewId,
    lawyerUid: review.lawyerUid,
    newRating: review.rating,
  });

  return {
    success: true,
    review,
    aggregateSummary,
  };
}

/**
 * Retrieves all published reviews for a specific lawyer profile along with aggregated rating
 */
export async function getLawyerReviews(
  lawyerUid: string,
  options?: { page?: number; limit?: number; customReviews?: Record<string, LawyerReview> }
): Promise<{
  reviews: LawyerReview[];
  aggregate: AggregateRatingSummary;
  total: number;
  page: number;
  limit: number;
}> {
  const currentReviews = options?.customReviews || reviewsStore;
  const allLawyerReviews = Object.values(currentReviews).filter(
    (r) => r.lawyerUid === lawyerUid && r.status === 'published'
  );

  // Sort by newest first
  allLawyerReviews.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const aggregate = calculateAggregateRating(allLawyerReviews);
  const page = Math.max(1, options?.page || 1);
  const limit = Math.max(1, Math.min(50, options?.limit || 10));
  const startIndex = (page - 1) * limit;
  const paginatedReviews = allLawyerReviews.slice(startIndex, startIndex + limit);

  return {
    reviews: paginatedReviews,
    aggregate,
    total: allLawyerReviews.length,
    page,
    limit,
  };
}
