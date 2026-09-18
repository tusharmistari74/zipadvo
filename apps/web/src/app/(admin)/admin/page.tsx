'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Card,
  CardContent,
  Badge,
  Button,
  Spinner,
  Alert,
} from '@legalhub/ui';
import {
  Users,
  ShieldCheck,
  CalendarDays,
  CreditCard,
  AlertTriangle,
  Settings,
  History,
  TrendingUp,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth/context';
import { Navbar } from '../../../components/layout/navbar';
import { Footer } from '../../../components/layout/footer';
import { AdminPortalNav } from '../../../components/admin/admin-portal-nav';
import { getAdminDashboardMetrics } from '../../../lib/services/admin-portal.service';
import type { AdminDashboardMetrics } from '@legalhub/types';
import { formatINR } from '@legalhub/utils';

export default function AdminOverviewDashboardPage() {
  const { role } = useAuth();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await getAdminDashboardMetrics(role || 'admin');
        setMetrics(data);
      } catch {
        setErrorMessage('Failed to load administrative overview metrics');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [role]);

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <AdminPortalNav
        pendingKycCount={metrics?.pendingKycCount || 0}
        activeDisputesCount={metrics?.activeDisputesCount || 0}
      />

      <main className="py-8">
        <Container className="max-w-7xl">
          {/* Top Title Banner */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="navy" className="text-xs">
                  Operations & Compliance HQ
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Privileged Access: {role.toUpperCase()}
                </Badge>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Executive Administration Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Real-time Mumbai real estate legal marketplace operations, KYC verifications, and financial auditing.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/admin/audit-logs">
                <Button variant="outline" size="sm" leftIcon={<History className="h-4 w-4" />}>
                  Audit Trail
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="primary" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
                  Platform Settings
                </Button>
              </Link>
            </div>
          </div>

          {errorMessage && (
            <Alert variant="error" className="mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{errorMessage}</span>
            </Alert>
          )}

          {/* Pending Verification & Disputes Alert Banners */}
          <div className="space-y-4 mb-8">
            {(metrics?.pendingKycCount ?? 0) > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-950">
                      {metrics?.pendingKycCount} Advocate Verification Application{metrics?.pendingKycCount === 1 ? '' : 's'} Pending Review
                    </h3>
                    <p className="text-xs text-amber-800 mt-0.5">
                      New Bar Council of Maharashtra & Goa applicants waiting for credential inspection.
                    </p>
                  </div>
                </div>

                <Link href="/admin/lawyers?status=submitted" className="shrink-0">
                  <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white border-none text-xs">
                    Inspect KYC Applications →
                  </Button>
                </Link>
              </div>
            )}

            {(metrics?.activeDisputesCount ?? 0) > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-red-500/10 border border-red-300 text-red-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-red-600 text-white shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-950">
                      {metrics?.activeDisputesCount} Active Consultation Dispute{metrics?.activeDisputesCount === 1 ? '' : 's'}
                    </h3>
                    <p className="text-xs text-red-800 mt-0.5">
                      Client escalations requiring compliance investigation and resolution.
                    </p>
                  </div>
                </div>

                <Link href="/admin/disputes" className="shrink-0">
                  <Button variant="primary" size="sm" className="bg-red-600 hover:bg-red-700 text-white border-none text-xs">
                    Open Dispute Center →
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Metric Cards */}
          {isLoading ? (
            <div className="py-20 text-center">
              <Spinner size="lg" className="mx-auto text-blue-700" />
              <p className="text-xs text-slate-500 mt-2">Loading metrics...</p>
            </div>
          ) : metrics ? (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Users */}
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Registered Users</span>
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                        <Users className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                      {metrics.totalUsersCount}
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> +{metrics.momUserGrowthPercentage}% MoM Growth
                    </span>
                  </CardContent>
                </Card>

                {/* Verified Advocates */}
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Verified Advocates</span>
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                      {metrics.verifiedLawyersCount}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      {metrics.pendingKycCount} pending verification
                    </span>
                  </CardContent>
                </Card>

                {/* Consultations Booked */}
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Total Consultations</span>
                      <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                      {metrics.totalBookingsCount}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      {metrics.todayBookingsCount} consultations today
                    </span>
                  </CardContent>
                </Card>

                {/* Gross Volume */}
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Gross Volume (₹)</span>
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                        <IndianRupee className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">
                      {formatINR(metrics.totalGrossRevenueInr)}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Commission: {formatINR(metrics.totalPlatformCommissionInr)}
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Navigation Quick Links Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
                  <CardContent className="p-6 space-y-3">
                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 w-fit">
                      <Users className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">User Account Directory</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Search and inspect property clients and advocates, view linked consultation counts, and suspend accounts.
                    </p>
                    <Link href="/admin/users" className="block pt-2">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Manage Users →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
                  <CardContent className="p-6 space-y-3">
                    <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 w-fit">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Bookings & Manual Overrides</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Monitor all Mumbai property consultations, inspect lifecycle timelines, and execute authorized state overrides.
                    </p>
                    <Link href="/admin/bookings" className="block pt-2">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Manage Bookings →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
                  <CardContent className="p-6 space-y-3">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 w-fit">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Payments & Refund Settlement</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Reconcile Razorpay transactions, platform commissions, and execute server-authorized client refunds.
                    </p>
                    <Link href="/admin/payments" className="block pt-2">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Financial Ledger →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
