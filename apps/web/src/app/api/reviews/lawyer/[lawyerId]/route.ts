import { NextResponse } from 'next/server';
import { getLawyerReviews } from '@/lib/services/review.service';
import { logger } from '@legalhub/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { lawyerId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const lawyerId = params.lawyerId;
    if (!lawyerId) {
      return NextResponse.json(
        { success: false, error: 'Lawyer ID is required' },
        { status: 400 }
      );
    }

    const data = await getLawyerReviews(lawyerId, { page, limit });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err: unknown) {
    logger.error('Error fetching lawyer reviews', { err });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
