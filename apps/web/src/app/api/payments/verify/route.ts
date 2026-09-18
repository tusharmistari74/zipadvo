import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignatureSchema } from '@legalhub/validation';
import { verifyPayment } from '../../../../lib/services/payment.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validationResult = verifyPaymentSignatureSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment verification payload',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      userId,
      userRole,
      paymentMethod,
    } = validationResult.data;

    const result = await verifyPayment({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      bookingId,
      userId,
      userRole: userRole || 'client',
      paymentMethod,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Payment signature verification failed',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      booking: result.booking,
      message: 'Payment verified and booking contact details unlocked successfully.',
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
