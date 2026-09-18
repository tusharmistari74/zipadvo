import { NextRequest, NextResponse } from 'next/server';
import { getAdminBookings } from '../../../../lib/services/admin-portal.service';
import type { BookingStatus } from '@legalhub/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const actorRole = searchParams.get('actorRole') || 'admin';

    if (actorRole !== 'admin' && actorRole !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin authorization required' },
        { status: 403 }
      );
    }

    const filter = {
      status: (searchParams.get('status') as BookingStatus | 'all') || undefined,
      searchQuery: searchParams.get('searchQuery') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    const result = await getAdminBookings(actorRole, filter);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
