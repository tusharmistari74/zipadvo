import { NextRequest, NextResponse } from 'next/server';
import { getLawyerDashboardOverview } from '../../../../lib/services/lawyer-dashboard.service';

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

    const overview = await getLawyerDashboardOverview(lawyerUid);
    return NextResponse.json({ success: true, ...overview });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Failed to fetch lawyer overview' },
      { status: 500 }
    );
  }
}
