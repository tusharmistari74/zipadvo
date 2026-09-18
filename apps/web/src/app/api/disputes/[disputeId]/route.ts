import { NextResponse } from 'next/server';
import { getDisputeById } from '@/lib/services/dispute.service';
import type { UserRole } from '@legalhub/types';
import { logger } from '@legalhub/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { disputeId: string } }
) {
  try {
    const actorUid = req.headers.get('x-user-id') || 'usr_client_01';
    const actorRole = (req.headers.get('x-user-role') || 'client') as UserRole;
    const disputeId = params.disputeId;

    if (!actorUid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!disputeId) {
      return NextResponse.json(
        { success: false, error: 'Dispute ID is required' },
        { status: 400 }
      );
    }

    const result = await getDisputeById(actorUid, actorRole, disputeId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error?.includes('Unauthorized') ? 403 : 404 }
      );
    }

    return NextResponse.json({
      success: true,
      dispute: result.dispute,
      linkedBooking: result.linkedBooking,
      linkedPayment: result.linkedPayment,
    });
  } catch (err: unknown) {
    logger.error('Error fetching dispute details', { err });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
