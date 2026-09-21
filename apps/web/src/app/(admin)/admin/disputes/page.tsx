'use client';

import React, { useState, useEffect } from 'react';
import { AdminPortalNav } from '@/components/admin/admin-portal-nav';
import { AdminGuard } from '@/components/admin/admin-guard';
import type { Dispute } from '@legalhub/types';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Resolution modal state
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolutionAction, setResolutionAction] = useState<'client_refund' | 'dismissed'>('client_refund');
  const [resolutionNote, setResolutionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/disputes?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load dispute cases');
      const data = await res.json();
      setDisputes(data.disputes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;
    if (resolutionNote.trim().length < 5) {
      setError('Resolution note must be at least 5 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch(`/api/admin/disputes/${selectedDispute.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: resolutionAction,
          resolutionNote: resolutionNote.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resolve dispute');
      }

      setSuccess(`Dispute ${selectedDispute.id} resolved with action: ${resolutionAction}`);
      setSelectedDispute(null);
      setResolutionNote('');
      fetchDisputes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
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
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Adjudication & Trust
                </span>
                <span className="text-xs text-slate-400">Phase 17 Admin Engine</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
                Dispute Resolution Center
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Investigate consultation complaints, evaluate evidence, issue client refunds, or dismiss invalid claims.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDisputes}
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
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center justify-between">
            <span>✅ {success}</span>
            <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-200">
              ✕
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/60 p-5 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-200">
            Active Disputes & Claims
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            >
              <option value="all">All Cases</option>
              <option value="open">Open / Under Investigation</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Disputes Grid / Table */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-12 text-center text-slate-400">
              <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
              <p className="text-sm">Loading dispute investigations...</p>
            </div>
          ) : disputes.length === 0 ? (
            <div className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-12 text-center text-slate-400">
              <p className="text-base font-semibold text-slate-300">No disputes found</p>
              <p className="text-xs text-slate-500 mt-1">Platform dispute queue is clear!</p>
            </div>
          ) : (
            disputes.map((d) => (
              <div
                key={d.id}
                className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/60 p-6 space-y-4 transition hover:border-slate-600"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-slate-700/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-rose-400">{d.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                        d.status === 'opened' || d.status === 'under_investigation'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {d.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Raised on {new Date(d.createdAt).toLocaleDateString('en-IN')} by client <span className="font-mono text-slate-300">{d.raisedByUid}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-300">
                      Booking: <span className="font-mono text-amber-400">{d.bookingId}</span>
                    </span>
                    {d.status !== 'resolved_refunded' && d.status !== 'resolved_dismissed' && d.status !== 'closed' && (
                      <button
                        onClick={() => {
                          setSelectedDispute(d);
                          setResolutionNote('');
                          setError(null);
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition"
                      >
                        Adjudicate Dispute
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="font-semibold text-slate-300">Complaint Reason:</div>
                    <div className="text-slate-300">{d.reason.replace(/_/g, ' ')}</div>
                    {d.description && <div className="text-slate-400 text-[11px]">{d.description}</div>}
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="font-semibold text-slate-300">Target Lawyer:</div>
                    <div className="font-mono text-amber-300/90">{d.againstUid}</div>
                  </div>
                </div>

                {d.resolutionSummary && (
                  <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl text-xs text-emerald-300 space-y-1">
                    <div className="font-semibold flex items-center gap-2">
                      <span>⚖️ Resolution:</span>
                      <span className="uppercase font-bold">{d.status.replace(/_/g, ' ')}</span>
                      <span>by {d.resolvedByAdminUid}</span>
                    </div>
                    <p className="text-emerald-200/90">{d.resolutionSummary}</p>
                    {d.resolvedAt && (
                      <div className="text-[10px] text-emerald-400/70">
                        Resolved on {new Date(d.resolvedAt).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Adjudication Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>⚖️</span> Adjudicate Dispute {selectedDispute.id}
              </h3>
              <button
                onClick={() => setSelectedDispute(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-slate-400">
              <div><strong className="text-slate-300">Booking:</strong> {selectedDispute.bookingId}</div>
              <div><strong className="text-slate-300">Claimant:</strong> {selectedDispute.raisedByUid}</div>
              <div><strong className="text-slate-300">Reason:</strong> {selectedDispute.reason.replace(/_/g, ' ')}</div>
            </div>

            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Adjudication Decision *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setResolutionAction('client_refund')}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${
                      resolutionAction === 'client_refund'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white">💰 Client Refund</div>
                    <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                      Issue 100% refund to client & cancel booking
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolutionAction('dismissed')}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${
                      resolutionAction === 'dismissed'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white">🚫 Dismiss Claim</div>
                    <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                      Dispute found invalid, lawyer retains consultation
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Adjudication Finding & Notes (Min 5 chars) *
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Detail the rationale and findings supporting this decision..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDispute(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
                >
                  {submitting ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </AdminGuard>
  );
}
