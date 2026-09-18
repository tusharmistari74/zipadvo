import { NextResponse } from 'next/server';
import { createReview } from '@/lib/services/review.service';
import { createReviewSchema } from '@legalhub/validation';
import { logger } from '@legalhub/utils';

export async function POST(req: Request) {
  try {
    const clientUid = req.headers.get('x-user-id') || 'usr_client_01';
    const clientName = req.headers.get('x-user-name') || 'Verified Client';

    if (!clientUid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = createReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid review payload',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const result = await createReview(clientUid, clientName, validation.data);

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
    logger.error('Error submitting review', { err });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
