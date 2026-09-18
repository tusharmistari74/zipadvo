import { NextRequest, NextResponse } from 'next/server';
import { markNotificationAsRead } from '../../../../../lib/services/notifications/notification.service';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || req.headers.get('x-user-id') || 'guest_client_uid';

    const result = await markNotificationAsRead(params.notificationId, userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to mark notification as read' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: result.notification,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
