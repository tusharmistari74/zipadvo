import { NextResponse } from 'next/server';
import { moveDisputeToReview } from '@/lib/services/dispute.service';
import type { UserRole } from '@legalhub/types';
import { logger } from '@legalhub/utils';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { disputeId: string } }
) {
  try {
    const adminUid = req.headers.get('x-user-id') || 'admin_sys_01';
    const adminRole = (req.headers.get('x-user-role') || 'admin') as UserRole;
    const disputeId = params.disputeId;

    let body: { adminNotes?: string } = {};
    try {
      body = (await req.json()) as { adminNotes?: string };
    } catch {
      // Empty body allowed
    }

    const result = await moveDisputeToReview(
      adminUid,
      adminRole,
      disputeId,
      body?.adminNotes
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      dispute: result.dispute,
    });
  } catch (err: unknown) {
    logger.error('Error moving dispute to review', { err });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
