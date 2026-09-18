import { NextRequest, NextResponse } from 'next/server';
import { createPaymentOrderSchema } from '@legalhub/validation';
import { createRazorpayOrder } from '../../../../lib/services/payment.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validationResult = createPaymentOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { bookingId, userId, userRole, clientName, clientEmail, clientPhone } = validationResult.data;

    const result = await createRazorpayOrder({
      bookingId,
      userId,
      userRole: userRole || 'client',
      clientName,
      clientEmail,
      clientPhone,
    });

    if (!result.success || !result.order) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to create payment order',
        },
        { status: 400 }
      );
    }

    // Return the created order and the PUBLIC key ID only (never expose key secret)
    return NextResponse.json({
      success: true,
      order: result.order,
      keyId: result.order.keyId,
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
