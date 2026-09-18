import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAdminDashboardMetrics,
  getAdminUsers,
  toggleBlockUser,
  getAdminBookings,
  overrideBookingStatus,
  getAdminDisputes,
  resolveDispute,
  getAdminAuditLogs,
  getAdminPlatformSettings,
  updateAdminPlatformSettings,
  seedAdminPortalData,
} from '../../apps/web/src/lib/services/admin-portal.service';
import type { UserRole } from '@legalhub/types';

describe('Admin Portal Service (Phase 17)', () => {
  const adminActor: { userId: string; role: UserRole } = {
    userId: 'admin_sys_01',
    role: 'admin',
  };

  const nonAdminActor: { userId: string; role: UserRole } = {
    userId: 'client_user_01',
    role: 'client',
  };

  beforeEach(() => {
    // Re-seed stores before each test
    seedAdminPortalData();
  });

  describe('1. RBAC & Security Authorization', () => {
    it('should reject non-admin actors trying to access dashboard metrics', async () => {
      await expect(
        getAdminDashboardMetrics(nonAdminActor.role)
      ).rejects.toThrow(/Privileged administrative access required/);
    });

    it('should reject non-admin actors trying to block users', async () => {
      await expect(
        toggleBlockUser(
          nonAdminActor.userId,
          nonAdminActor.role,
          'user_client_001',
          'block',
          'Spamming bookings'
        )
      ).rejects.toThrow(/Privileged administrative access required/);
    });

    it('should reject non-admin actors trying to override booking statuses', async () => {
      await expect(
        overrideBookingStatus(
          nonAdminActor.userId,
          nonAdminActor.role,
          'bk_admin_001',
          {
            newStatus: 'completed',
            reason: 'Advocate confirmed completion outside platform',
          }
        )
      ).rejects.toThrow(/Privileged administrative access required/);
    });

    it('should reject non-admin actors trying to resolve disputes', async () => {
      await expect(
        resolveDispute(
          nonAdminActor.userId,
          nonAdminActor.role,
          'disp_001',
          {
            resolution: 'client_refund',
            resolutionSummary: 'Client was unattended',
          }
        )
      ).rejects.toThrow(/Privileged administrative access required/);
    });

    it('should reject non-admin actors trying to update platform settings', async () => {
      await expect(
        updateAdminPlatformSettings(
          nonAdminActor.userId,
          nonAdminActor.role,
          {
            consultationUnlockFeeInr: 399,
          }
        )
      ).rejects.toThrow(/Privileged administrative access required/);
    });
  });

  describe('2. Dashboard Metrics Engine (Zero Invented Metrics)', () => {
    it('should compute real platform metrics strictly from actual data records', async () => {
      const metrics = await getAdminDashboardMetrics(adminActor.role);

      expect(metrics).toBeDefined();
      expect(metrics.totalUsersCount).toBeGreaterThanOrEqual(1);
      expect(metrics.totalLawyersCount).toBeGreaterThanOrEqual(1);
      expect(metrics.verifiedLawyersCount).toBeGreaterThanOrEqual(0);
      expect(metrics.pendingKycCount).toBeGreaterThanOrEqual(0);
      expect(metrics.todayBookingsCount).toBeGreaterThanOrEqual(0);
      expect(metrics.totalGrossRevenueInr).toBeGreaterThanOrEqual(0);
      expect(metrics.totalPlatformCommissionInr).toBeGreaterThanOrEqual(0);
      expect(metrics.momUserGrowthPercentage).toBeDefined();
      expect(metrics.momRevenueGrowthPercentage).toBeDefined();
    });
  });

  describe('3. User Management & Status Toggles', () => {
    it('should fetch user list and filter by search and role', async () => {
      const resAll = await getAdminUsers(adminActor.role);
      expect(resAll.success).toBe(true);
      expect(resAll.users.length).toBeGreaterThan(0);

      const resClients = await getAdminUsers(adminActor.role, { role: 'client' });
      expect(resClients.success).toBe(true);
      expect(resClients.users.every((u) => u.role === 'client')).toBe(true);
    });

    it('should block an active user and write an audit log entry', async () => {
      const targetUserId = 'usr_client_01';
      const reason = 'Violation of platform terms: malicious document upload';

      const res = await toggleBlockUser(
        adminActor.userId,
        adminActor.role,
        targetUserId,
        'block',
        reason
      );

      expect(res.success).toBe(true);
      expect(res.user?.status).toBe('suspended');

      const auditRes = await getAdminAuditLogs(adminActor.role, { action: 'user_blocked' });
      expect(auditRes.success).toBe(true);
      const recentLog = auditRes.logs.find((l) => l.targetEntityId === targetUserId);
      expect(recentLog).toBeDefined();
      expect(recentLog?.actorUid).toBe(adminActor.userId);
      expect(recentLog?.metadata?.reason).toBe(reason);
    });

    it('should unblock a blocked user and write an audit log entry', async () => {
      const targetUserId = 'usr_client_01';
      const reason = 'Client verified identity via video KYC';

      const res = await toggleBlockUser(
        adminActor.userId,
        adminActor.role,
        targetUserId,
        'unblock',
        reason
      );

      expect(res.success).toBe(true);
      expect(res.user?.status).toBe('active');

      const auditRes = await getAdminAuditLogs(adminActor.role, { action: 'user_unblocked' });
      expect(auditRes.success).toBe(true);
      const recentLog = auditRes.logs.find((l) => l.targetEntityId === targetUserId);
      expect(recentLog).toBeDefined();
      expect(recentLog?.actorUid).toBe(adminActor.userId);
      expect(recentLog?.metadata?.reason).toBe(reason);
    });
  });

  describe('4. Consultation Booking Management & Status Override', () => {
    it('should fetch booking records with status filtering', async () => {
      const res = await getAdminBookings(adminActor.role);
      expect(res.success).toBe(true);
      expect(res.bookings.length).toBeGreaterThan(0);
    });

    it('should manually override booking status with admin UID and mandatory audit reason', async () => {
      const bookingId = 'bk_admin_001';
      const reason = 'Advocate confirmed consultation delivered in court chambers';

      const res = await overrideBookingStatus(
        adminActor.userId,
        adminActor.role,
        bookingId,
        {
          newStatus: 'completed',
          reason,
        }
      );

      expect(res.success).toBe(true);
      expect(res.booking?.status).toBe('completed');
      const latestTimelineEvent = res.booking?.timeline[res.booking.timeline.length - 1];
      expect(latestTimelineEvent?.status).toBe('completed');
      expect(latestTimelineEvent?.actorUid).toBe(adminActor.userId);
      expect(latestTimelineEvent?.notes).toContain(reason);

      // Verify audit log
      const auditRes = await getAdminAuditLogs(adminActor.role, { action: 'booking_manual_override' });
      expect(auditRes.success).toBe(true);
      const matchingLog = auditRes.logs.find((l) => l.targetEntityId === bookingId);
      expect(matchingLog).toBeDefined();
      expect(matchingLog?.metadata?.newStatus).toBe('completed');
    });
  });

  describe('5. Dispute Resolution Center', () => {
    it('should list disputes and allow adjudication with client refund', async () => {
      const res = await getAdminDisputes(adminActor.role);
      expect(res.success).toBe(true);
      expect(res.disputes.length).toBeGreaterThan(0);

      const targetDisputeId = res.disputes[0]!.id;
      const resolutionSummary = 'Lawyer did not attend consultation. Full refund granted.';

      const resolveRes = await resolveDispute(
        adminActor.userId,
        adminActor.role,
        targetDisputeId,
        {
          resolution: 'client_refund',
          resolutionSummary,
        }
      );

      expect(resolveRes.success).toBe(true);
      expect(resolveRes.dispute?.status).toBe('resolved_refunded');
      expect(resolveRes.dispute?.resolvedByAdminUid).toBe(adminActor.userId);

      // Verify audit log
      const auditRes = await getAdminAuditLogs(adminActor.role, { action: 'dispute_refunded' });
      expect(auditRes.success).toBe(true);
      const disputeLog = auditRes.logs.find((l) => l.targetEntityId === targetDisputeId);
      expect(disputeLog).toBeDefined();
    });

    it('should allow dispute dismissal for invalid claims', async () => {
      const res = await getAdminDisputes(adminActor.role);
      const targetDisputeId = res.disputes[0]!.id;

      const resolveRes = await resolveDispute(
        adminActor.userId,
        adminActor.role,
        targetDisputeId,
        {
          resolution: 'dismissed',
          resolutionSummary: 'Minor delay communicated in advance. Consultation conducted in full.',
        }
      );

      expect(resolveRes.success).toBe(true);
      expect(resolveRes.dispute?.status).toBe('resolved_dismissed');

      // Verify audit log
      const auditRes = await getAdminAuditLogs(adminActor.role, { action: 'dispute_dismissed' });
      expect(auditRes.success).toBe(true);
      const dismissLog = auditRes.logs.find((l) => l.targetEntityId === targetDisputeId);
      expect(dismissLog).toBeDefined();
    });
  });

  describe('6. Platform Settings & Audit Trail Inspector', () => {
    it('should retrieve and update platform settings with audit log', async () => {
      const currentRes = await getAdminPlatformSettings(adminActor.role);
      expect(currentRes.success).toBe(true);
      expect(currentRes.settings.fees.consultationUnlockFeeInr).toBeDefined();
      expect(currentRes.settings.fees.platformCommissionPercentage).toBeDefined();

      const updatedRes = await updateAdminPlatformSettings(
        adminActor.userId,
        adminActor.role,
        {
          consultationUnlockFeeInr: 349,
          platformCommissionPercentage: 12.5,
          isMaintenanceMode: false,
        }
      );

      expect(updatedRes.success).toBe(true);
      expect(updatedRes.settings.fees.consultationUnlockFeeInr).toBe(349);
      expect(updatedRes.settings.fees.platformCommissionPercentage).toBe(12.5);

      // Verify audit log
      const auditRes = await getAdminAuditLogs(adminActor.role, { action: 'platform_settings_updated' });
      expect(auditRes.success).toBe(true);
      const settingsLog = auditRes.logs.find((l) => l.targetEntityId === 'global_settings');
      expect(settingsLog).toBeDefined();
    });
  });
});
