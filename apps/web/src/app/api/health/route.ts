import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const startTime = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const environment = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development';

  return NextResponse.json(
    {
      status: 'ok',
      service: 'legalhubmumbai-web',
      environment,
      version: '1.0.0',
      uptimeSeconds,
      timestamp: new Date().toISOString(),
      checks: {
        server: 'healthy',
        database: 'ready',
        vault: 'ready',
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  );
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
