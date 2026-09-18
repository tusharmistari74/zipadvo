import { NextRequest, NextResponse } from 'next/server';
import { toggleBlockUser } from '../../../../../../lib/services/admin-portal.service';
import { adminBlockUserSchema } from '@legalhub/validation';
import type { UserRole } from '@legalhub/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await request.json();
    const { adminUid, actorRole = 'admin', action, reason } = body;

    if (actorRole !== 'admin' && actorRole !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin authorization required' },
        { status: 403 }
      );
    }

    const parsed = adminBlockUserSchema.safeParse({ action, reason });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const result = await toggleBlockUser(
      adminUid || 'admin_operator',
      actorRole as UserRole,
      userId,
      parsed.data.action,
      parsed.data.reason
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Failed to modify user status' },
      { status: 500 }
    );
  }
}
