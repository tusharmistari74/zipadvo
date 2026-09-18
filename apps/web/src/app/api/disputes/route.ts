import { NextResponse } from 'next/server';
import {
  raiseDispute,
  getDisputesForUser,
} from '@/lib/services/dispute.service';
import { raiseDisputeSchema } from '@legalhub/validation';
import type { DisputeStatus, UserRole } from '@legalhub/types';
import { logger } from '@legalhub/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const actorUid = req.headers.get('x-user-id') || 'usr_client_01';
    const actorRole = (req.headers.get('x-user-role') || 'client') as UserRole;

    if (!actorUid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = raiseDisputeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid dispute payload',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    if (actorRole !== 'client' && actorRole !== 'lawyer') {
      return NextResponse.json(
        { success: false, error: 'Only clients and lawyers can raise disputes' },
        { status: 403 }
      );
    }

    const result = await raiseDispute(actorUid, actorRole, validation.data);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error?.includes('Unauthorized') ? 403 : 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        dispute: result.dispute,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    logger.error('Error raising dispute', { err });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const actorUid = req.headers.get('x-user-id') || 'usr_client_01';
    const actorRole = (req.headers.get('x-user-role') || 'client') as UserRole;

    if (!actorUid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const bookingId = searchParams.get('bookingId') || undefined;
    const searchQuery = searchParams.get('search') || undefined;

    const result = await getDisputesForUser(actorUid, actorRole, {
      status: (statusParam as DisputeStatus) || undefined,
      bookingId,
      searchQuery,
    });

    return NextResponse.json({
      success: true,
      disputes: result.disputes,
    });
  } catch (err: unknown) {
    logger.error('Error fetching disputes', { err });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
