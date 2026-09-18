import { NextResponse } from 'next/server';
import { adjudicateDispute } from '@/lib/services/dispute.service';
import { adjudicateDisputeSchema } from '@legalhub/validation';
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

    const body = await req.json();
    const validation = adjudicateDisputeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid adjudication payload',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const result = await adjudicateDispute(
      adminUid,
      adminRole,
      disputeId,
      validation.data
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
    logger.error('Error adjudicating dispute', { err });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
