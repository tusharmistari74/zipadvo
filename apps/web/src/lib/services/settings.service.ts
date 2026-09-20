import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/client';
import { COLLECTIONS } from '../firebase/collections';
import type {
  PlatformSettings,
  FeeConfiguration,
  AuditLog,
  UserRole,
  UpdatePlatformSettingsPayload,
  PlatformSettingAuditChange,
} from '@legalhub/types';
import { updatePlatformSettingsSchema } from '@legalhub/validation';
import { logger } from '@legalhub/utils';
import { recordAuditLog, assertAdminAuthorization } from './admin-portal.service';

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  id: 'global_settings',
  // Phase 20 Core Config Properties
  commissionRate: 10,
  unlockFee: 299,
  minimumWithdrawal: 500,
  supportEmail: 'zipadvo@gmail.com',
  supportPhone: '+91 77689 42390',
  platformVersion: '1.0.0',

  // Backward compatibility & operational settings
  fees: {
    consultationUnlockFeeInr: 299,
    platformCommissionPercentage: 10,
    gstPercentage: 18,
  },
  maintenanceMode: false,
  maintenanceMessage: '',
  allowedPincodes: [
    '400001', // Fort
    '400002', // Kalbadevi
    '400004', // Girgaon
    '400050', // Bandra West
    '400051', // BKC
    '400053', // Andheri West
    '400069', // Andheri East
    '400092', // Borivali West
    '400601', // Thane West
    '400703', // Vashi, Navi Mumbai
  ],
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
};

// In-memory cache for fast lookups & test resilience
let cachedSettings: PlatformSettings = { ...DEFAULT_PLATFORM_SETTINGS };

/**
 * Retrieves the global platform settings at runtime
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return { ...cachedSettings };
  }

  // 1. Check client browser localStorage for immediate real-time sync
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('zipadvo_platform_settings');
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<PlatformSettings>;
        cachedSettings = {
          ...DEFAULT_PLATFORM_SETTINGS,
          ...parsed,
          fees: {
            ...DEFAULT_PLATFORM_SETTINGS.fees,
            ...(parsed.fees || {}),
          },
        };
      }
    } catch {
      // Fallback
    }
  }

  // 2. Fetch from Firestore if available
  try {
    const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, 'global_settings');
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as Partial<PlatformSettings>;
      cachedSettings = {
        ...DEFAULT_PLATFORM_SETTINGS,
        ...data,
        fees: {
          ...DEFAULT_PLATFORM_SETTINGS.fees,
          ...(data.fees || {}),
        },
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('zipadvo_platform_settings', JSON.stringify(cachedSettings));
        } catch {
          // Ignore
        }
      }

      return { ...cachedSettings };
    }
  } catch {
    // Offline/fallback to cached
  }

  return { ...cachedSettings };
}

/**
 * Dynamic runtime getters for individual configuration values
 */
export async function getCommissionRate(): Promise<number> {
  const settings = await getPlatformSettings();
  return settings.commissionRate ?? settings.fees?.platformCommissionPercentage ?? 10;
}

export async function getUnlockFee(): Promise<number> {
  const settings = await getPlatformSettings();
  return settings.unlockFee ?? settings.fees?.consultationUnlockFeeInr ?? 299;
}

export async function getConsultationUnlockFee(): Promise<number> {
  return getUnlockFee();
}

export async function getMinimumWithdrawal(): Promise<number> {
  const settings = await getPlatformSettings();
  return settings.minimumWithdrawal ?? 500;
}

export async function getSupportEmail(): Promise<string> {
  const settings = await getPlatformSettings();
  return settings.supportEmail || 'zipadvo@gmail.com';
}

export async function getSupportPhone(): Promise<string> {
  const settings = await getPlatformSettings();
  return settings.supportPhone || '+91 77689 42390';
}

export async function getPlatformVersion(): Promise<string> {
  const settings = await getPlatformSettings();
  return settings.platformVersion || '1.0.0';
}

/**
 * Updates platform configuration with strict admin authorization, Zod validation, and audit logging
 */
