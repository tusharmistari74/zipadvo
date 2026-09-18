import { NextResponse } from 'next/server';
import { checkReviewEligibility } from '@/lib/services/review.service';
import { reviewEligibilityQuerySchema } from '@legalhub/validation';
import { logger } from '@legalhub/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');
    const clientUid = req.headers.get('x-user-id') || 'usr_client_01';

    if (!clientUid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const validation = reviewEligibilityQuerySchema.safeParse({ bookingId });
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid bookingId parameter',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const result = await checkReviewEligibility(clientUid, validation.data.bookingId);

    return NextResponse.json({
      success: true,
      eligibility: result,
    });
  } catch (err: unknown) {
    logger.error('Error checking review eligibility', { err });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
