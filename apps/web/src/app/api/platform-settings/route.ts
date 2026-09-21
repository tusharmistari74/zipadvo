import { NextResponse } from 'next/server';
import { getPlatformSettings } from '@/lib/services/settings.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getPlatformSettings();
    return NextResponse.json(
      {
        success: true,
        settings: {
          id: 'global_settings',
          unlockFee: settings.unlockFee ?? settings.fees?.consultationUnlockFeeInr ?? 299,
          commissionRate: settings.commissionRate ?? settings.fees?.platformCommissionPercentage ?? 10,
          minimumWithdrawal: settings.minimumWithdrawal ?? 500,
          supportEmail: settings.supportEmail || 'zipadvo@gmail.com',
          supportPhone: settings.supportPhone || '+91 77689 42390',
          platformVersion: settings.platformVersion || '1.0.0',
          maintenanceMode: Boolean(settings.maintenanceMode),
          fees: {
            consultationUnlockFeeInr: settings.unlockFee ?? settings.fees?.consultationUnlockFeeInr ?? 299,
            platformCommissionPercentage: settings.commissionRate ?? settings.fees?.platformCommissionPercentage ?? 10,
            gstPercentage: settings.fees?.gstPercentage ?? 18,
          },
          updatedAt: settings.updatedAt || new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        success: true,
        settings: {
          id: 'global_settings',
          unlockFee: 299,
          commissionRate: 10,
          minimumWithdrawal: 500,
          supportEmail: 'zipadvo@gmail.com',
          supportPhone: '+91 77689 42390',
          platformVersion: '1.0.0',
          maintenanceMode: false,
          fees: {
            consultationUnlockFeeInr: 299,
            platformCommissionPercentage: 10,
            gstPercentage: 18,
          },
          updatedAt: new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
