'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Badge,
  Spinner,
  Alert,
} from '@legalhub/ui';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../../../lib/auth/context';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';
import { LawyerPortalNav } from '../../../../components/lawyer/lawyer-portal-nav';
import { getLawyerEarningsReport } from '../../../../lib/services/lawyer-dashboard.service';
import type { LawyerEarningsReport, LawyerPayoutItem } from '@legalhub/types';
import { formatINR, formatDate } from '@legalhub/utils';

export default function LawyerEarningsPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<LawyerEarningsReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const lawyerUid = user?.uid || 'lawyer-1';

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await getLawyerEarningsReport(lawyerUid);
        setReport(data);
      } catch {
        setErrorMessage('Failed to load financial earnings report');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [lawyerUid]);

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <LawyerPortalNav />

      <main className="py-8">
        <Container className="max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="navy" className="text-xs">
                  Financial Ledger
                </Badge>
                <span className="text-xs text-slate-500">
                  Standard Platform Service Fee: 15%
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Advocate Earnings & Payout Ledger
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Server-calculated consultation fee distributions, platform commission deductions, and settled bank payouts.
              </p>
            </div>
          </div>

          {errorMessage && (
            <Alert variant="error" className="mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{errorMessage}</span>
            </Alert>
          )}

          {isLoading ? (
            <div className="py-20 text-center">
              <Spinner size="lg" className="mx-auto text-blue-700" />
              <p className="text-xs text-slate-500 mt-2">Computing earnings...</p>
            </div>
          ) : report ? (
            <div className="space-y-8">
              {/* Top Financial Overview Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Gross Revenue */}
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardContent className="p-5">
                    <span className="text-xs font-semibold text-slate-500">Gross Consultation Volume</span>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                      {formatINR(report.grossTotalInr)}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Total client payments received
                    </span>
                  </CardContent>
                </Card>

                {/* Net Earnings */}
                <Card className="border-emerald-200 bg-emerald-50/20 shadow-xs">
                  <CardContent className="p-5">
                    <span className="text-xs font-semibold text-emerald-800">Net Advocate Payout</span>
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">
                      {formatINR(report.netEarningsInr)}
                    </div>
                    <span className="text-[11px] text-emerald-700 mt-0.5 block">
                      85% payable to advocate
                    </span>
                  </CardContent>
                </Card>

                {/* Commission Deducted */}
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardContent className="p-5">
                    <span className="text-xs font-semibold text-slate-500">Platform Commission (15%)</span>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">
                      {formatINR(report.totalCommissionInr)}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Automated platform service fee
                    </span>
                  </CardContent>
                </Card>

                {/* Pending Settlement */}
                <Card className="border-amber-200 bg-amber-50/20 shadow-xs">
                  <CardContent className="p-5">
                    <span className="text-xs font-semibold text-amber-800">Pending Settlement</span>
                    <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-2">
                      {formatINR(report.pendingBalanceInr)}
                    </div>
                    <span className="text-[11px] text-amber-700 mt-0.5 block">
                      Settles upon consultation completion
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Breakdown by Time Horizon (Daily / Weekly / Monthly) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Daily */}
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Today</span>
                      <Badge variant="outline" className="text-[10px]">
                        {report.daily.consultationCount} Consultations
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl font-bold text-slate-900">
                        {formatINR(report.daily.netInr)} <span className="text-xs font-normal text-slate-400">net</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        Gross: {formatINR(report.daily.grossInr)} • Fee: {formatINR(report.daily.commissionInr)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly */}
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Last 7 Days</span>
                      <Badge variant="outline" className="text-[10px]">
                        {report.weekly.consultationCount} Consultations
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl font-bold text-slate-900">
                        {formatINR(report.weekly.netInr)} <span className="text-xs font-normal text-slate-400">net</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        Gross: {formatINR(report.weekly.grossInr)} • Fee: {formatINR(report.weekly.commissionInr)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly */}
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">This Month</span>
                      <Badge variant="outline" className="text-[10px]">
                        {report.monthly.consultationCount} Consultations
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl font-bold text-slate-900">
                        {formatINR(report.monthly.netInr)} <span className="text-xs font-normal text-slate-400">net</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        Gross: {formatINR(report.monthly.grossInr)} • Fee: {formatINR(report.monthly.commissionInr)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transactions Ledger Table */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Itemized Consultation Payout Ledger</h3>
                  <span className="text-xs text-slate-400">
                    {report.transactions.length} Total Payout Record{report.transactions.length === 1 ? '' : 's'}
                  </span>
                </div>

                <CardContent className="p-0">
                  {report.transactions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No consultation earnings records found yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase font-semibold text-slate-500">
                          <tr>
                            <th className="p-4">Reference & Client</th>
                            <th className="p-4">Service Category</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Gross (₹)</th>
                            <th className="p-4 text-right">Fee (15%)</th>
                            <th className="p-4 text-right">Net Payout</th>
                            <th className="p-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {report.transactions.map((tx: LawyerPayoutItem) => (
                            <tr key={tx.id} className="hover:bg-slate-50/50">
                              <td className="p-4 font-semibold text-slate-900">
                                <div>{tx.clientDisplayName}</div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {tx.bookingReferenceNumber}
                                </span>
                              </td>
                              <td className="p-4 text-slate-700">{tx.serviceCategory}</td>
                              <td className="p-4 text-slate-500">{formatDate(tx.date)}</td>
                              <td className="p-4 text-right font-mono">{formatINR(tx.grossAmountInr)}</td>
                              <td className="p-4 text-right font-mono text-red-600">
                                -{formatINR(tx.platformCommissionInr)}
                              </td>
                              <td className="p-4 text-right font-mono font-bold text-emerald-600">
                                {formatINR(tx.netPayoutInr)}
                              </td>
                              <td className="p-4 text-center">
                                <Badge
                                  variant={tx.status === 'settled' ? 'navy' : 'outline'}
                                  className={tx.status === 'settled' ? 'bg-emerald-600 text-white' : 'text-amber-700 bg-amber-50'}
                                >
                                  {tx.status === 'settled' ? 'Settled' : 'Pending'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
