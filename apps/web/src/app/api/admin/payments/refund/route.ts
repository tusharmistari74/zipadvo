import { NextRequest, NextResponse } from 'next/server';
import { processRefundSchema } from '@legalhub/validation';
import { processRefund } from '../../../../../lib/services/payment.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validationResult = processRefundSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid refund payload',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { paymentId, amountInr, reason, adminNotes, adminUid, adminRole } = validationResult.data;

    // RBAC check: only admin or super_admin
    if (adminRole !== 'admin' && adminRole !== 'super_admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized. Only administrators can initiate payment refunds.',
        },
        { status: 403 }
      );
    }

    const result = await processRefund({
      paymentId,
      amountInr,
      reason,
      adminNotes,
      adminUid,
      adminRole,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Refund processing failed',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      message: 'Refund initiated and ledger updated successfully.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
