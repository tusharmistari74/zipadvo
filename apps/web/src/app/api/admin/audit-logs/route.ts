import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuditLogs } from '../../../../lib/services/admin-portal.service';
import type { AuditAction } from '@legalhub/types';

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
      action: (searchParams.get('action') as AuditAction | 'all') || undefined,
      actorUid: searchParams.get('actorUid') || undefined,
      targetEntityType: searchParams.get('targetEntityType') || undefined,
    };

    const result = await getAdminAuditLogs(actorRole, filter);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
