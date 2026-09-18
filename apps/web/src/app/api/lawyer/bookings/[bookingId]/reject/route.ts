import { NextRequest, NextResponse } from 'next/server';
import { rejectLawyerBooking } from '../../../../../../lib/services/lawyer-dashboard.service';
import { lawyerRejectBookingSchema } from '@legalhub/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;
    const body = await request.json();
    const { lawyerUid, reason, actorRole = 'lawyer' } = body;

    if (!lawyerUid) {
      return NextResponse.json(
        { success: false, error: 'lawyerUid is required' },
        { status: 400 }
      );
    }

    const parsed = lawyerRejectBookingSchema.safeParse({ reason });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid reason' },
        { status: 400 }
      );
    }

    const result = await rejectLawyerBooking(lawyerUid, bookingId, parsed.data.reason, actorRole);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Failed to reject booking' },
      { status: 500 }
    );
  }
}
