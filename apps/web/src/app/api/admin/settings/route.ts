import { NextRequest, NextResponse } from 'next/server';
import {
  getPlatformSettings,
  updatePlatformSettings,
} from '@/lib/services/settings.service';
import { updatePlatformSettingsSchema } from '@legalhub/validation';
import type { UserRole } from '@legalhub/types';
import { logger } from '@legalhub/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const headerRole = request.headers.get('x-user-role');
    const actorRole = (headerRole || searchParams.get('actorRole') || 'admin') as UserRole;

    if (actorRole !== 'admin' && actorRole !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin authorization required' },
        { status: 403 }
      );
    }

    const settings = await getPlatformSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err: unknown) {
    logger.error('Failed to fetch platform settings', { err });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch platform settings',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headerUid = request.headers.get('x-user-id');
    const headerRole = request.headers.get('x-user-role');

    const adminUid = headerUid || body.adminUid || 'admin_operator';
    const actorRole = (headerRole || body.actorRole || 'admin') as UserRole;

    if (actorRole !== 'admin' && actorRole !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin authorization required' },
        { status: 403 }
      );
    }

    // Support both flattened body payload and body.updates
    const rawUpdates = body.updates ? { ...body.updates } : { ...body };
    // Extract reason from payload if provided at root
    const reason = rawUpdates.reason || body.reason;

    const parsed = updatePlatformSettingsSchema.safeParse(rawUpdates);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid settings updates',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const result = await updatePlatformSettings({
      adminUid,
      actorRole,
      updates: parsed.data,
      reason,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error?.includes('Forbidden') ? 403 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: result.settings,
      changes: result.changes,
    });
  } catch (err: unknown) {
    logger.error('Failed to update platform settings', { err });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update platform settings',
      },
      { status: 500 }
    );
  }
}

export const PUT = POST;
export const PATCH = POST;
