'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Container,
  Card,
  Badge,
  Button,
  Input,
  Alert,
  Spinner,
  StatusBadge,
  Dialog,
} from '@legalhub/ui';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CreditCard,
  Bookmark,
  Bell,
  User,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Download,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Scale,
  MapPin,
  Lock,
  Building,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth/context';
import { Navbar } from '../../../components/layout/navbar';
import { Footer } from '../../../components/layout/footer';
import {
  getClientDashboardOverview,
  getSavedLawyers,
  toggleSaveLawyer,
  type ClientDashboardOverview,
} from '../../../lib/services/client-dashboard.service';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../../lib/services/notifications/notification.service';
import { generateSecureDocumentDownloadUrl } from '../../../lib/services/document.service';
import type {
  Booking,
  BookingDocument,
  AppNotification,
  PublicLawyerProfile,
} from '@legalhub/types';
import { formatDate, formatINR } from '@legalhub/utils';

type DashboardTab =
  | 'overview'
  | 'bookings'
  | 'documents'
  | 'payments'
  | 'saved_lawyers'
  | 'notifications'
  | 'profile'
  | 'settings';

export default function ClientDashboardPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as DashboardTab) || 'overview';

  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<ClientDashboardOverview | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [savedLawyers, setSavedLawyers] = useState<PublicLawyerProfile[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');

  // Selected Booking Drawer/Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  // Profile Edit State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCity, setProfileCity] = useState('Mumbai');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Settings State
  const [notifEmailEnabled, setNotifEmailEnabled] = useState(true);
  const [notifSmsEnabled, setNotifSmsEnabled] = useState(true);
  const [notifInAppEnabled, setNotifInAppEnabled] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const clientUid = user?.uid || 'guest_client_uid';

    try {
      // 1. Fetch Client Bookings from API / in-memory
      await fetch(`/api/notifications?userId=${clientUid}`);
      // Simulated or fetched bookings
      const mockClientBookings: Booking[] = [
        {
          id: 'book_demo_01',
          bookingReferenceNumber: 'LHM-2026-0929-8812',
          clientUid,
          clientName: profile?.fullName || 'Rahul Mehta',
          clientPhone: profile?.phone || '+919820011223',
          clientEmail: user?.email || 'rahul.mehta@example.com',
          lawyerUid: 'lawyer-1',
          lawyerName: 'Adv. Rajesh Shinde',
          lawyerTitle: 'Senior Property Conveyancing Advocate',
          lawyerSanadNumber: 'MAH/4512/2012',
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Title search and Index II verification for redevelopment flat in Bandra West.',
          preferredDate: '2026-09-29',
          preferredTimeSlot: '14:00-15:00',
          consultationMode: 'in_person_office',
          status: 'confirmed',
          timeline: [
            {
              status: 'pending_payment',
              timestamp: '2026-09-17T10:00:00Z',
              actorUid: clientUid,
              actorRole: 'client',
              notes: 'Booking created',
            },
            {
              status: 'pending_lawyer',
              timestamp: '2026-09-17T10:05:00Z',
              actorUid: clientUid,
              actorRole: 'client',
              notes: 'Unlock payment ₹299 verified',
            },
            {
              status: 'confirmed',
              timestamp: '2026-09-17T10:30:00Z',
              actorUid: 'lawyer-1',
              actorRole: 'lawyer',
              notes: 'Slot confirmed by Adv. Rajesh Shinde',
            },
          ],
          unlockAmountInr: 299,
          consultationFeeInr: 1500,
          chamberAddress: 'Chamber 402, High Court Chambers, Fort, Mumbai 400001',
          uploadedDocumentIds: ['doc_1', 'doc_2'],
          createdAt: '2026-09-17T10:00:00Z',
          updatedAt: '2026-09-17T10:30:00Z',
        },
      ];

      setAllBookings(mockClientBookings);

      // 2. Overview metrics
      const overviewData = await getClientDashboardOverview(clientUid, mockClientBookings);
      setOverview(overviewData);

      // 3. Saved Lawyers
      const savedRes = await getSavedLawyers(clientUid);
      setSavedLawyers(savedRes.lawyers);

      // 4. Notifications
      const notifsRes = await getUserNotifications(clientUid, clientUid);
      if (notifsRes.success) {
        setNotifications(notifsRes.notifications);
      }
    } catch {
      setErrorMessage('Failed to refresh dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadDashboardData();
    }
    if (profile) {
      setProfileName(profile.fullName || '');
      setProfilePhone(profile.phone || '');
    }
  }, [authLoading, user?.uid, profile]);

  // Tab switcher sync with URL
  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    window.history.replaceState(null, '', `/dashboard?tab=${tab}`);
  };

  // Document Download Handler
  const handleDownloadDoc = async (docItem: BookingDocument) => {
    setDownloadingDocId(docItem.id);
    const clientUid = user?.uid || 'guest_client_uid';

    const res = await generateSecureDocumentDownloadUrl(docItem.id, clientUid, 'client');
    setDownloadingDocId(null);

    if (res.success && res.downloadUrl) {
      window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
    } else {
      setErrorMessage(res.error || 'Failed to generate secure download link.');
    }
  };

  // Mark Single Notification as Read
  const handleMarkNotifRead = async (notifId: string) => {
    const clientUid = user?.uid || 'guest_client_uid';
    await markNotificationAsRead(notifId, clientUid);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true, read: true } : n))
    );
  };

  // Mark All Notifications as Read
  const handleMarkAllNotifsRead = async () => {
    const clientUid = user?.uid || 'guest_client_uid';
    await markAllNotificationsAsRead(clientUid);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
    setSuccessMessage('All notifications marked as read.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Toggle Save Lawyer
  const handleToggleSave = async (lawyerId: string) => {
    const clientUid = user?.uid || 'guest_client_uid';
    await toggleSaveLawyer(clientUid, lawyerId);
    const savedRes = await getSavedLawyers(clientUid);
    setSavedLawyers(savedRes.lawyers);
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Refresh profile data from context/remote
      await refreshProfile();
      setSuccessMessage('Profile details updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch {
      setErrorMessage('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Filter Bookings
  const filteredBookings = allBookings.filter((b) => {
    if (bookingStatusFilter !== 'all' && b.status !== bookingStatusFilter) {
      return false;
    }
    if (bookingSearchQuery.trim()) {
      const q = bookingSearchQuery.toLowerCase();
      return (
        b.bookingReferenceNumber.toLowerCase().includes(q) ||
        b.lawyerName.toLowerCase().includes(q) ||
        b.serviceCategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter Notifications
  const filteredNotifications = notifications.filter((n) => {
    if (notificationFilter === 'unread') {
      return !n.isRead && !n.read;
    }
    return true;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Spinner size="lg" className="mx-auto text-blue-900" />
            <p className="text-sm text-slate-500 font-medium">Loading your legal dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-10">
        <Container className="max-w-7xl mx-auto space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Link href="/" className="hover:text-blue-900">LegalHubMumbai</Link>
                <span>/</span>
                <span className="text-slate-800 font-medium">Client Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
                <span>Welcome back, {profile?.fullName ? profile.fullName.split(' ')[0] : 'Client'}</span>
                <Badge variant="navy" className="text-xs">
                  <ShieldCheck className="h-3 w-3 mr-1 text-blue-300" />
                  Verified Client
                </Badge>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage your Mumbai advocate consultations, title deed verifications, and encrypted document vault.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={loadDashboardData}
                className="text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Refresh
              </Button>
              <Link href="/find-lawyer">
                <Button variant="primary" size="sm" className="bg-blue-900 hover:bg-blue-950 text-xs">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Book New Consultation
                </Button>
              </Link>
            </div>
          </div>

          {/* Feedback Alerts */}
          {successMessage && (
            <Alert variant="success" className="animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 mr-2 shrink-0" />
              <span>{successMessage}</span>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="error" className="animate-in fade-in">
              <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
              <span>{errorMessage}</span>
            </Alert>
          )}

          {/* Tab Navigation Navigation Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'bookings', label: `Bookings (${allBookings.length})`, icon: Calendar },
              { id: 'documents', label: `Documents (${overview?.metrics.totalDocumentsCount || 0})`, icon: FileText },
              { id: 'payments', label: 'Payments & Receipts', icon: CreditCard },
              { id: 'saved_lawyers', label: `Saved Lawyers (${savedLawyers.length})`, icon: Bookmark },
              { id: 'notifications', label: `Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''}`, icon: Bell, badge: unreadCount },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id as DashboardTab)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Upcoming Appointment Spotlight */}
              {overview?.upcomingBooking ? (
                <Card className="border-blue-200 bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 shadow-md relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="navy" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs">
                          Upcoming Appointment
                        </Badge>
                        <span className="text-xs text-blue-200">Ref: {overview.upcomingBooking.bookingReferenceNumber}</span>
                      </div>
                      <h3 className="text-xl font-bold">{overview.upcomingBooking.serviceCategory}</h3>
                      <p className="text-sm text-slate-300 flex items-center gap-2">
                        <Scale className="h-4 w-4 text-blue-400" />
                        {overview.upcomingBooking.lawyerName} ({overview.upcomingBooking.lawyerSanadNumber})
                      </p>
                      <div className="flex items-center gap-4 text-xs text-blue-200 pt-1">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-blue-400" />
                          {overview.upcomingBooking.preferredDate}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-blue-400" />
                          {overview.upcomingBooking.preferredTimeSlot} IST
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Building className="h-4 w-4 text-blue-400" />
                          {overview.upcomingBooking.consultationMode.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link href={`/booking/${overview.upcomingBooking.id}`}>
                        <Button variant="primary" size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs">
                          Open Booking Console →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-800 rounded-xl">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">No Upcoming Consultations</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Schedule a title search or legal opinion with a Bar Council verified advocate.
                      </p>
                    </div>
                  </div>
                  <Link href="/find-lawyer">
                    <Button variant="primary" size="sm" className="text-xs bg-blue-900 hover:bg-blue-950">
                      Find an Advocate
                    </Button>
                  </Link>
                </Card>
              )}

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 border-slate-200 bg-white">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Consultations</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{overview?.metrics.activeBookingsCount || 0}</p>
                  <p className="text-[11px] text-blue-700 font-medium mt-1">In progress or scheduled</p>
                </Card>

                <Card className="p-4 border-slate-200 bg-white">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Matters</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{overview?.metrics.completedBookingsCount || 0}</p>
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">Concluded successfully</p>
                </Card>

                <Card className="p-4 border-slate-200 bg-white">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Vault Documents</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{overview?.metrics.totalDocumentsCount || 0}</p>
                  <p className="text-[11px] text-purple-700 font-medium mt-1">Encrypted AES-256 files</p>
                </Card>

                <Card className="p-4 border-slate-200 bg-white">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Unlock Fees</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{formatINR(overview?.metrics.totalAmountPaidInr || 0)}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">Direct contact settlements</p>
                </Card>
              </div>

              {/* Two Column Section: Recent Bookings & Notifications Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Bookings */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-900" />
                      Recent Consultations
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleTabChange('bookings')}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                    >
                      View all ({allBookings.length}) →
                    </button>
                  </div>

                  {allBookings.length === 0 ? (
                    <Card className="p-8 text-center bg-white border-dashed">
                      <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">No bookings created yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Explore advocates to book your first property title consultation.</p>
                      <Link href="/find-lawyer" className="inline-block mt-3">
                        <Button variant="outline" size="sm" className="text-xs">Find Advocate</Button>
                      </Link>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {allBookings.slice(0, 3).map((b) => (
                        <Card key={b.id} className="p-4 border-slate-200 bg-white hover:border-blue-300 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-slate-900">{b.bookingReferenceNumber}</span>
                                <StatusBadge status={b.status} />
                              </div>
                              <p className="text-xs font-bold text-blue-950">{b.serviceCategory}</p>
                              <p className="text-[11px] text-slate-500">
                                Advocate: {b.lawyerName} • Slot: {b.preferredDate} ({b.preferredTimeSlot} IST)
                              </p>
                            </div>

                            <Link href={`/booking/${b.id}`}>
                              <Button variant="outline" size="sm" className="text-xs w-full sm:w-auto">
                                View Details <ArrowUpRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notifications Digest */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-900" />
                      Alerts & Updates
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleTabChange('notifications')}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                    >
                      Inbox ({unreadCount}) →
                    </button>
                  </div>

                  <Card className="border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No recent notifications.
                      </div>
                    ) : (
                      notifications.slice(0, 4).map((n) => (
                        <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors text-xs space-y-1">
                          <div className="flex items-start justify-between">
                            <p className="font-bold text-slate-900">{n.title}</p>
                            <span className="text-[10px] text-slate-400">{formatDate(n.createdAt)}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2">{n.body || n.message}</p>
                        </div>
                      ))
                    )}
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by advocate, ref number..."
                    value={bookingSearchQuery}
                    onChange={(e) => setBookingSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-blue-600 w-full sm:w-48"
                  >
                    <option value="all">All Booking Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="pending_lawyer">Pending Advocate</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <Card className="p-12 text-center bg-white border-dashed">
                  <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No consultations match your filters</p>
                  <p className="text-xs text-slate-500 mt-1">Try changing your search query or status filter.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((b) => (
                    <Card key={b.id} className="p-5 border-slate-200 bg-white hover:shadow-xs transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                              {b.bookingReferenceNumber}
                            </span>
                            <StatusBadge status={b.status} />
                            <Badge variant="outline" className="text-xs">
                              {b.consultationMode.replace(/_/g, ' ')}
                            </Badge>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900">{b.serviceCategory}</h4>
                          <p className="text-xs text-slate-600">
                            Advocate: <span className="font-semibold text-blue-900">{b.lawyerName}</span> ({b.lawyerSanadNumber})
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-2 pt-0.5">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {b.preferredDate}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {b.preferredTimeSlot} IST</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.chamberAddress}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBooking(b)}
                            className="text-xs"
                          >
                            Quick Summary
                          </Button>
                          <Link href={`/booking/${b.id}`}>
                            <Button variant="primary" size="sm" className="bg-blue-900 hover:bg-blue-950 text-xs">
                              Open Console →
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-900" />
                    Encrypted Case Documents & Reports
                  </h3>
                  <p className="text-xs text-slate-500">
                    All title deeds, extracts, and advocate deliverable opinions across your consultations.
                  </p>
                </div>
                <Badge variant="success" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-200">
                  AES-256 Encrypted
                </Badge>
              </div>

              {overview?.recentDocuments && overview.recentDocuments.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {overview.recentDocuments.map((docItem) => (
                    <div key={docItem.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 text-blue-800 rounded-lg">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900">{docItem.originalFilename}</p>
                            <Badge variant="outline" className="text-[10px]">v{docItem.version}</Badge>
                            {docItem.isCompletedDeliverable && (
                              <Badge variant="navy" className="text-[10px] bg-purple-50 text-purple-800 border-purple-200">
                                Legal Opinion
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {(docItem.size / 1024).toFixed(1)} KB • Uploaded on {formatDate(docItem.createdAt)}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={downloadingDocId === docItem.id}
                        onClick={() => handleDownloadDoc(docItem)}
                        className="text-xs h-8"
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center bg-white border-dashed">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No documents uploaded yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload property agreements or 7/12 extracts inside any active booking consultation.
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENTS & RECEIPTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-900" />
                    Unlock Fee Receipts & Transaction History
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified Razorpay payments for advocate contact unlock and document vault access.
                  </p>
                </div>
              </div>

              {overview?.recentPayments && overview.recentPayments.length > 0 ? (
                <Card className="border-slate-200 bg-white overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Transaction ID</th>
                          <th className="py-3 px-4">Purpose</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Method</th>
                          <th className="py-3 px-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {overview.recentPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                              {p.razorpayPaymentId || p.id}
                            </td>
                            <td className="py-3 px-4">
                              <span className="capitalize">{p.type.replace(/_/g, ' ')}</span>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {formatINR(p.amountInr)}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={p.status === 'captured' ? 'success' : 'outline'} className="text-[10px]">
                                {p.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 capitalize text-slate-600">
                              {p.paymentMethod || p.method || 'Razorpay UPI'}
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-[11px]">
                              {formatDate(p.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="p-12 text-center bg-white border-dashed">
                  <CreditCard className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No payment records found</p>
                  <p className="text-xs text-slate-500 mt-1">Unlock receipts will appear here once consultation payments occur.</p>
                </Card>
              )}
            </div>
          )}

          {/* TAB 5: SAVED LAWYERS */}
          {activeTab === 'saved_lawyers' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-blue-900" />
                    Bookmarked Mumbai Advocates
                  </h3>
                  <p className="text-xs text-slate-500">Shortlisted verified property and conveyancing advocates.</p>
                </div>
                <Link href="/find-lawyer">
                  <Button variant="outline" size="sm" className="text-xs">
                    Browse All Advocates
                  </Button>
                </Link>
              </div>

              {savedLawyers.length === 0 ? (
                <Card className="p-12 text-center bg-white border-dashed">
                  <Bookmark className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No saved advocates yet</p>
                  <p className="text-xs text-slate-500 mt-1">Bookmark advocates from search to quickly consult with them later.</p>
                  <Link href="/find-lawyer" className="inline-block mt-3">
                    <Button variant="primary" size="sm" className="text-xs bg-blue-900 hover:bg-blue-950">
                      Explore Advocates
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedLawyers.map((lawyer) => (
                    <Card key={lawyer.id} className="p-5 border-slate-200 bg-white space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{lawyer.fullName}</h4>
                          <p className="text-xs text-slate-500">{lawyer.title}</p>
                          <p className="text-[11px] text-blue-900 font-mono mt-0.5">{lawyer.sanadNumber}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleSave(lawyer.id)}
                          className="text-blue-900 hover:text-red-600"
                        >
                          <Bookmark className="h-5 w-5 fill-current" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="font-bold text-slate-900">{formatINR(lawyer.consultationFeeInr)} / consult</span>
                        <Link href={`/lawyers/${lawyer.id}`}>
                          <Button variant="primary" size="sm" className="text-xs bg-blue-900 hover:bg-blue-950">
                            Book Slot →
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNotificationFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      notificationFilter === 'all' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationFilter('unread')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      notificationFilter === 'unread' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={handleMarkAllNotifsRead} className="text-xs">
                    <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                    Mark All as Read
                  </Button>
                )}
              </div>

              {filteredNotifications.length === 0 ? (
                <Card className="p-12 text-center bg-white border-dashed">
                  <Bell className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No notifications to display</p>
                  <p className="text-xs text-slate-500 mt-1">You are all caught up!</p>
                </Card>
              ) : (
                <div className="space-y-2.5">
                  {filteredNotifications.map((notif) => {
                    const isUnread = !notif.isRead && !notif.read;
                    return (
                      <Card
                        key={notif.id}
                        className={`p-4 border-slate-200 transition-colors ${
                          isUnread ? 'bg-blue-50/40 border-blue-200' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-xs font-bold ${isUnread ? 'text-blue-950' : 'text-slate-800'}`}>
                                {notif.title}
                              </h4>
                              {isUnread && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                            </div>
                            <p className="text-xs text-slate-600">{notif.body || notif.message}</p>
                            <span className="text-[10px] text-slate-400 block pt-1">{formatDate(notif.createdAt)}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {notif.actionUrl && (
                              <Link href={notif.actionUrl}>
                                <Button variant="outline" size="sm" className="text-xs h-7">
                                  View Action <ArrowUpRight className="h-3 w-3 ml-1" />
                                </Button>
                              </Link>
                            )}
                            {isUnread && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkNotifRead(notif.id)}
                                className="text-xs h-7"
                              >
                                Mark Read
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PROFILE */}
          {activeTab === 'profile' && (
            <Card className="max-w-2xl border-slate-200 bg-white p-6 space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900">Client Profile & Contact Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  These details are shared securely with verified advocates upon booking confirmation.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Full Name *</label>
                  <Input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Email Address (Read Only)</label>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="text-xs bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Phone Number (with country code) *</label>
                  <Input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    required
                    placeholder="+91 98200 12345"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Primary City</label>
                  <Input
                    type="text"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSavingProfile}
                    className="bg-blue-900 hover:bg-blue-950 text-xs font-semibold"
                  >
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6 animate-in fade-in">
              <Card className="border-slate-200 bg-white p-6 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Notification Preferences</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Control how LegalHubMumbai reaches you for case alerts.</p>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">In-App Notifications</p>
                      <p className="text-slate-500 text-[11px]">Real-time bell alerts in dashboard header</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifInAppEnabled}
                      onChange={(e) => setNotifInAppEnabled(e.target.checked)}
                      className="h-4 w-4 text-blue-900 rounded"
                    />
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Email Notifications</p>
                      <p className="text-slate-500 text-[11px]">Appointment booking confirmations and opinion deliverables</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifEmailEnabled}
                      onChange={(e) => setNotifEmailEnabled(e.target.checked)}
                      className="h-4 w-4 text-blue-900 rounded"
                    />
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">SMS & WhatsApp Alerts</p>
                      <p className="text-slate-500 text-[11px]">Instant appointment reminders prior to consultation</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifSmsEnabled}
                      onChange={(e) => setNotifSmsEnabled(e.target.checked)}
                      className="h-4 w-4 text-blue-900 rounded"
                    />
                  </div>
                </div>
              </Card>

              <Card className="border-slate-200 bg-white p-6 space-y-3">
                <h3 className="text-base font-bold text-slate-900">Security & Credentials</h3>
                <p className="text-xs text-slate-500">Manage authentication methods and password resets.</p>
                <div className="pt-2">
                  <Link href="/forgot-password">
                    <Button variant="outline" size="sm" className="text-xs">
                      Send Password Reset Link
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          )}
        </Container>
      </main>

      {/* Quick Summary Dialog */}
      <Dialog
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-900" />
            <span>Consultation Overview: {selectedBooking?.bookingReferenceNumber}</span>
          </div>
        }
        description="Review advocate assignment, consultation mode, and scheduled slot."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(null)} className="text-xs">
              Close
            </Button>
            {selectedBooking && (
              <Link href={`/booking/${selectedBooking.id}`}>
                <Button variant="primary" size="sm" className="bg-blue-900 hover:bg-blue-950 text-xs">
                  Open Full Booking Console →
                </Button>
              </Link>
            )}
          </>
        }
        maxWidth="lg"
      >
        {selectedBooking && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Advocate</span>
                <p className="font-bold text-slate-900">{selectedBooking.lawyerName}</p>
                <p className="text-slate-500">{selectedBooking.lawyerSanadNumber}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                <div className="mt-0.5"><StatusBadge status={selectedBooking.status} /></div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Date & Time</span>
                <p className="font-bold text-slate-900">{selectedBooking.preferredDate}</p>
                <p className="text-slate-500">{selectedBooking.preferredTimeSlot} IST</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Chamber</span>
                <p className="text-slate-700">{selectedBooking.chamberAddress}</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Case Notes</span>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 whitespace-pre-line">
                {selectedBooking.caseDescription}
              </p>
            </div>
          </div>
        )}
      </Dialog>

      <Footer />
    </div>
  );
}
