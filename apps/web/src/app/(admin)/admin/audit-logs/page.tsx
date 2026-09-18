'use client';

import React, { useState, useEffect } from 'react';
import { AdminPortalNav } from '@/components/admin/admin-portal-nav';
import type { AuditLog } from '@legalhub/types';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (actionFilter !== 'all') params.set('action', actionFilter);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load audit logs');
      const data = await res.json();
      setLogs(data.auditLogs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Compliance & Traceability
                </span>
                <span className="text-xs text-slate-400">Phase 17 Admin Engine</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
                Privileged System Audit Logs
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Immutable chronological log of all administrative actions, KYC decisions, user blocks, fee alterations, and dispute adjudications.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchLogs}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition flex items-center gap-2"
              >
                <span>🔄</span> Refresh Logs
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub Navigation */}
      <AdminPortalNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filter bar */}
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm font-semibold text-slate-200">
            Immutable Audit Trail ({logs.length} events logged)
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Action Filter:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">All Administrative Actions</option>
              <option value="user_blocked">user_blocked</option>
              <option value="user_unblocked">user_unblocked</option>
              <option value="booking_manual_override">booking_manual_override</option>
              <option value="dispute_refunded">dispute_refunded</option>
              <option value="dispute_dismissed">dispute_dismissed</option>
              <option value="lawyer_kyc_approved">lawyer_kyc_approved</option>
              <option value="lawyer_kyc_rejected">lawyer_kyc_rejected</option>
              <option value="payment_refunded">payment_refunded</option>
              <option value="platform_settings_updated">platform_settings_updated</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
              <p className="text-sm">Loading security audit trail...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-base font-semibold text-slate-300">No audit records found</p>
              <p className="text-xs text-slate-500 mt-1">Actions performed by admins will be recorded here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                    <th className="py-3.5 px-4 font-semibold">Action</th>
                    <th className="py-3.5 px-4 font-semibold">Performed By</th>
                    <th className="py-3.5 px-4 font-semibold">Target Resource</th>
                    <th className="py-3.5 px-4 font-semibold">Details / Reason</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Raw Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-xs">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/20 transition">
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div>{log.actorUid}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{log.actorRole}</div>
                      </td>
                      <td className="py-3.5 px-4 text-amber-300/90 font-bold">
                        {log.targetEntityId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate font-sans">
                        {log.metadata ? JSON.stringify(log.metadata) : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-sans transition"
                        >
                          View JSON
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* JSON Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🔍</span> Audit Event Inspector: {selectedLog.id}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-96">
              <pre className="text-xs font-mono text-emerald-400">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
