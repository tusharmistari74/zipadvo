import { NextResponse } from 'next/server';
import { closeDispute } from '@/lib/services/dispute.service';
import { closeDisputeSchema } from '@legalhub/validation';
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

    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      // Empty body allowed
    }

    const validation = closeDisputeSchema.safeParse(body);
    const closingNotes = validation.success ? validation.data.closingNotes : undefined;

    const result = await closeDispute(
      adminUid,
      adminRole,
      disputeId,
      closingNotes
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
    logger.error('Error closing dispute', { err });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
