import { NextRequest, NextResponse } from 'next/server';
import { updateLawyerBookingStatus } from '../../../../../../lib/services/lawyer-dashboard.service';
import { lawyerUpdateBookingStatusSchema } from '@legalhub/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;
    const body = await request.json();
    const { lawyerUid, status, completionNotes, actorRole = 'lawyer' } = body;

    if (!lawyerUid) {
      return NextResponse.json(
        { success: false, error: 'lawyerUid is required' },
        { status: 400 }
      );
    }

    const parsed = lawyerUpdateBookingStatusSchema.safeParse({ status, completionNotes });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid status' },
        { status: 400 }
      );
    }

    const result = await updateLawyerBookingStatus(
      lawyerUid,
      bookingId,
      parsed.data.status,
      parsed.data.completionNotes,
      actorRole
    );
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Failed to update booking status' },
      { status: 500 }
    );
  }
}