export async function updatePlatformSettings(params: {
  adminUid: string;
  actorRole: UserRole | string;
  updates: UpdatePlatformSettingsPayload;
  reason?: string;
}): Promise<{
  success: boolean;
  error?: string;
  settings?: PlatformSettings;
  changes?: PlatformSettingAuditChange[];
}> {
  const { adminUid, actorRole, updates } = params;

  // 1. Admin Authorization Enforcement
  try {
    assertAdminAuthorization(actorRole);
  } catch (err) {
    logger.warn('Unauthorized platform settings update attempt', {
      adminUid,
      actorRole,
    });
    return {
      success: false,
      error: 'Forbidden: Privileged administrative access required to modify platform configuration',
    };
  }

  // 2. Schema Validation
  const validation = updatePlatformSettingsSchema.safeParse(updates);
  if (!validation.success) {
    const errorMsg = validation.error.issues[0]?.message || 'Invalid settings payload';
    return {
      success: false,
      error: errorMsg,
    };
  }

  const payload = validation.data;
  const current = await getPlatformSettings();
  const previousSettings = { ...current };
  const now = new Date().toISOString();
  const changes: PlatformSettingAuditChange[] = [];

  // Normalize inputs across canonical & legacy names
  const newCommissionRate =
    payload.commissionRate !== undefined
      ? payload.commissionRate
      : payload.platformCommissionPercentage;

  const newUnlockFee =
    payload.unlockFee !== undefined
      ? payload.unlockFee
      : payload.consultationUnlockFeeInr;

  const newSupportEmail =
    payload.supportEmail !== undefined
      ? payload.supportEmail
      : payload.supportContactEmail;

  const newSupportPhone =
    payload.supportPhone !== undefined
      ? payload.supportPhone
      : payload.supportContactPhone;

  const newMaintenanceMode =
    payload.maintenanceMode !== undefined
      ? payload.maintenanceMode
      : payload.isMaintenanceMode;

  // 3. Track detailed diff for audit logging
  if (newCommissionRate !== undefined && newCommissionRate !== current.commissionRate) {
    changes.push({
      settingKey: 'commissionRate',
      oldValue: current.commissionRate,
      newValue: newCommissionRate,
    });
  }

  if (newUnlockFee !== undefined && newUnlockFee !== current.unlockFee) {
    changes.push({
      settingKey: 'unlockFee',
      oldValue: current.unlockFee,
      newValue: newUnlockFee,
    });
  }

  if (
    payload.minimumWithdrawal !== undefined &&
    payload.minimumWithdrawal !== current.minimumWithdrawal
  ) {
    changes.push({
      settingKey: 'minimumWithdrawal',
      oldValue: current.minimumWithdrawal,
      newValue: payload.minimumWithdrawal,
    });
  }

  if (newSupportEmail !== undefined && newSupportEmail !== current.supportEmail) {
    changes.push({
      settingKey: 'supportEmail',
      oldValue: current.supportEmail,
      newValue: newSupportEmail,
    });
  }

  if (newSupportPhone !== undefined && newSupportPhone !== current.supportPhone) {
    changes.push({
      settingKey: 'supportPhone',
      oldValue: current.supportPhone,
      newValue: newSupportPhone,
    });
  }

  if (
    payload.platformVersion !== undefined &&
    payload.platformVersion !== current.platformVersion
  ) {
    changes.push({
      settingKey: 'platformVersion',
      oldValue: current.platformVersion,
      newValue: payload.platformVersion,
    });
  }

  if (
    newMaintenanceMode !== undefined &&
    newMaintenanceMode !== current.maintenanceMode
  ) {
    changes.push({
      settingKey: 'maintenanceMode',
      oldValue: current.maintenanceMode,
      newValue: newMaintenanceMode,
    });
  }

  if (
    payload.maintenanceMessage !== undefined &&
    payload.maintenanceMessage !== current.maintenanceMessage
  ) {
    changes.push({
      settingKey: 'maintenanceMessage',
      oldValue: current.maintenanceMessage,
      newValue: payload.maintenanceMessage,
    });
  }

  // 4. Update in-memory runtime configuration
  const updatedSettings: PlatformSettings = {
    ...current,
    commissionRate: newCommissionRate !== undefined ? newCommissionRate : current.commissionRate,
    unlockFee: newUnlockFee !== undefined ? newUnlockFee : current.unlockFee,
    minimumWithdrawal:
      payload.minimumWithdrawal !== undefined
        ? payload.minimumWithdrawal
        : current.minimumWithdrawal,
    supportEmail: newSupportEmail !== undefined ? newSupportEmail : current.supportEmail,
    supportPhone: newSupportPhone !== undefined ? newSupportPhone : current.supportPhone,
    platformVersion:
      payload.platformVersion !== undefined
        ? payload.platformVersion
        : current.platformVersion,
    maintenanceMode:
      newMaintenanceMode !== undefined ? newMaintenanceMode : current.maintenanceMode,
    maintenanceMessage:
      payload.maintenanceMessage !== undefined
        ? payload.maintenanceMessage
        : current.maintenanceMessage,
    fees: {
      ...current.fees,
      consultationUnlockFeeInr:
        newUnlockFee !== undefined ? newUnlockFee : current.fees.consultationUnlockFeeInr,
      platformCommissionPercentage:
        newCommissionRate !== undefined
          ? newCommissionRate
          : current.fees.platformCommissionPercentage,
    },
    updatedAt: now,
  };

  cachedSettings = updatedSettings;

  // 5. Audit Logging with old value, new value, adminUid, timestamp, and reason
  const effectiveReason =
    payload.reason || params.reason || 'Platform configuration updated by administrator';

  await recordAuditLog(
    adminUid,
    actorRole as UserRole,
    'platform_settings_updated',
    'global_settings',
    'platformSettings',
    {
      changes,
      reason: effectiveReason,
      previousSettings,
      updatedSettings,
      timestamp: now,
    }
  );

  // 6. Firestore Persistence (when outside unit tests)
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
    try {
      const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, 'global_settings');
      await setDoc(docRef, updatedSettings, { merge: true });

      const auditRef = collection(db, COLLECTIONS.AUDIT_LOGS);
      await addDoc(auditRef, {
        actorUid: adminUid,
        actorRole,
        action: 'platform_settings_updated',
        targetEntityId: 'global_settings',
        targetEntityType: 'platformSettings',
        metadata: {
          changes,
          reason: effectiveReason,
        },
        createdAt: now,
        updatedAt: now,
      } as unknown as AuditLog);
    } catch (dbErr) {
      logger.warn('Failed to persist settings update to Firestore, retained in memory', {
        err: dbErr,
      });
    }
  }

  // 7. Client-side storage sync and event broadcast
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('zipadvo_platform_settings', JSON.stringify(updatedSettings));
      window.dispatchEvent(new CustomEvent('zipadvo_settings_updated', { detail: updatedSettings }));
    } catch {
      // Ignore
    }
  }

  return {
    success: true,
    settings: updatedSettings,
    changes,
  };
}

