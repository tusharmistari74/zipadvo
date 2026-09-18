import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculatePlatformBusinessMetrics,
  getFunnelAnalytics,
  trackFunnelEvent,
  getBusinessAnalyticsDashboard,
  invalidateAnalyticsCache,
  resetAnalyticsStores,
  seedAnalyticsTestData,
} from '../../apps/web/src/lib/services/analytics.service';
import type { UserRole } from '@legalhub/types';

describe('Phase 21: Business Analytics Engine', () => {
  const adminActor = {
    userId: 'admin_sys_01',
    role: 'admin' as UserRole,
  };

  const superAdminActor = {
    userId: 'super_admin_01',
    role: 'super_admin' as UserRole,
  };

  const clientActor = {
    userId: 'usr_client_01',
    role: 'client' as UserRole,
  };

  const lawyerActor = {
    userId: 'usr_lawyer_01',
    role: 'lawyer' as UserRole,
  };

  beforeEach(() => {
    resetAnalyticsStores();
    seedAnalyticsTestData();
  });

  describe('1. Real Platform Metrics Aggregation', () => {
    it('should accurately calculate user and advocate metrics from platform records', async () => {
      const metrics = await calculatePlatformBusinessMetrics('all');

      expect(metrics.totalUsers).toBe(4);
      expect(metrics.clientUsers).toBe(2);
      expect(metrics.lawyerUsers).toBe(2);
      expect(metrics.verifiedLawyers).toBe(1);
      expect(metrics.pendingVerificationLawyers).toBe(1);
    });

    it('should accurately calculate booking lifecycle metrics and completion rates', async () => {
      const metrics = await calculatePlatformBusinessMetrics('all');

      expect(metrics.totalBookings).toBe(2);
      expect(metrics.completedBookings).toBe(1);
      expect(metrics.confirmedBookings).toBe(1);
      expect(metrics.cancelledBookings).toBe(0);
      expect(metrics.disputedBookings).toBe(0);
      expect(metrics.bookingCompletionRatePercentage).toBe(50); // 1 out of 2 completed
      expect(metrics.bookingCancellationRatePercentage).toBe(0);
    });

    it('should accurately compute financial figures strictly from payment transactions', async () => {
      const metrics = await calculatePlatformBusinessMetrics('all');

      // 2 unlock payments of ₹299 = ₹598 GPV
      expect(metrics.grossPaymentVolumeInr).toBe(598);
      expect(metrics.unlockRevenueInr).toBe(598);
      // 10% commission on 1 completed booking fee (₹299 * 0.1) = ₹30
      expect(metrics.commissionRevenueInr).toBe(30);
      // Net platform revenue = ₹598 + ₹30 = ₹628
      expect(metrics.platformRevenueInr).toBe(628);
      expect(metrics.totalRefundsCount).toBe(0);
      expect(metrics.totalRefundAmountInr).toBe(0);
    });
  });

  describe('2. 8-Step Conversion Funnel Analytics', () => {
    it('should return all 8 required conversion stages in sequential order', async () => {
      const funnel = await getFunnelAnalytics('all');

      expect(funnel.length).toBe(8);
      expect(funnel.map((s) => s.stage)).toEqual([
        'visitor',
        'lawyer_search',
        'profile_view',
        'booking_started',
        'payment_success',
        'lawyer_accepted',
        'completed',
        'review_submitted',
      ]);
    });

    it('should compute step-by-step conversion rates and drop-off numbers', async () => {
      const funnel = await getFunnelAnalytics('all');

      const visitorStage = funnel[0]!;
      expect(visitorStage.stage).toBe('visitor');
      expect(visitorStage.count).toBeGreaterThan(0);
      expect(visitorStage.conversionRateFromTop).toBe(100);

      const paymentStage = funnel.find((s) => s.stage === 'payment_success');
      expect(paymentStage).toBeDefined();
      expect(paymentStage!.conversionRateFromPrevious).toBeGreaterThan(0);
      expect(paymentStage!.conversionRateFromTop).toBeGreaterThan(0);
    });

    it('should dynamically update funnel metrics upon tracking new events', async () => {
      const initialFunnel = await getFunnelAnalytics('all');
      const initialSearchCount =
        initialFunnel.find((s) => s.stage === 'lawyer_search')?.count || 0;

      await trackFunnelEvent({
        stage: 'lawyer_search',
        userId: 'usr_c_01',
        metadata: { query: 'redevelopment lawyer bandra' },
      });

      const updatedFunnel = await getFunnelAnalytics('all');
      const updatedSearchCount =
        updatedFunnel.find((s) => s.stage === 'lawyer_search')?.count || 0;

      expect(updatedSearchCount).toBe(initialSearchCount + 1);
    });
  });

  describe('3. Data Source Integrity (Distinguishing Real vs Sample Data)', () => {
    it('should flag sample test data accurately', async () => {
      const metrics = await calculatePlatformBusinessMetrics('all');

      expect(metrics.isSampleData).toBe(true);
      expect(metrics.dataSource).toBe('development_seed');
    });
  });

  describe('4. Caching & Performance Optimization', () => {
    it('should return cached dashboard data and allow explicit cache invalidation', async () => {
      const firstRes = await getBusinessAnalyticsDashboard(adminActor.role);
      expect(firstRes.success).toBe(true);
      const firstGeneratedAt = firstRes.data?.generatedAt;

      // Second call immediately should return identical cached instance
      const secondRes = await getBusinessAnalyticsDashboard(adminActor.role);
      expect(secondRes.success).toBe(true);
      expect(secondRes.data?.generatedAt).toBe(firstGeneratedAt);

      // Force refresh should regenerate with new timestamp
      invalidateAnalyticsCache();
      const thirdRes = await getBusinessAnalyticsDashboard(adminActor.role, {
        forceRefresh: true,
      });
      expect(thirdRes.success).toBe(true);
      expect(thirdRes.data?.generatedAt).toBeDefined();
    });
  });

  describe('5. RBAC & Security Authorization', () => {
    it('should forbid non-admin client actors from accessing business analytics', async () => {
      const res = await getBusinessAnalyticsDashboard(clientActor.role);

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Forbidden/i);
    });

    it('should forbid non-admin lawyer actors from accessing business analytics', async () => {
      const res = await getBusinessAnalyticsDashboard(lawyerActor.role);

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Forbidden/i);
    });

    it('should allow admin and super_admin actors to access business analytics', async () => {
      const adminRes = await getBusinessAnalyticsDashboard(adminActor.role);
      expect(adminRes.success).toBe(true);
      expect(adminRes.data?.metrics).toBeDefined();
      expect(adminRes.data?.funnel).toBeDefined();

      const superAdminRes = await getBusinessAnalyticsDashboard(
        superAdminActor.role
      );
      expect(superAdminRes.success).toBe(true);
      expect(superAdminRes.data?.metrics).toBeDefined();
    });
  });
});
