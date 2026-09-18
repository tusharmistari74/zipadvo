import { NextRequest, NextResponse } from 'next/server';
import { processRazorpayWebhook } from '../../../../lib/services/payment.service';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-razorpay-signature');

    const result = await processRazorpayWebhook({
      rawBody,
      signatureHeader,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Webhook processing failed',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      event: result.event,
      handled: result.handled,
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
