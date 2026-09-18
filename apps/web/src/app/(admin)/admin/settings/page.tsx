'use client';

import React, { useState, useEffect } from 'react';
import { AdminPortalNav } from '@/components/admin/admin-portal-nav';
import type { PlatformSettings } from '@legalhub/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [unlockFee, setUnlockFee] = useState<number>(299);
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [minimumWithdrawal, setMinimumWithdrawal] = useState<number>(500);
  const [platformVersion, setPlatformVersion] = useState<string>('1.0.0');
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [supportEmail, setSupportEmail] = useState<string>('support@legalhubmumbai.com');
  const [supportPhone, setSupportPhone] = useState<string>('+91 22 2265 4321');
  const [updateReason, setUpdateReason] = useState<string>('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings', {
        headers: {
          'x-user-role': 'admin',
          'x-user-id': 'admin_operator',
        },
      });
      if (!res.ok) throw new Error('Failed to load settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setUnlockFee(data.settings.unlockFee ?? data.settings.fees?.consultationUnlockFeeInr ?? 299);
        setCommissionRate(data.settings.commissionRate ?? data.settings.fees?.platformCommissionPercentage ?? 10);
        setMinimumWithdrawal(data.settings.minimumWithdrawal ?? 500);
        setPlatformVersion(data.settings.platformVersion ?? '1.0.0');
        setMaintenanceMode(Boolean(data.settings.maintenanceMode));
        setSupportEmail(data.settings.supportEmail || 'support@legalhubmumbai.com');
        setSupportPhone(data.settings.supportPhone || '+91 22 2265 4321');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updateReason.trim().length < 3) {
      setError('Audit reason note must be at least 3 characters');
      return;
    }

    if (unlockFee < 0) {
      setError('Unlock fee cannot be negative');
      return;
    }

    if (commissionRate < 0 || commissionRate > 100) {
      setError('Commission rate must be between 0% and 100%');
      return;
    }

    if (minimumWithdrawal < 0) {
      setError('Minimum withdrawal amount cannot be negative');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
          'x-user-id': 'admin_operator',
        },
        body: JSON.stringify({
          commissionRate: Number(commissionRate),
          unlockFee: Number(unlockFee),
          minimumWithdrawal: Number(minimumWithdrawal),
          supportEmail: supportEmail.trim(),
          supportPhone: supportPhone.trim(),
          platformVersion: platformVersion.trim(),
          maintenanceMode: Boolean(maintenanceMode),
          reason: updateReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update platform settings');
      }

      setSuccess('Platform settings updated successfully and logged to audit trail.');
      setUpdateReason('');
      fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Global Configuration
                </span>
                <span className="text-xs text-slate-400">Phase 20 Settings Engine</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
                Platform Financial & System Configuration
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Configure consultation unlock fees, commission percentages, lawyer withdrawal thresholds, support contacts, and system version.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Sub Navigation */}
      <AdminPortalNav />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center justify-between">
            <span>✅ {success}</span>
            <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-200">
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-12 text-center text-slate-400">
            <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
            <p className="text-sm">Loading platform configurations...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Financial Parameters */}
            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/60 p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>💳</span> Monetization & Payout Thresholds
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Consultation Unlock Fee (INR ₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={unlockFee}
                    onChange={(e) => setUnlockFee(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Standard booking unlock fee paid by clients.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Platform Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Commission retained on completed consultations (0–100%).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Minimum Withdrawal Amount (INR ₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={minimumWithdrawal}
                    onChange={(e) => setMinimumWithdrawal(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Minimum earnings required for advocate payout request.
                  </p>
                </div>
              </div>
            </div>

            {/* System Status, Version & Support */}
            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/60 p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>🛡️</span> System Status & Customer Operations
              </h2>

              <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-slate-200">System Maintenance Mode</div>
                  <div className="text-xs text-slate-400">
                    When active, client bookings and advocate onboarding are temporarily queued.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Platform Version
                  </label>
                  <input
                    type="text"
                    value={platformVersion}
                    onChange={(e) => setPlatformVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Current active release version tag.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Platform Support Email
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Primary operational support address.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Support Hotline / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Dedicated support helpline number.
                  </p>
                </div>
              </div>
            </div>

            {/* Audit Justification */}
            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/60 p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>📝</span> Administrative Change Authorization
              </h2>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for System Update (Mandatory Audit Requirement) *
                </label>
                <textarea
                  rows={2}
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  placeholder="State the operational reason for modifying financial or platform settings (min 3 chars)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>
              {settings && (
                <div className="text-[11px] text-slate-500">
                  Last updated at {new Date(settings.updatedAt).toLocaleString('en-IN')}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {saving ? 'Saving Changes...' : 'Save Configuration Changes'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
