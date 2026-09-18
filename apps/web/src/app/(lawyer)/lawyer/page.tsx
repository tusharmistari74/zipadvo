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
  StatusBadge,
} from '@legalhub/ui';
import {
  CalendarDays,
  Clock,
  IndianRupee,
  Star,
  ShieldCheck,
  FileText,
  AlertCircle,
  Users,
  ChevronRight,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth/context';
import { Navbar } from '../../../components/layout/navbar';
import { Footer } from '../../../components/layout/footer';
import { LawyerPortalNav } from '../../../components/lawyer/lawyer-portal-nav';
import { getLawyerDashboardOverview } from '../../../lib/services/lawyer-dashboard.service';
import type { LawyerDashboardOverview, Booking } from '@legalhub/types';
import { formatDate, formatINR } from '@legalhub/utils';

export default function LawyerPortalOverviewPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [overview, setOverview] = useState<LawyerDashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const lawyerUid = user?.uid || 'lawyer-1';

    try {
      const data = await getLawyerDashboardOverview(lawyerUid);
      setOverview(data);
    } catch {
      setErrorMessage('Failed to load advocate overview');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.uid]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Container className="py-24 text-center">
          <Spinner size="lg" className="mx-auto text-blue-700" />
          <p className="text-sm text-slate-600 mt-4">Loading advocate console...</p>
        </Container>
        <Footer />
      </div>
    );
  }

  const metrics = overview?.metrics;

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <LawyerPortalNav
        pendingCount={metrics?.pendingRequestsCount || 0}
        unreadNotifsCount={overview?.unreadNotificationCount || 0}
      />

      <main className="py-8">
        <Container className="max-w-7xl">
          {/* Top Welcome Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="navy" className="text-xs">
                  Advocate Practice Console
                </Badge>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Bar Council Verified
                </Badge>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Welcome, {profile?.fullName || 'Adv. Rajeshwar Deshmukh'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Practice management, client consultation scheduling, and financial records for Mumbai property practice.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/lawyer/calendar">
                <Button variant="outline" size="sm" leftIcon={<Calendar className="h-4 w-4" />}>
                  Manage Calendar
                </Button>
              </Link>
              <Link href="/lawyer/bookings">
                <Button variant="primary" size="sm" leftIcon={<CalendarDays className="h-4 w-4" />}>
                  View Bookings
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

          {/* Pending Booking Alert Banner */}
          {(metrics?.pendingRequestsCount ?? 0) > 0 && (
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5 sm:mt-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-950">
                    {metrics?.pendingRequestsCount} Pending Consultation Request{metrics?.pendingRequestsCount === 1 ? '' : 's'}
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Clients have completed payment and are waiting for your schedule confirmation. Please review and respond.
                  </p>
                </div>
              </div>

              <Link href="/lawyer/bookings?status=pending_lawyer" className="shrink-0">
                <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white border-none">
                  Review & Accept Requests →
                </Button>
              </Link>
            </div>
          )}

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Today Appointments */}
            <Card className="border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Today's Schedule</span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {metrics?.todayAppointmentsCount || 0}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Confirmed appointments today
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Active Consultations */}
            <Card className="border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Active Consultations</span>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {metrics?.activeConsultationsCount || 0}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    In-progress / Confirmed cases
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Earnings */}
            <Card className="border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">This Month (Net)</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <IndianRupee className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
                    {formatINR(metrics?.monthlyEarningsInr || 0)}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    After 15% platform commission
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Rating */}
            <Card className="border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Client Rating</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {metrics?.rating || 4.9}
                  </div>
                  <span className="text-xs text-slate-500">
                    ({metrics?.reviewCount || 38} reviews)
                  </span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                  Top 5% Rated Advocate
                </span>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Today's Appointments Column (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-slate-200 bg-white shadow-xs">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                      <Clock className="h-4 w-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">Today's Appointments</h2>
                  </div>
                  <Link href="/lawyer/calendar" className="text-xs text-blue-700 hover:text-blue-900 font-medium">
                    View full schedule →
                  </Link>
                </div>

                <CardContent className="p-5">
                  {overview?.todayAppointments && overview.todayAppointments.length > 0 ? (
                    <div className="space-y-3">
                      {overview.todayAppointments.map((booking: Booking) => (
                        <div
                          key={booking.id}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {booking.clientName}
                              </span>
                              <StatusBadge status={booking.status} />
                              <Badge variant="outline" className="text-[10px]">
                                {booking.consultationMode === 'in_person_office' ? 'Office Consultation' : 'Video Call'}
                              </Badge>
                            </div>

                            <p className="text-xs text-slate-600 font-medium">
                              {booking.serviceCategory}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                              <span className="flex items-center gap-1 font-semibold text-blue-900">
                                <Clock className="h-3.5 w-3.5" />
                                {booking.preferredTimeSlot}
                              </span>
                              <span>Ref: {booking.bookingReferenceNumber}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link href={`/lawyer/bookings`}>
                              <Button variant="outline" size="sm">
                                Case Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">No appointments scheduled for today</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        New consultation bookings will appear here once accepted.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Bookings List */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">Recent Booking Activity</h2>
                  </div>
                  <Link href="/lawyer/bookings" className="text-xs text-blue-700 hover:text-blue-900 font-medium">
                    View all bookings ({overview?.recentBookings.length || 0}) →
                  </Link>
                </div>

                <CardContent className="p-0 divide-y divide-slate-100">
                  {overview?.recentBookings && overview.recentBookings.length > 0 ? (
                    overview.recentBookings.slice(0, 5).map((b: Booking) => (
                      <div key={b.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{b.clientName}</span>
                            <StatusBadge status={b.status} />
                          </div>
                          <p className="text-xs text-slate-500">{b.serviceCategory}</p>
                          <span className="text-[10px] text-slate-400 block">
                            Appt: {b.preferredDate} at {b.preferredTimeSlot} • Created: {formatDate(b.createdAt)}
                          </span>
                        </div>

                        <Link href={`/lawyer/bookings`}>
                          <Button variant="ghost" size="sm" className="text-xs text-blue-700">
                            Manage <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      No recent bookings recorded.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Quick Tools & KYC Card */}
            <div className="space-y-6">
              {/* KYC Status Card */}
              <Card className="border-emerald-200 bg-emerald-50/30 shadow-xs">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-emerald-950">Bar Council Verification</h3>
                        <span className="text-[11px] text-emerald-700 font-medium">MAH/4821/2012</span>
                      </div>
                    </div>
                    <Badge variant="navy" className="bg-emerald-600 text-white text-[10px]">
                      Active
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your enrollment with Bar Council of Maharashtra and Goa is verified. Your profile is publicly discoverable.
                  </p>

                  <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Sanad Certificate</span>
                    <Link href="/lawyer/kyc" className="font-semibold text-emerald-800 hover:text-emerald-950">
                      View KYC Details →
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Practice Actions */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">Practice Tools</h3>
                </div>
                <CardContent className="p-3 space-y-1">
                  <Link
                    href="/lawyer/calendar"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Configure Slot Availability</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>

                  <Link
                    href="/lawyer/documents"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span>Client Case Documents ({overview?.recentDocuments.length || 0})</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>

                  <Link
                    href="/lawyer/earnings"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <IndianRupee className="h-4 w-4 text-emerald-600" />
                      <span>Earnings & Payout Ledger</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>

                  <Link
                    href="/lawyer/profile"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      <span>Edit Chamber Profile & Fees</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
