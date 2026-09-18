import { NextRequest, NextResponse } from 'next/server';
import { markAllNotificationsAsRead } from '../../../../lib/services/notifications/notification.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || req.headers.get('x-user-id') || 'guest_client_uid';

    const result = await markAllNotificationsAsRead(userId);

    return NextResponse.json({
      success: true,
      updatedCount: result.updatedCount,
      message: `Marked ${result.updatedCount} notification(s) as read.`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
