import { NextRequest, NextResponse } from 'next/server';
import { getAdminUsers } from '../../../../lib/services/admin-portal.service';
import type { UserRole, UserStatus } from '@legalhub/types';

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
      role: (searchParams.get('role') as UserRole | 'all') || undefined,
      status: (searchParams.get('status') as UserStatus | 'all') || undefined,
      searchQuery: searchParams.get('searchQuery') || undefined,
    };

    const result = await getAdminUsers(actorRole, filter);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
