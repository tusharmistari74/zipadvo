import { NextRequest, NextResponse } from 'next/server';
import { getLawyerBookings } from '../../../../lib/services/lawyer-dashboard.service';
import { lawyerBookingFilterSchema } from '@legalhub/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lawyerUid = searchParams.get('lawyerUid');

    if (!lawyerUid) {
      return NextResponse.json(
        { success: false, error: 'lawyerUid parameter is required' },
        { status: 400 }
      );
    }

    const rawFilter = {
      status: searchParams.get('status') || undefined,
      searchQuery: searchParams.get('searchQuery') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    const parsedFilter = lawyerBookingFilterSchema.safeParse(rawFilter);
    const filter = parsedFilter.success ? parsedFilter.data : undefined;

    const result = await getLawyerBookings(lawyerUid, filter);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Failed to fetch lawyer bookings' },
      { status: 500 }
    );
  }
}
