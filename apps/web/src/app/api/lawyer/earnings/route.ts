import { NextRequest, NextResponse } from 'next/server';
import { getLawyerEarningsReport } from '../../../../lib/services/lawyer-dashboard.service';

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

    const report = await getLawyerEarningsReport(lawyerUid);
    return NextResponse.json({ success: true, report });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Failed to calculate lawyer earnings' },
      { status: 500 }
    );
  }
}
