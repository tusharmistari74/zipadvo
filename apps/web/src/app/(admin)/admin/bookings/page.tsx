'use client';

import React, { useState, useEffect } from 'react';
import { AdminPortalNav } from '@/components/admin/admin-portal-nav';
import { AdminGuard } from '@/components/admin/admin-guard';
import type { Booking, BookingStatus } from '@legalhub/types';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
      return { label: 'CONFIRMED', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'in_progress':
      return { label: 'IN PROGRESS', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    case 'completed':
      return { label: 'COMPLETED', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
    case 'cancelled':
      return { label: 'CANCELLED', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    case 'disputed':
      return { label: 'DISPUTED', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    case 'pending_lawyer':
      return { label: 'PENDING ADVOCATE', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    default:
      return { label: status.toUpperCase().replace(/_/g, ' '), color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  }
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Override modal state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [targetStatus, setTargetStatus] = useState<BookingStatus>('confirmed');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [overrideSuccess, setOverrideSuccess] = useState<string | null>(null);

  // Timeline view modal
  const [timelineBooking, setTimelineBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());

      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    if (overrideReason.trim().length < 5) {
      setOverrideError('Override reason must be at least 5 characters');
      return;
    }

    try {
      setOverrideSubmitting(true);
      setOverrideError(null);
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetStatus,
          reason: overrideReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to override booking status');
      }

      setOverrideSuccess(`Booking status changed to ${targetStatus}`);
      setSelectedBooking(null);
      setOverrideReason('');
      fetchBookings();
    } catch (err) {
      setOverrideError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setOverrideSubmitting(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Global Operations
                </span>
                <span className="text-xs text-slate-400">Phase 17 Admin Engine</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
                Consultation Bookings Management
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Audit, search, and manage all client-lawyer property law consultations across Mumbai.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchBookings}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition flex items-center gap-2"
              >
                <span>🔄</span> Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub Navigation */}
      <AdminPortalNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {overrideSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center justify-between">
            <span>✅ {overrideSuccess}</span>
            <button onClick={() => setOverrideSuccess(null)} className="text-emerald-400 hover:text-emerald-200">
              ✕
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/60 p-5">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Search by Booking ID, Client ID, Lawyer ID, or Court..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium transition"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending_payment">Pending Payment</option>
                  <option value="pending_lawyer">Pending Lawyer</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
              <p className="text-sm">Loading consultation bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-base font-semibold text-slate-300">No bookings found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Booking ID</th>
                    <th className="py-3.5 px-4 font-semibold">Client / Lawyer</th>
                    <th className="py-3.5 px-4 font-semibold">Service & Date</th>
                    <th className="py-3.5 px-4 font-semibold">Payment / Fee</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {bookings.map((booking) => {
                    const statusConfig = getStatusBadge(booking.status);

                    return (
                      <tr key={booking.id} className="hover:bg-slate-800/20 transition">
                        <td className="py-4 px-4 font-mono text-xs">
                          <span className="text-amber-400 font-semibold">{booking.bookingReferenceNumber || booking.id}</span>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Created {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs font-medium text-slate-200">
                            Client: <span className="font-mono text-slate-400">{booking.clientName || booking.clientUid}</span>
                          </div>
                          <div className="text-xs font-medium text-slate-300 mt-0.5">
                            Lawyer: <span className="font-mono text-amber-300/80">{booking.lawyerName || booking.lawyerUid}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs font-semibold text-slate-200 capitalize">
                            {booking.serviceCategory}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            📅 {booking.preferredDate} | ⏰ {booking.preferredTimeSlot}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs font-bold text-slate-200">
                            ₹{booking.unlockAmountInr || 299}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">
                            {booking.status}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setTimelineBooking(booking)}
                              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                            >
                              Timeline
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setTargetStatus(booking.status);
                                setOverrideError(null);
                              }}
                              className="px-2.5 py-1 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 transition"
                            >
                              Override
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Manual Override Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>⚠️</span> Manual Booking Status Override
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div><strong className="text-slate-300">Booking ID:</strong> <span className="font-mono text-amber-400">{selectedBooking.id}</span></div>
              <div><strong className="text-slate-300">Current Status:</strong> <span className="font-semibold text-white">{selectedBooking.status}</span></div>
              <div><strong className="text-slate-300">Client / Lawyer:</strong> {selectedBooking.clientName || selectedBooking.clientUid} / {selectedBooking.lawyerName || selectedBooking.lawyerUid}</div>
            </div>

            <form onSubmit={handleOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Status *
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as BookingStatus)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="pending_payment">PENDING_PAYMENT</option>
                  <option value="pending_lawyer">PENDING_LAWYER</option>
                  <option value="confirmed">CONFIRMED</option>
                  <option value="in_progress">IN_PROGRESS</option>
                  <option value="completed">COMPLETED</option>
                  <option value="cancelled">CANCELLED</option>
                  <option value="disputed">DISPUTED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Manual Override (Mandatory Audit Requirement) *
                </label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Specify why administrative intervention is required (min 5 chars)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  required
                />
              </div>

              {overrideError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
                  {overrideError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={overrideSubmitting}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
                >
                  {overrideSubmitting ? 'Overriding...' : 'Confirm Status Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {timelineBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                Booking Timeline: {timelineBooking.id}
              </h3>
              <button
                onClick={() => setTimelineBooking(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {timelineBooking.timeline && timelineBooking.timeline.length > 0 ? (
                timelineBooking.timeline.map((event, idx) => (
                  <div key={idx} className="relative pl-6 pb-3 border-l border-slate-700 last:border-l-0">
                    <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-amber-400 ring-4 ring-slate-900" />
                    <div className="text-xs font-semibold text-slate-200">
                      {event.status}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      By: <span className="font-mono text-slate-300">{event.actorUid}</span>
                      {event.actorRole && ` (${event.actorRole})`} • {new Date(event.timestamp).toLocaleString('en-IN')}
                    </div>
                    {event.notes && (
                      <div className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800 mt-1.5 font-mono">
                        {event.notes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No timeline events recorded.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTimelineBooking(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </AdminGuard>
  );
}
