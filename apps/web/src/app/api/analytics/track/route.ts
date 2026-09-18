import { NextRequest, NextResponse } from 'next/server';
import { trackFunnelEvent } from '@/lib/services/analytics.service';
import type { FunnelStage } from '@legalhub/types';
import { logger } from '@legalhub/utils';

export const dynamic = 'force-dynamic';

const VALID_STAGES: FunnelStage[] = [
  'visitor',
  'lawyer_search',
  'profile_view',
  'booking_started',
  'payment_success',
  'lawyer_accepted',
  'completed',
  'review_submitted',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stage, userId, sessionId, targetId, metadata } = body;

    if (!stage || !VALID_STAGES.includes(stage)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing funnel stage' },
        { status: 400 }
      );
    }

    const result = await trackFunnelEvent({
      stage,
      userId,
      sessionId,
      targetId,
      metadata,
    });

    return NextResponse.json(
      {
        success: true,
        eventId: result.eventId,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    logger.error('Failed to log funnel event', { err });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to record analytics event',
      },
      { status: 500 }
    );
  }
}
