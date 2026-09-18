'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Container,
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Spinner,
  Alert,
  StatusBadge,
  Dialog,
} from '@legalhub/ui';
import {
  CalendarDays,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Play,
  Check,
  Search,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../../../lib/auth/context';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';
import { LawyerPortalNav } from '../../../../components/lawyer/lawyer-portal-nav';
import {
  getLawyerBookings,
  acceptLawyerBooking,
  rejectLawyerBooking,
  updateLawyerBookingStatus,
  getLawyerDashboardOverview,
} from '../../../../lib/services/lawyer-dashboard.service';
import type { Booking, BookingStatus } from '@legalhub/types';
import { formatDate } from '@legalhub/utils';

const STATUS_TABS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'All Consultations', value: 'all' },
  { label: 'Pending Review', value: 'pending_lawyer' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled / Declined', value: 'cancelled' },
];

export default function LawyerBookingsPage() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get('status') as BookingStatus | 'all') || 'all';

  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  // Selected Booking Details & Action Modals
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const lawyerUid = user?.uid || 'lawyer-1';

  const loadBookings = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await getLawyerBookings(lawyerUid, {
        status: statusFilter,
        searchQuery: searchQuery.trim() || undefined,
      });

      if (res.success) {
        setBookings(res.bookings);
      }

      const overview = await getLawyerDashboardOverview(lawyerUid);
      setPendingCount(overview.metrics.pendingRequestsCount);
    } catch {
      setErrorMessage('Failed to load consultation bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [lawyerUid, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBookings();
  };

  // Accept Consultation
  const handleAcceptBooking = async (booking: Booking) => {
    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await acceptLawyerBooking(lawyerUid, booking.id);
      if (res.success && res.booking) {
        setSuccessMessage(`Successfully confirmed consultation with ${booking.clientName}. Notification sent.`);
        setBookings((prev) => prev.map((b) => (b.id === booking.id ? res.booking! : b)));
        if (selectedBooking?.id === booking.id) {
          setSelectedBooking(res.booking);
        }
        setPendingCount((c) => Math.max(0, c - 1));
      } else {
        setErrorMessage(res.error || 'Failed to accept consultation');
      }
    } catch {
      setErrorMessage('Failed to accept consultation request');
    } finally {
      setActionLoading(false);
    }
  };

  // Decline Consultation
  const handleDeclineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setActionLoading(true);
    setErrorMessage(null);

    try {
      const res = await rejectLawyerBooking(lawyerUid, selectedBooking.id, declineReason);
      if (res.success && res.booking) {
        setSuccessMessage(`Consultation declined. Client notified and refund initiated.`);
        setBookings((prev) => prev.map((b) => (b.id === selectedBooking.id ? res.booking! : b)));
        setDeclineModalOpen(false);
        setDeclineReason('');
        setSelectedBooking(res.booking);
        setPendingCount((c) => Math.max(0, c - 1));
      } else {
        setErrorMessage(res.error || 'Failed to decline consultation');
      }
    } catch {
      setErrorMessage('Failed to decline consultation');
    } finally {
      setActionLoading(false);
    }
  };

  // Start Consultation
  const handleStartConsultation = async (booking: Booking) => {
    setActionLoading(true);
    setErrorMessage(null);

    try {
      const res = await updateLawyerBookingStatus(lawyerUid, booking.id, 'in_progress');
      if (res.success && res.booking) {
        setSuccessMessage('Consultation marked in progress.');
        setBookings((prev) => prev.map((b) => (b.id === booking.id ? res.booking! : b)));
        if (selectedBooking?.id === booking.id) setSelectedBooking(res.booking);
      } else {
        setErrorMessage(res.error || 'Failed to update status');
      }
    } catch {
      setErrorMessage('Failed to start consultation');
    } finally {
      setActionLoading(false);
    }
  };

  // Complete Consultation
  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setActionLoading(true);
    setErrorMessage(null);

    try {
      const res = await updateLawyerBookingStatus(
        lawyerUid,
        selectedBooking.id,
        'completed',
        completionNotes.trim() || undefined
      );
      if (res.success && res.booking) {
        setSuccessMessage('Consultation marked as successfully completed. Payout settled.');
        setBookings((prev) => prev.map((b) => (b.id === selectedBooking.id ? res.booking! : b)));
        setCompleteModalOpen(false);
        setCompletionNotes('');
        setSelectedBooking(res.booking);
      } else {
        setErrorMessage(res.error || 'Failed to complete consultation');
      }
    } catch {
      setErrorMessage('Failed to complete consultation');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <LawyerPortalNav pendingCount={pendingCount} />

      <main className="py-8">
        <Container className="max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Consultation Bookings Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Review pending client requests, view unlocked contact info and deeds, and manage consultation deliverables.
              </p>
            </div>
          </div>

          {successMessage && (
            <Alert variant="success" className="mb-6">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <span>{successMessage}</span>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="error" className="mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{errorMessage}</span>
            </Alert>
          )}

          {/* Filter Bar & Search */}
          <Card className="border-slate-200 bg-white shadow-xs mb-6">
            <CardContent className="p-4 space-y-4">
              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      statusFilter === tab.value
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                    {tab.value === 'pending_lawyer' && pendingCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by client name, reference code, or matter..."
                    className="pl-9 text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="primary" size="sm" className="text-xs">
                  Filter
                </Button>
                {searchQuery && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setSearchQuery('');
                      loadBookings();
                    }}
                  >
                    Clear
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Bookings List */}
          {isLoading ? (
            <div className="py-20 text-center">
              <Spinner size="lg" className="mx-auto text-blue-700" />
              <p className="text-xs text-slate-500 mt-2">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <Card className="border-slate-200 bg-white p-12 text-center">
              <CalendarDays className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No consultation bookings found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No bookings match your current filter. New client consultations will appear here automatically.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const isPending = booking.status === 'pending_lawyer';
                const isConfirmed = booking.status === 'confirmed';
                const isInProgress = booking.status === 'in_progress';

                return (
                  <Card
                    key={booking.id}
                    className={`border transition-all ${
                      isPending
                        ? 'border-amber-300 bg-amber-50/20 shadow-sm'
                        : 'border-slate-200 bg-white shadow-xs hover:shadow-md'
                    }`}
                  >
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        {/* Booking Info */}
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">
                              Ref: {booking.bookingReferenceNumber || `LHM-${booking.id.slice(0, 8)}`}
                            </span>
                            <StatusBadge status={booking.status} />
                            <Badge variant="outline" className="text-[10px]">
                              {booking.consultationMode === 'in_person_office' ? 'Office Consultation' : 'Video Conference'}
                            </Badge>
                          </div>

                          <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900">
                              {booking.serviceCategory}
                            </h2>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                              {booking.caseDescription || 'No case description provided.'}
                            </p>
                          </div>

                          {/* Client & Date Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" />
                              <div>
                                <span className="text-slate-400 block text-[10px]">Client</span>
                                <span className="font-bold text-slate-800">{booking.clientName}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <div>
                                <span className="text-slate-400 block text-[10px]">Appointment</span>
                                <span className="font-bold text-slate-900">
                                  {booking.preferredDate} ({booking.preferredTimeSlot})
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-emerald-600" />
                              <div>
                                <span className="text-slate-400 block text-[10px]">Contact</span>
                                <span className="font-semibold text-slate-700 font-mono text-[11px]">
                                  {booking.clientPhone || 'Contact Unlocked'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions Right Console */}
                        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                          {isPending && (
                            <div className="flex items-center gap-2 w-full lg:w-auto">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAcceptBooking(booking)}
                                isLoading={actionLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                leftIcon={<Check className="h-3.5 w-3.5" />}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setDeclineModalOpen(true);
                                }}
                                className="text-red-600 hover:bg-red-50 text-xs border-red-200"
                                leftIcon={<XCircle className="h-3.5 w-3.5" />}
                              >
                                Decline
                              </Button>
                            </div>
                          )}

                          {isConfirmed && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleStartConsultation(booking)}
                              isLoading={actionLoading}
                              className="text-xs"
                              leftIcon={<Play className="h-3.5 w-3.5" />}
                            >
                              Start Consultation
                            </Button>
                          )}

                          {isInProgress && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setCompleteModalOpen(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                              leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                            >
                              Mark Completed
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                            className="text-xs text-slate-600 hover:text-slate-900"
                          >
                            Case Details <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Decline Reason Modal */}
          <Dialog
            isOpen={declineModalOpen}
            onClose={() => setDeclineModalOpen(false)}
            title="Decline Consultation Request"
          >
            <form onSubmit={handleDeclineSubmit} className="space-y-4">
              <p className="text-xs text-slate-600">
                Please state the reason for declining this consultation request from{' '}
                <strong>{selectedBooking?.clientName}</strong>. The client will be notified and their fee will be refunded.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rejection Reason (Minimum 5 characters) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g. Schedule conflict with Bombay High Court bench hearing on this date."
                  className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeclineModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirm Decline & Refund
                </Button>
              </div>
            </form>
          </Dialog>

          {/* Mark Complete Modal */}
          <Dialog
            isOpen={completeModalOpen}
            onClose={() => setCompleteModalOpen(false)}
            title="Complete Consultation"
          >
            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <p className="text-xs text-slate-600">
                Confirm completion of consultation for <strong>{selectedBooking?.serviceCategory}</strong> with client{' '}
                <strong>{selectedBooking?.clientName}</strong>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Completion Deliverable Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Title Search Report issued. No encumbrance detected. Advised on SRO stamp duty calculation."
                  className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCompleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Complete & Settle Payout
                </Button>
              </div>
            </form>
          </Dialog>

          {/* Quick Case Detail Modal */}
          <Dialog
            isOpen={!!selectedBooking && !declineModalOpen && !completeModalOpen}
            onClose={() => setSelectedBooking(null)}
            title={`Consultation Details: ${selectedBooking?.bookingReferenceNumber || ''}`}
          >
            {selectedBooking && (
              <div className="space-y-5 text-xs text-slate-700">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Current State</span>
                    <StatusBadge status={selectedBooking.status} />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">Schedule</span>
                    <span className="font-bold text-slate-900">
                      {selectedBooking.preferredDate} ({selectedBooking.preferredTimeSlot})
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900">Matter Description</h4>
                  <p className="p-3 bg-slate-50 rounded-lg text-slate-700 leading-relaxed">
                    {selectedBooking.caseDescription || 'No case description provided.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Client Name</span>
                    <span className="font-bold text-slate-900">{selectedBooking.clientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Phone (Unlocked)</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedBooking.clientPhone || 'Not available'}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-900">Consultation Timeline</h4>
                  <div className="space-y-1.5">
                    {selectedBooking.timeline?.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <span className="font-semibold text-slate-800">{step.status}:</span>
                        <span className="text-slate-500">{step.notes || 'Status updated'}</span>
                        <span className="text-slate-400 ml-auto">{formatDate(step.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </Dialog>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
