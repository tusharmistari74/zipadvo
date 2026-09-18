import { NextRequest, NextResponse } from 'next/server';
import { getBusinessAnalyticsDashboard } from '@/lib/services/analytics.service';
import type { AnalyticsTimePeriod, UserRole } from '@legalhub/types';
import { logger } from '@legalhub/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const headerRole = request.headers.get('x-user-role');
    const actorRole = (headerRole || searchParams.get('actorRole') || 'admin') as UserRole;
    const period = (searchParams.get('period') as AnalyticsTimePeriod) || 'all';
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (actorRole !== 'admin' && actorRole !== 'super_admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Privileged admin authorization required',
        },
        { status: 403 }
      );
    }

    const result = await getBusinessAnalyticsDashboard(actorRole, {
      period,
      forceRefresh,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error?.includes('Forbidden') ? 403 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analytics: result.data,
    });
  } catch (err: unknown) {
    logger.error('Failed to retrieve platform analytics', { err });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
