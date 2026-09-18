import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptchaEnterpriseToken } from '../../../../lib/auth/recaptcha-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, action, minScore } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const result = await verifyRecaptchaEnterpriseToken({
      token,
      expectedAction: action,
      minScore,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, score: result.score },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      score: result.score,
      action: result.action,
      reasons: result.reasons,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
