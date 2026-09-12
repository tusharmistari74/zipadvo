import { BaseEntity } from './common';

export interface FeeConfiguration {
  consultationUnlockFeeInr: number; // e.g. 299
  platformCommissionPercentage: number; // e.g. 10%
  gstPercentage: number; // 18%
}

export interface PlatformSettings extends BaseEntity {
  id: 'global_settings';
  fees: FeeConfiguration;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  allowedPincodes: string[]; // Mumbai/MMR Region pincodes (400001 - 401209)
  supportEmail: string;
  supportPhone: string;
}
