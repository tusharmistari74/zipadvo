import { NextRequest, NextResponse } from 'next/server';
import {
  getUserNotifications,
  getUnreadNotificationCount,
} from '../../../lib/services/notifications/notification.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'guest_client_uid';
    const callerUid = searchParams.get('callerUid') || userId;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;

    const [notifsRes, unreadRes] = await Promise.all([
      getUserNotifications(userId, callerUid, { unreadOnly, limit }),
      getUnreadNotificationCount(userId, callerUid),
    ]);

    if (!notifsRes.success) {
      return NextResponse.json(
        { success: false, error: notifsRes.error || 'Failed to retrieve notifications' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: notifsRes.notifications,
      unreadCount: unreadRes.count,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
