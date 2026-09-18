import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPlatformSettings,
  getCommissionRate,
  getUnlockFee,
  getConsultationUnlockFee,
  getMinimumWithdrawal,
  getSupportEmail,
  getSupportPhone,
  getPlatformVersion,
  updatePlatformSettings,
  updateConsultationUnlockFee,
  resetPlatformSettingsCache,
  DEFAULT_PLATFORM_SETTINGS,
} from '../../apps/web/src/lib/services/settings.service';
import {
  platformSettingsSchema,
  updatePlatformSettingsSchema,
} from '../../packages/validation/src/settings.schema';
import {
  getAdminAuditLogs,
  seedAdminPortalData,
} from '../../apps/web/src/lib/services/admin-portal.service';

describe('Phase 20: Platform Configuration & Settings Management', () => {
  const adminActor = {
    userId: 'admin_sys_01',
    role: 'admin',
  };

  const superAdminActor = {
    userId: 'super_admin_01',
    role: 'super_admin',
  };

  const clientActor = {
    userId: 'usr_client_01',
    role: 'client',
  };

  const lawyerActor = {
    userId: 'usr_lawyer_01',
    role: 'lawyer',
  };

  beforeEach(() => {
    resetPlatformSettingsCache();
    seedAdminPortalData();
  });

  describe('1. Runtime Default Configuration & Dynamic Getters', () => {
    it('should initialize with canonical default settings', async () => {
      const settings = await getPlatformSettings();

      expect(settings).toBeDefined();
      expect(settings.commissionRate).toBe(10);
      expect(settings.unlockFee).toBe(299);
      expect(settings.minimumWithdrawal).toBe(500);
      expect(settings.supportEmail).toBe('support@legalhubmumbai.com');
      expect(settings.supportPhone).toBe('+91 22 2265 4321');
      expect(settings.platformVersion).toBe('1.0.0');
      expect(settings.maintenanceMode).toBe(false);
    });

    it('should return correct individual values via runtime getters', async () => {
      expect(await getCommissionRate()).toBe(10);
      expect(await getUnlockFee()).toBe(299);
      expect(await getConsultationUnlockFee()).toBe(299);
      expect(await getMinimumWithdrawal()).toBe(500);
      expect(await getSupportEmail()).toBe('support@legalhubmumbai.com');
      expect(await getSupportPhone()).toBe('+91 22 2265 4321');
      expect(await getPlatformVersion()).toBe('1.0.0');
    });
  });

  describe('2. Input Validation (Preventing Invalid Values)', () => {
    it('should reject negative consultation unlock fee', async () => {
      const res = await updatePlatformSettings({
        adminUid: adminActor.userId,
        actorRole: adminActor.role,
        updates: {
          unlockFee: -50,
        },
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Unlock fee cannot be negative/i);
    });

    it('should reject invalid commission percentages (< 0 or > 100)', async () => {
      const resLow = await updatePlatformSettings({
        adminUid: adminActor.userId,
        actorRole: adminActor.role,
        updates: {
          commissionRate: -5,
        },
      });
      expect(resLow.success).toBe(false);
      expect(resLow.error).toMatch(/Commission rate cannot be negative/i);

      const resHigh = await updatePlatformSettings({
        adminUid: adminActor.userId,
        actorRole: adminActor.role,
        updates: {
          commissionRate: 105,
        },
      });
      expect(resHigh.success).toBe(false);
      expect(resHigh.error).toMatch(/Commission rate cannot exceed 100%/i);
    });

    it('should reject negative minimum withdrawal amount', async () => {
      const res = await updatePlatformSettings({
        adminUid: adminActor.userId,
        actorRole: adminActor.role,
        updates: {
          minimumWithdrawal: -200,
        },
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Minimum withdrawal amount cannot be negative/i);
    });

    it('should reject invalid support email addresses', async () => {
      const res = await updatePlatformSettings({
        adminUid: adminActor.userId,
        actorRole: adminActor.role,
        updates: {
          supportEmail: 'not-an-email-address',
        },
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/valid support email address/i);
    });

    it('should validate complete platform settings with full schema', () => {
      const validPayload = {
        commissionRate: 15,
        unlockFee: 349,
        minimumWithdrawal: 1000,
        supportEmail: 'helpdesk@legalhubmumbai.com',
        supportPhone: '+91 22 9999 8888',
        platformVersion: '1.1.0',
        maintenanceMode: false,
      };

      const result = platformSettingsSchema.safeParse(validPayload);
      expect(result.success).toBe(true);

      const invalidPayload = {
        commissionRate: 150, // Invalid > 100
        unlockFee: -10, // Invalid < 0
        minimumWithdrawal: -500, // Invalid < 0
        supportEmail: 'bad-email',
        supportPhone: '123', // Too short
        platformVersion: '', // Empty
      };

      const invalidResult = platformSettingsSchema.safeParse(invalidPayload);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('3. Admin Security & Authorization Enforcement', () => {
    it('should forbid client actors from updating platform settings', async () => {
      const res = await updatePlatformSettings({
        adminUid: clientActor.userId,
        actorRole: clientActor.role,
        updates: {
          unlockFee: 199,
        },
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Privileged administrative access required/i);
    });

    it('should forbid lawyer actors from updating platform settings', async () => {
      const res = await updatePlatformSettings({
        adminUid: lawyerActor.userId,
        actorRole: lawyerActor.role,
        updates: {
          commissionRate: 5,
        },
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Privileged administrative access required/i);
    });

    it('should allow authorized admin and super_admin actors to update settings', async () => {
      const adminRes = await updatePlatformSettings({
        adminUid: adminActor.userId,
        actorRole: adminActor.role,
        updates: {
          unlockFee: 399,
          commissionRate: 12,
        },
        reason: 'Q4 pricing adjustment',
      });

      expect(adminRes.success).toBe(true);
      expect(adminRes.settings?.unlockFee).toBe(399);
      expect(adminRes.settings?.commissionRate).toBe(12);

      const superAdminRes = await updatePlatformSettings({
        adminUid: superAdminActor.userId,
        actorRole: superAdminActor.role,
        updates: {
          minimumWithdrawal: 750,
          platformVersion: '1.2.0',
        },
        reason: 'Super admin version bump',
      });

      expect(superAdminRes.success).toBe(true);
      expect(superAdminRes.settings?.minimumWithdrawal).toBe(750);
      expect(superAdminRes.settings?.platformVersion).toBe('1.2.0');
    });
  });

  describe('4. Audit Trail & Diff Recording', () => {
    it('should record oldValue, newValue, adminUid, timestamp, and reason on setting changes', async () => {
      const updateResult = await updatePlatformSettings({
        adminUid: adminActor.userId,
        actorRole: adminActor.role,
        updates: {
          commissionRate: 20,
          unlockFee: 499,
          supportEmail: 'ops@legalhubmumbai.com',
        },
        reason: 'Executive policy update for Mumbai operations',
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.changes).toBeDefined();
      expect(updateResult.changes?.length).toBe(3);

      const commissionDiff = updateResult.changes?.find((c) => c.settingKey === 'commissionRate');
      expect(commissionDiff).toEqual({
        settingKey: 'commissionRate',
        oldValue: 10,
        newValue: 20,
      });

      const unlockFeeDiff = updateResult.changes?.find((c) => c.settingKey === 'unlockFee');
      expect(unlockFeeDiff).toEqual({
        settingKey: 'unlockFee',
        oldValue: 299,
        newValue: 499,
      });

      const emailDiff = updateResult.changes?.find((c) => c.settingKey === 'supportEmail');
      expect(emailDiff).toEqual({
        settingKey: 'supportEmail',
        oldValue: 'support@legalhubmumbai.com',
        newValue: 'ops@legalhubmumbai.com',
      });

      // Verify audit logs store contains the event
      const auditRes = await getAdminAuditLogs(adminActor.role, {
        action: 'platform_settings_updated',
      });

      expect(auditRes.success).toBe(true);
      expect(auditRes.logs.length).toBeGreaterThanOrEqual(1);
      const latestLog = auditRes.logs[0];
      expect(latestLog?.actorUid).toBe(adminActor.userId);
      expect(latestLog?.metadata?.reason).toBe('Executive policy update for Mumbai operations');
      expect(latestLog?.metadata?.changes).toBeDefined();
    });
  });

  describe('5. Runtime Configuration Synchronization', () => {
    it('should dynamically update fee calculations and runtime getters across the system', async () => {
      expect(await getUnlockFee()).toBe(299);

      await updatePlatformSettings({
        adminUid: adminActor.userId,
        actorRole: adminActor.role,
        updates: {
          unlockFee: 599,
          commissionRate: 18,
          minimumWithdrawal: 1500,
          platformVersion: '2.0.0-beta',
        },
        reason: 'System-wide major release update',
      });

      expect(await getUnlockFee()).toBe(599);
      expect(await getConsultationUnlockFee()).toBe(599);
      expect(await getCommissionRate()).toBe(18);
      expect(await getMinimumWithdrawal()).toBe(1500);
      expect(await getPlatformVersion()).toBe('2.0.0-beta');
    });

    it('should allow direct consultation unlock fee helper update in test environments', () => {
      updateConsultationUnlockFee(350);
      expect(DEFAULT_PLATFORM_SETTINGS.unlockFee).toBe(299); // Default untouched
    });
  });
});
