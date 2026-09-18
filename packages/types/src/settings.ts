import { BaseEntity } from './common';

export interface FeeConfiguration {
  consultationUnlockFeeInr: number; // e.g. 299
  platformCommissionPercentage: number; // e.g. 10%
  gstPercentage: number; // 18%
}

export interface PlatformSettingAuditChange {
  settingKey: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface PlatformSettings extends BaseEntity {
  id: 'global_settings';
  // Phase 20 Core Config Properties
  commissionRate: number; // Platform commission percentage (0 - 100)
  unlockFee: number; // Default consultation unlock fee in INR (>= 0)
  minimumWithdrawal: number; // Minimum lawyer payout withdrawal amount in INR (>= 0)
  supportEmail: string; // Customer support contact email
  supportPhone: string; // Customer support phone / hotline
  platformVersion: string; // Semantic version e.g. "1.0.0"

  // Backward compatibility & operational settings
  fees: FeeConfiguration;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  allowedPincodes: string[]; // Mumbai/MMR Region pincodes (400001 - 401209)
}

export interface UpdatePlatformSettingsPayload {
  commissionRate?: number;
  unlockFee?: number;
  minimumWithdrawal?: number;
  supportEmail?: string;
  supportPhone?: string;
  platformVersion?: string;

  // Backward compatibility aliases
  consultationUnlockFeeInr?: number;
  platformCommissionPercentage?: number;
  isMaintenanceMode?: boolean;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  supportContactEmail?: string;
  supportContactPhone?: string;
  allowedPincodes?: string[];
  reason?: string;
}
