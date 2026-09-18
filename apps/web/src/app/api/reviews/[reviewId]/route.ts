import { NextResponse } from 'next/server';
import { updateReview } from '@/lib/services/review.service';
import { updateReviewSchema } from '@legalhub/validation';
import { logger } from '@legalhub/utils';

export async function PATCH(
  req: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    const clientUid = req.headers.get('x-user-id') || 'usr_client_01';

    if (!clientUid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reviewId = params.reviewId;
    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validation = updateReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid review update payload',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const result = await updateReview(clientUid, reviewId, validation.data);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      review: result.review,
      aggregateSummary: result.aggregateSummary,
    });
  } catch (err: unknown) {
    logger.error('Error updating review', { err });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
