import { NextRequest, NextResponse } from 'next/server';
import { getAdminDashboardMetrics } from '../../../../lib/services/admin-portal.service';

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

    const metrics = await getAdminDashboardMetrics(actorRole);
    return NextResponse.json({ success: true, metrics });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Failed to fetch admin metrics' },
      { status: 500 }
    );
  }
}
