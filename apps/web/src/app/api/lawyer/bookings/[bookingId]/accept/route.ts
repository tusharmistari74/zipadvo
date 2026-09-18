import { NextRequest, NextResponse } from 'next/server';
import { acceptLawyerBooking } from '../../../../../../lib/services/lawyer-dashboard.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;
    const body = await request.json();
    const { lawyerUid, actorRole = 'lawyer' } = body;

    if (!lawyerUid) {
      return NextResponse.json(
        { success: false, error: 'lawyerUid is required' },
        { status: 400 }
      );
    }

    const result = await acceptLawyerBooking(lawyerUid, bookingId, actorRole);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Failed to accept booking' },
      { status: 500 }
    );
  }
}