/**
 * Updates platform fee configurations with admin audit logging (backward compatibility)
 */
export async function updatePlatformFees(params: {
  fees: Partial<FeeConfiguration>;
  adminUid: string;
}): Promise<{ success: boolean; error?: string; settings?: PlatformSettings }> {
  const { fees, adminUid } = params;
  return updatePlatformSettings({
    adminUid,
    actorRole: 'admin',
    updates: {
      unlockFee: fees.consultationUnlockFeeInr,
      commissionRate: fees.platformCommissionPercentage,
      consultationUnlockFeeInr: fees.consultationUnlockFeeInr,
      platformCommissionPercentage: fees.platformCommissionPercentage,
    },
    reason: 'Legacy platform fee update',
  });
}

/**
 * Synchronous/Direct update helper for consultation unlock fee (used in tests/services)
 */
export function updateConsultationUnlockFee(newFeeInr: number): void {
  if (typeof newFeeInr !== 'number' || newFeeInr < 0 || newFeeInr > 50000) {
    throw new Error(`Invalid consultation unlock fee amount: ${newFeeInr}`);
  }
  cachedSettings = {
    ...cachedSettings,
    unlockFee: newFeeInr,
    fees: {
      ...cachedSettings.fees,
      consultationUnlockFeeInr: newFeeInr,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Resets platform settings cache (useful in tests)
 */
export function resetPlatformSettingsCache(): void {
  cachedSettings = { ...DEFAULT_PLATFORM_SETTINGS };
}

export const resetPlatformSettings = resetPlatformSettingsCache;
