'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Card,
  Badge,
  Button,
  Input,
  Textarea,
  Dialog,
  Alert,
  Spinner,
} from '@legalhub/ui';
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RotateCcw,
  IndianRupee,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../../../lib/auth/context';
import { getAdminPaymentHistory } from '../../../../lib/services/payment.service';
import type { PaymentTransaction, PaymentStatus } from '@legalhub/types';
import { formatDate, formatINR } from '@legalhub/utils';

export default function AdminPaymentsPage() {
  const { user, role, isLoading: authLoading } = useAuth();

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refund Modal State
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(299);
  const [refundReason, setRefundReason] = useState<string>('booking_cancelled');
  const [refundNotes, setRefundNotes] = useState<string>('');
  const [isRefunding, setIsRefunding] = useState(false);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const adminUid = user?.uid || 'super_admin_system';
      const adminRole = (role?.toLowerCase() as 'admin' | 'super_admin') || 'super_admin';

      const filterStatus = statusFilter === 'all' ? undefined : (statusFilter as PaymentStatus);
      const res = await getAdminPaymentHistory({
        adminUid,
        adminRole,
        status: filterStatus,
      });

      if (res.success && res.transactions) {
        setTransactions(res.transactions);
      } else {
        setErrorMessage(res.error || 'Failed to load payment transactions.');
      }
    } catch {
      setErrorMessage('An error occurred while loading payment data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadPayments();
    }
  }, [authLoading, user?.uid, role, statusFilter]);

  // Handle Refund Submission
  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setIsRefunding(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const adminUid = user?.uid || 'super_admin_system';
      const adminRole = (role?.toLowerCase() as 'admin' | 'super_admin') || 'super_admin';

      const res = await fetch('/api/admin/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          amountInr: Number(refundAmount),
          reason: refundReason,
          adminNotes: refundNotes,
          adminUid,
          adminRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Refund of ₹${refundAmount} processed successfully for Payment ${selectedPayment.id}.`);
        setSelectedPayment(null);
        await loadPayments();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to process refund.');
      }
    } catch {
      setErrorMessage('Network error occurred while processing refund.');
    } finally {
      setIsRefunding(false);
    }
  };

  // Filter transactions by search query
  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.id.toLowerCase().includes(q) ||
      (tx.razorpayOrderId && tx.razorpayOrderId.toLowerCase().includes(q)) ||
      (tx.razorpayPaymentId && tx.razorpayPaymentId.toLowerCase().includes(q)) ||
      tx.bookingId.toLowerCase().includes(q) ||
      tx.userId.toLowerCase().includes(q) ||
      (tx.notes?.clientName && tx.notes.clientName.toLowerCase().includes(q)) ||
      (tx.notes?.bookingReference && tx.notes.bookingReference.toLowerCase().includes(q))
    );
  });

  // Calculate Metrics
  const totalRevenue = transactions
    .filter((tx) => tx.status === 'captured')
    .reduce((acc, tx) => acc + (tx.amountInr || 0), 0);

  const totalRefunded = transactions
    .filter((tx) => tx.status === 'refunded' || tx.status === 'partially_refunded')
    .reduce((acc, tx) => acc + (tx.refundDetails?.amountInr || 0), 0);

  const capturedCount = transactions.filter((tx) => tx.status === 'captured').length;
  const refundCount = transactions.filter((tx) => tx.status === 'refunded' || tx.status === 'partially_refunded').length;

  const renderStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'captured':
        return <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">Captured</Badge>;
      case 'created':
      case 'pending':
        return <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-200">Created / Pending</Badge>;
      case 'authorized':
        return <Badge variant="navy" className="bg-blue-50 text-blue-700 border-blue-200">Authorized</Badge>;
      case 'refunded':
        return <Badge variant="error" className="bg-purple-50 text-purple-700 border-purple-200">Refunded</Badge>;
      case 'partially_refunded':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Partial Refund</Badge>;
      case 'failed':
        return <Badge variant="error" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-slate-50">
      <Container className="space-y-6 max-w-7xl mx-auto">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/admin" className="hover:text-blue-900">Admin</Link>
              <span>/</span>
              <span className="text-slate-800 font-medium">Payment & Razorpay Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
              <CreditCard className="h-7 w-7 text-blue-900" />
              Financial Ledger & Unlock Settlements
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Production Razorpay transactions, unlock fees (₹299 default), and dispute refund manager.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPayments}
              isLoading={isLoading}
              className="text-xs bg-white"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
            <Badge variant="navy" className="text-xs py-1.5 px-3">
              Role: {role || 'Admin'}
            </Badge>
          </div>
        </div>

        {/* Feedback alerts */}
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

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Gross Unlocks Captured
              </span>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {formatINR(totalRevenue)}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> {capturedCount} successfully captured
            </p>
          </Card>

          <Card className="p-4 border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Orders Created
              </span>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {transactions.length}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              All time order requests
            </p>
          </Card>

          <Card className="p-4 border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Refunds Processed
              </span>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <RotateCcw className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {formatINR(totalRefunded)}
            </p>
            <p className="text-[11px] text-purple-700 font-medium mt-1">
              {refundCount} refund transactions
            </p>
          </Card>

          <Card className="p-4 border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Standard Unlock Fee
              </span>
              <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              ₹299 <span className="text-xs font-normal text-slate-500">/ unlock</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Configurable via Platform Settings
            </p>
          </Card>
        </div>

        {/* Filters and Search Bar */}
        <Card className="p-4 border-slate-200 bg-white shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search payment ID, order ID, booking ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-blue-600 w-full sm:w-48"
              >
                <option value="all">All Payment Statuses</option>
                <option value="captured">Captured (Paid)</option>
                <option value="created">Created (Unpaid)</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Payments Data Table */}
        <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction / Order ID</th>
                  <th className="py-3 px-4">Booking Reference</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Date (IST)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500">
                      <Spinner size="md" className="mx-auto mb-2 text-blue-900" />
                      Loading payment transactions...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500">
                      <CreditCard className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      No payment transactions match your query.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-900">{tx.id}</div>
                        <div className="text-[11px] text-slate-400">
                          {tx.razorpayPaymentId || tx.razorpayOrderId || 'Pending checkout'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/booking/${tx.bookingId}`}
                          className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
                        >
                          {tx.notes?.bookingReference || tx.bookingId}
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                        <div className="text-[11px] text-slate-500">
                          {tx.notes?.clientName || `User: ${tx.userId.slice(0, 10)}...`}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₹{tx.amountInr}
                      </td>
                      <td className="py-3 px-4">
                        {renderStatusBadge(tx.status)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 capitalize">
                        {tx.paymentMethod || 'Razorpay UPI/Card'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {tx.status === 'captured' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(tx);
                              setRefundAmount(tx.amountInr);
                            }}
                            className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Refund
                          </Button>
                        )}
                        {tx.status === 'refunded' && (
                          <span className="text-[11px] text-slate-400 italic">
                            Refunded (Ref: {tx.refundDetails?.refundProviderId?.slice(0, 10)}...)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Refund Processing Modal */}
        <Dialog
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title={
            <div className="flex items-center gap-2 text-slate-900">
              <RotateCcw className="h-5 w-5 text-red-600" />
              <span>Initiate Server-Verified Refund</span>
            </div>
          }
          description={`Issue a full or partial refund to the customer's original payment source via Razorpay for transaction ${selectedPayment?.id}.`}
          footer={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPayment(null)}
                disabled={isRefunding}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleProcessRefund}
                isLoading={isRefunding}
                className="bg-red-600 hover:bg-red-700 text-xs font-semibold"
              >
                Confirm & Process Refund
              </Button>
            </>
          }
          maxWidth="md"
        >
          {selectedPayment && (
            <form onSubmit={handleProcessRefund} className="space-y-4 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Original Amount:</span>
                  <span className="font-bold text-slate-900">₹{selectedPayment.amountInr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="font-mono text-slate-800">{selectedPayment.notes?.bookingReference || selectedPayment.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment ID:</span>
                  <span className="font-mono text-slate-800">{selectedPayment.razorpayPaymentId || selectedPayment.id}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Refund Amount (INR) *
                </label>
                <Input
                  type="number"
                  min={1}
                  max={selectedPayment.amountInr}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Reason for Refund *
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="booking_cancelled">Booking Cancelled before consultation</option>
                  <option value="lawyer_unavailable">Advocate was unavailable / no-show</option>
                  <option value="duplicate_payment">Duplicate charge / double deduction</option>
                  <option value="client_requested">Client requested cancellation</option>
                  <option value="service_dissatisfaction">Dispute resolution settlement</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Admin Internal Notes & Authorization Justification *
                </label>
                <Textarea
                  rows={3}
                  placeholder="Record justification for audit trail (e.g., ticket ID or lawyer concurrence)..."
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  className="text-xs"
                />
              </div>
            </form>
          )}
        </Dialog>
      </Container>
    </main>
  );
}
