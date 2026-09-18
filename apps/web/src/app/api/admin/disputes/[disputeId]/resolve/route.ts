import { NextRequest, NextResponse } from 'next/server';
import { resolveDispute } from '../../../../../../lib/services/admin-portal.service';
import { adminResolveDisputeSchema } from '@legalhub/validation';
import type { UserRole } from '@legalhub/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { disputeId: string } }
) {
  try {
    const { disputeId } = params;
    const body = await request.json();
    const { adminUid, actorRole = 'admin', resolution, resolutionSummary, adminNotes, refundAmountInr } = body;

    if (actorRole !== 'admin' && actorRole !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin authorization required' },
        { status: 403 }
      );
    }

    const parsed = adminResolveDisputeSchema.safeParse({ resolution, resolutionSummary, adminNotes, refundAmountInr });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid dispute resolution payload' },
        { status: 400 }
      );
    }

    const result = await resolveDispute(
      adminUid || 'admin_operator',
      actorRole as UserRole,
      disputeId,
      parsed.data
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Failed to resolve dispute' },
      { status: 500 }
    );
  }
}
