'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  BarChart3,
  TrendingUp,
  Users,
  IndianRupee,
  AlertTriangle,
  RotateCw,
  Database,
} from 'lucide-react';
import { useAuth } from '../../../../lib/auth/context';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';
import { AdminPortalNav } from '../../../../components/admin/admin-portal-nav';
import type {
  BusinessAnalyticsDashboardData,
  AnalyticsTimePeriod,
} from '@legalhub/types';
import { formatINR } from '@legalhub/utils';

export default function AdminAnalyticsPage() {
  const { role } = useAuth();
  const [data, setData] = useState<BusinessAnalyticsDashboardData | null>(null);
  const [period, setPeriod] = useState<AnalyticsTimePeriod>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAnalytics = useCallback(
    async (forceRefresh = false) => {
      try {
        if (forceRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setErrorMessage(null);

        const url = `/api/admin/analytics?period=${period}${
          forceRefresh ? '&refresh=true' : ''
        }`;
        const res = await fetch(url, {
          headers: {
            'x-user-role': role || 'admin',
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to load analytics');
        }

        const json = await res.json();
        setData(json.analytics);
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Error fetching analytics'
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [period, role]
  );

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const metrics = data?.metrics;
  const funnel = data?.funnel || [];
  const isSample = data?.isSampleData;

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <AdminPortalNav
        pendingKycCount={metrics?.pendingVerificationLawyers || 0}
        activeDisputesCount={metrics?.activeDisputes || 0}
      />

      <main className="py-8">
        <Container className="max-w-7xl">
          {/* Header & Controls */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="navy" className="text-xs">
                  Executive Intelligence
                </Badge>
                {/* Real Data vs Sample Data Indicator */}
                {isSample ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 border border-amber-300">
                    <Database className="h-3 w-3 text-amber-600" />
                    Development Seed Data
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-300">
                    <Database className="h-3 w-3 text-emerald-600" />
                    Production Database (Real Platform Data)
                  </span>
                )}
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-7 w-7 text-blue-700" />
                Platform Business Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Financial performance, booking lifecycle conversion rates, and growth metrics calculated strictly from actual data.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Time Period Filter */}
              <div className="flex items-center bg-white border border-slate-300 rounded-xl p-1 shadow-2xs">
                {(['today', '7d', '30d', 'all'] as AnalyticsTimePeriod[]).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        period === p
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {p === 'today'
                        ? 'Today'
                        : p === '7d'
                        ? '7 Days'
                        : p === '30d'
                        ? '30 Days'
                        : 'All Time'}
                    </button>
                  )
                )}
              </div>

              {/* Refresh / Invalidate Cache Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAnalytics(true)}
                disabled={isLoading || isRefreshing}
                leftIcon={
                  <RotateCw
                    className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`}
                  />
                }
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {errorMessage && (
            <Alert variant="error" className="mb-6">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>{errorMessage}</span>
            </Alert>
          )}

          {isLoading ? (
            <div className="py-24 text-center">
              <Spinner size="lg" className="mx-auto text-blue-700" />
              <p className="text-xs text-slate-500 mt-3 font-medium">
                Computing real-time analytics aggregation...
              </p>
            </div>
          ) : metrics ? (
            <div className="space-y-8">
              {/* Section 1: Financial & Revenue Metrics */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-emerald-600" />
                  Financial Health & Revenue Engine
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Gross Payment Volume */}
                  <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-5">
                      <span className="text-xs font-semibold text-slate-500">
                        Gross Payment Volume (GPV)
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                        {formatINR(metrics.grossPaymentVolumeInr)}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Total gross client volume processed
                      </span>
                    </CardContent>
                  </Card>

                  {/* Net Platform Revenue */}
                  <Card className="border-slate-200 bg-white shadow-xs border-l-4 border-l-emerald-600">
                    <CardContent className="p-5">
                      <span className="text-xs font-semibold text-slate-500">
                        Net Platform Revenue
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">
                        {formatINR(metrics.platformRevenueInr)}
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Unlock Fees + Commissions
                      </span>
                    </CardContent>
                  </Card>

                  {/* Unlock Revenue */}
                  <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-5">
                      <span className="text-xs font-semibold text-slate-500">
                        Consultation Unlock Fees
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                        {formatINR(metrics.unlockRevenueInr)}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Standard consultation bookings
                      </span>
                    </CardContent>
                  </Card>

                  {/* Commission & Refunds */}
                  <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-5">
                      <span className="text-xs font-semibold text-slate-500">
                        Commissions & Refunds
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                        {formatINR(metrics.commissionRevenueInr)}
                      </div>
                      <span className="text-[11px] text-red-600 mt-0.5 block">
                        {metrics.totalRefundsCount} refund(s) totaling {formatINR(metrics.totalRefundAmountInr)}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Section 2: Marketplace Operations & Booking Metrics */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Supply, Demand & Fulfillment Health
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Users */}
                  <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-5">
                      <span className="text-xs font-semibold text-slate-500">
                        Registered User Base
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                        {metrics.totalUsers}
                      </div>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        {metrics.clientUsers} Clients • {metrics.lawyerUsers} Advocates
                      </span>
                    </CardContent>
                  </Card>

                  {/* Verified Lawyers */}
                  <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-5">
                      <span className="text-xs font-semibold text-slate-500">
                        Verified Bar Council Advocates
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold text-blue-700 mt-2">
                        {metrics.verifiedLawyers}
                      </div>
                      <span className="text-[11px] text-amber-600 mt-0.5 block">
                        {metrics.pendingVerificationLawyers} pending credential review
                      </span>
                    </CardContent>
                  </Card>

                  {/* Consultations Booked */}
                  <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-5">
                      <span className="text-xs font-semibold text-slate-500">
                        Total Consultations
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                        {metrics.totalBookings}
                      </div>
                      <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                        {metrics.completedBookings} completed ({metrics.bookingCompletionRatePercentage}%)
                      </span>
                    </CardContent>
                  </Card>

                  {/* Cancellations & Disputes */}
                  <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-5">
                      <span className="text-xs font-semibold text-slate-500">
                        Cancellations & Disputes
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                        {metrics.cancelledBookings}
                      </div>
                      <span className="text-[11px] text-red-600 mt-0.5 block">
                        {metrics.activeDisputes} active dispute(s) ({metrics.totalDisputes} total)
                      </span>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Section 3: 8-Step Conversion Funnel */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    Marketplace Conversion Funnel (8 Stages)
                  </h2>
                  <span className="text-xs text-slate-400">
                    Step-by-step conversion from visitor to verified review
                  </span>
                </div>

                <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {funnel.map((stage, idx) => (
                        <div key={stage.stage} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-800">
                                {stage.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-semibold text-slate-900">
                                {stage.count.toLocaleString('en-IN')}
                              </span>
                              {idx > 0 && (
                                <span className="text-[11px] font-semibold text-emerald-600">
                                  {stage.conversionRateFromPrevious}% step conv.
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400">
                                ({stage.conversionRateFromTop}% overall)
                              </span>
                            </div>
                          </div>

                          {/* Visual Progress Bar */}
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                idx === 0
                                  ? 'bg-blue-600'
                                  : idx === 1
                                  ? 'bg-blue-500'
                                  : idx === 2
                                  ? 'bg-indigo-500'
                                  : idx === 3
                                  ? 'bg-purple-500'
                                  : idx === 4
                                  ? 'bg-emerald-500'
                                  : idx === 5
                                  ? 'bg-emerald-600'
                                  : idx === 6
                                  ? 'bg-teal-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{
                                width: `${Math.max(stage.conversionRateFromTop, 4)}%`,
                              }}
                            />
                          </div>

                          {idx > 0 && stage.dropoffCount > 0 && (
                            <div className="text-[10px] text-slate-400 pl-7">
                              ↳ Drop-off at this step: {stage.dropoffCount} users
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Section 4: Caching & Data Integrity Footer */}
              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-slate-400" />
                  <span>
                    Aggregated at {new Date(data.generatedAt).toLocaleTimeString('en-IN')}. Cached until {new Date(data.cachedUntil).toLocaleTimeString('en-IN')} to prevent expensive unbounded database queries.
                  </span>
                </div>
                <button
                  onClick={() => fetchAnalytics(true)}
                  className="text-blue-700 hover:text-blue-900 font-semibold underline text-xs"
                >
                  Force Instant Refresh
                </button>
              </div>
            </div>
          ) : null}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
