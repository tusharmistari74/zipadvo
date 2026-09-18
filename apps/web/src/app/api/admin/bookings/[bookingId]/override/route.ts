import { NextRequest, NextResponse } from 'next/server';
import { overrideBookingStatus } from '../../../../../../lib/services/admin-portal.service';
import { adminBookingOverrideSchema } from '@legalhub/validation';
import type { UserRole } from '@legalhub/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;
    const body = await request.json();
    const { adminUid, actorRole = 'admin', newStatus, reason, adminNotes } = body;

    if (actorRole !== 'admin' && actorRole !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin authorization required' },
        { status: 403 }
      );
    }

    const parsed = adminBookingOverrideSchema.safeParse({ newStatus, reason, adminNotes });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid override payload' },
        { status: 400 }
      );
    }

    const result = await overrideBookingStatus(
      adminUid || 'admin_operator',
      actorRole as UserRole,
      bookingId,
      parsed.data
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Failed to override booking status' },
      { status: 500 }
    );
  }
}
