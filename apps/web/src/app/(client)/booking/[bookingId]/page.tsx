'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Alert,
  Spinner,
  Textarea,
  Dialog,
  StatusBadge,
} from '@legalhub/ui';
import {
  Calendar,
  Clock,
  Building,
  Video,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  User,
  Scale,
  XCircle,
  PlayCircle,
  CheckCheck,
  FileText,
  UploadCloud,
  Download,
  Lock,
  FileCheck,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../../../lib/auth/context';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';
import {
  getBookingById,
  transitionBookingStatus,
  cancelBooking,
} from '../../../../lib/services/booking.service';
import {
  getBookingDocuments,
  uploadBookingDocument,
  generateSecureDocumentDownloadUrl,
} from '../../../../lib/services/document.service';
import { initiateRazorpayPayment } from '../../../../lib/services/razorpay-client';
import type { Booking, BookingStatus, BookingDocument, BookingDocumentType } from '@legalhub/types';
import { formatDate, formatINR } from '@legalhub/utils';

interface BookingDetailPageProps {
  params: { bookingId: string };
}

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { user, role, isLoading: authLoading } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Document Vault State
  const [documents, setDocuments] = useState<BookingDocument[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<BookingDocumentType>('property_title_deed');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [docErrorMessage, setDocErrorMessage] = useState<string | null>(null);
  const [docSuccessMessage, setDocSuccessMessage] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Load Documents
  const loadDocuments = async () => {
    if (!params.bookingId) return;
    const callerUid = user?.uid || 'guest_client_uid';
    const callerRole = (role?.toLowerCase() as 'client' | 'lawyer' | 'admin' | 'super_admin') || 'client';

    const res = await getBookingDocuments(params.bookingId, callerUid, callerRole);
    if (res.success) {
      setDocuments(res.documents);
    }
  };

  // Load Booking Data
  const loadBooking = async () => {
    if (!params.bookingId) return;

    const callerUid = user?.uid || 'guest_client_uid';
    const callerRole = (role?.toLowerCase() as 'client' | 'lawyer' | 'admin' | 'super_admin') || 'client';

    const res = await getBookingById(params.bookingId, callerUid, callerRole);

    if (res.success && res.booking) {
      setBooking(res.booking);
      setErrorMessage(null);
      await loadDocuments();
    } else {
      setErrorMessage(res.error || 'Unable to load booking details.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      loadBooking();
    }
  }, [params.bookingId, authLoading, user?.uid, role]);

  // Handler: Upload Document
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !booking) return;

    // 5MB validation
    if (uploadFile.size > 5 * 1024 * 1024) {
      setDocErrorMessage('File exceeds maximum allowed limit of 5 MB.');
      return;
    }

    setIsUploadingDoc(true);
    setDocErrorMessage(null);
    setDocSuccessMessage(null);

    try {
      const arrayBuffer = await uploadFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const callerUid = user?.uid || 'guest_client_uid';
      const callerRole = (role?.toLowerCase() as 'client' | 'lawyer' | 'admin' | 'super_admin') || 'client';
      const isDeliverable = callerRole === 'lawyer' && selectedDocType === 'completed_legal_opinion';

      const res = await uploadBookingDocument({
        bookingId: booking.id,
        file: {
          name: uploadFile.name,
          type: uploadFile.type || 'application/pdf',
          size: uploadFile.size,
          buffer,
        },
        documentType: selectedDocType,
        uploaderUid: callerUid,
        uploaderRole: callerRole,
        isCompletedDeliverable: isDeliverable,
      });

      if (res.success && res.document) {
        setDocSuccessMessage(`Document "${uploadFile.name}" uploaded successfully to encrypted vault.`);
        setUploadFile(null);
        await loadDocuments();
        setTimeout(() => setDocSuccessMessage(null), 4000);
      } else {
        setDocErrorMessage(res.error || 'Failed to upload document.');
      }
    } catch {
      setDocErrorMessage('An error occurred during document upload.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Handler: Secure Download
  const handleDownloadDocument = async (docItem: BookingDocument) => {
    setDownloadingDocId(docItem.id);
    setDocErrorMessage(null);

    const callerUid = user?.uid || 'guest_client_uid';
    const callerRole = (role?.toLowerCase() as 'client' | 'lawyer' | 'admin' | 'super_admin') || 'client';

    const res = await generateSecureDocumentDownloadUrl(docItem.id, callerUid, callerRole);
    setDownloadingDocId(null);

    if (res.success && res.downloadUrl) {
      window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
    } else {
      setDocErrorMessage(res.error || 'Failed to generate secure download link.');
    }
  };

  // Handler: Transition Status
  const handleTransition = async (targetStatus: BookingStatus, notes?: string) => {
    if (!booking) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const actorUid = user?.uid || 'guest_uid';
    const actorRole = (role?.toLowerCase() as 'client' | 'lawyer' | 'admin' | 'super_admin') || 'client';

    const res = await transitionBookingStatus({
      bookingId: booking.id,
      targetStatus,
      actorUid,
      actorRole,
      notes: notes || `Status updated to ${targetStatus}`,
    });

    setIsProcessing(false);

    if (res.success && res.booking) {
      setBooking(res.booking);
      setSuccessMessage(`Booking status updated to ${targetStatus.replace(/_/g, ' ')}.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(res.error || 'Failed to update booking status.');
    }
  };

  // Handler: Initiate Real Razorpay Payment
  const handlePayUnlockFee = async () => {
    if (!booking) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const callerUid = user?.uid || booking.clientUid || 'guest_client_uid';
    const callerRole = (role?.toLowerCase() as 'client' | 'lawyer' | 'admin' | 'super_admin') || 'client';

    try {
      await initiateRazorpayPayment({
        bookingId: booking.id,
        userId: callerUid,
        userRole: callerRole,
        clientName: booking.clientName || 'Valued Client',
        clientEmail: booking.clientEmail || undefined,
        clientPhone: booking.clientPhone || undefined,
        onSuccess: (res) => {
          setIsProcessing(false);
          if (res.booking) {
            setBooking(res.booking);
          }
          setSuccessMessage(`Payment of ₹${booking.unlockAmountInr || 299} verified! Advocate contact and vault unlocked.`);
          loadBooking();
        },
        onError: (errMsg) => {
          setIsProcessing(false);
          setErrorMessage(errMsg);
        },
        onDismiss: () => {
          setIsProcessing(false);
        },
      });
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage(err instanceof Error ? err.message : 'Error launching payment checkout');
    }
  };

  // Handler: Cancel Booking
  const handleCancelBooking = async () => {
    if (!booking) return;

    if (!cancelReason.trim() || cancelReason.trim().length < 5) {
      setErrorMessage('A cancellation reason (minimum 5 characters) is required.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const actorUid = user?.uid || 'guest_uid';
    const actorRole = (role?.toLowerCase() as 'client' | 'lawyer' | 'admin' | 'super_admin') || 'client';

    const res = await cancelBooking({
      bookingId: booking.id,
      actorUid,
      actorRole,
      reason: cancelReason.trim(),
    });

    setIsProcessing(false);
    setShowCancelModal(false);

    if (res.success && res.booking) {
      setBooking(res.booking);
      setSuccessMessage('Booking has been cancelled and the consultation slot has been released.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(res.error || 'Failed to cancel booking.');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Spinner size="lg" className="mx-auto text-blue-900" />
            <p className="text-sm text-slate-500 font-medium">Loading booking details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 py-12">
          <Container className="max-w-md mx-auto">
            <Card className="p-6 text-center space-y-4">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
              <CardTitle className="text-lg">Booking Not Found</CardTitle>
              <p className="text-xs text-slate-500">
                {errorMessage || 'The requested booking could not be accessed or you do not have permission to view it.'}
              </p>
              <Link href="/find-lawyer">
                <Button variant="primary" size="sm">Find an Advocate</Button>
              </Link>
            </Card>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // Stepper calculations
  const steps: Array<{ status: BookingStatus; label: string; desc: string }> = [
    { status: 'pending_payment', label: 'Payment', desc: '₹299 Unlock' },
    { status: 'pending_lawyer', label: 'Acceptance', desc: 'Advocate review' },
    { status: 'confirmed', label: 'Confirmed', desc: 'Slot reserved' },
    { status: 'in_progress', label: 'Consultation', desc: 'Active session' },
    { status: 'completed', label: 'Completed', desc: 'Concluded' },
  ];

  const statusOrder = ['pending_payment', 'pending_lawyer', 'confirmed', 'in_progress', 'completed'];
  const currentStepIndex = statusOrder.indexOf(booking.status);
  const isCancelled = booking.status === 'cancelled' || booking.status === 'cancelled_by_client' || booking.status === 'cancelled_by_lawyer';
  const isDisputed = booking.status === 'disputed';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-10">
        <Container className="max-w-5xl mx-auto space-y-6">
          {/* Top Navigation & Reference Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Link href="/" className="hover:text-blue-900 flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Home
                </Link>
                <span>/</span>
                <span className="text-slate-800 font-medium">Booking {booking.bookingReferenceNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {booking.bookingReferenceNumber}
                </h1>
                <StatusBadge status={booking.status} />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Created on {formatDate(booking.createdAt)} • Service: {booking.serviceCategory}
              </p>
            </div>

            {/* Role indicator */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white text-slate-700 text-xs py-1 px-2.5">
                <User className="h-3 w-3 mr-1 text-blue-700" />
                Viewing as {role || 'Client'}
              </Badge>
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

          {/* Cancellation Notice Banner */}
          {isCancelled && (
            <Alert variant="error" className="bg-red-50 border-red-200">
              <XCircle className="h-5 w-5 text-red-600 mr-2 shrink-0" />
              <div>
                <p className="font-bold text-xs sm:text-sm text-red-950">Booking Cancelled</p>
                <p className="text-xs text-red-800 mt-0.5">
                  Reason: {booking.cancellationReason || 'Cancelled by user'}. The consultation slot has been released.
                </p>
              </div>
            </Alert>
          )}

          {/* Stepper Progress Bar */}
          {!isCancelled && !isDisputed && (
            <Card className="border-slate-200 bg-white shadow-xs p-4 sm:p-6">
              <div className="grid grid-cols-5 gap-2 relative">
                {steps.map((step, idx) => {
                  const isDone = currentStepIndex > idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step.status} className="text-center space-y-1.5 relative">
                      <div
                        className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-blue-900 text-white ring-4 ring-blue-100'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-xs font-bold block truncate ${
                          isCurrent ? 'text-blue-950' : isDone ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate hidden sm:block">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Main Grid: Details & Action Console */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Consultation Information & Timeline */}
            <div className="lg:col-span-8 space-y-6">
              {/* Advocate & Appointment Snapshot */}
              <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-blue-900" />
                      Consultation & Advocate Details
                    </CardTitle>
                    <Badge variant="navy" className="bg-blue-50 text-blue-900 border-blue-200 text-xs">
                      {booking.serviceCategory}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Advocate
                      </span>
                      <p className="text-sm font-bold text-slate-900">{booking.lawyerName}</p>
                      <p className="text-xs text-slate-500 font-mono">Sanad: {booking.lawyerSanadNumber}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Scheduled Slot
                      </span>
                      <p className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-blue-700 shrink-0" />
                        {booking.preferredDate} ({booking.preferredTimeSlot} IST)
                      </p>
                      <p className="text-[11px] text-slate-500">Asia/Kolkata timezone</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Consultation Mode
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 capitalize">
                        {booking.consultationMode === 'in_person_office' && <Building className="h-4 w-4 text-blue-700" />}
                        {booking.consultationMode === 'video_call' && <Video className="h-4 w-4 text-purple-700" />}
                        {booking.consultationMode === 'phone_call' && <Phone className="h-4 w-4 text-emerald-700" />}
                        <span>{booking.consultationMode.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{booking.chamberAddress}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Client Contact
                      </span>
                      <p className="text-xs font-semibold text-slate-800">{booking.clientName}</p>
                      <p className="text-xs text-slate-600">{booking.clientPhone}</p>
                      {booking.clientEmail && <p className="text-xs text-slate-500">{booking.clientEmail}</p>}
                    </div>
                  </div>

                  {/* Case Description */}
                  <div className="pt-3 border-t border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Client Case Notes / Matter Description
                    </span>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed whitespace-pre-line">
                      {booking.caseDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Encrypted Document Vault */}
              <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-blue-900" />
                      Encrypted Document Vault
                    </CardTitle>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs">
                      <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" />
                      Private AES-256 Storage
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-5">
                  {/* Feedback notices */}
                  {docSuccessMessage && (
                    <Alert variant="success" className="animate-in fade-in py-2">
                      <CheckCircle2 className="h-4 w-4 mr-2 shrink-0" />
                      <span>{docSuccessMessage}</span>
                    </Alert>
                  )}

                  {docErrorMessage && (
                    <Alert variant="error" className="animate-in fade-in py-2">
                      <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
                      <span>{docErrorMessage}</span>
                    </Alert>
                  )}

                  {/* Upload Controls */}
                  <form onSubmit={handleUploadDocument} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <UploadCloud className="h-3.5 w-3.5 text-blue-800" />
                        Upload Case Document / Deliverable
                      </span>
                      <span className="text-[11px] text-slate-500">Max 5 MB (PDF, JPG, PNG)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Document Category *
                        </label>
                        <select
                          value={selectedDocType}
                          onChange={(e) => setSelectedDocType(e.target.value as BookingDocumentType)}
                          className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-blue-600 focus:outline-none"
                        >
                          <option value="property_title_deed">Property Title Deed / Sale Deed</option>
                          <option value="7_12_extract">7/12 & 8A Land Extract</option>
                          <option value="index_2">Index II Registration Extract</option>
                          <option value="encumbrance_certificate">Encumbrance Certificate</option>
                          <option value="rera_allotment_letter">MahaRERA Allotment Letter</option>
                          <option value="power_of_attorney">Power of Attorney (PoA)</option>
                          <option value="society_noc">Society NOC / Share Certificate</option>
                          {role === 'lawyer' && (
                            <option value="completed_legal_opinion">Final Title Search Report / Legal Opinion</option>
                          )}
                          <option value="other_client_document">Other Supporting Document</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Select File *
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-950 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={!uploadFile || isUploadingDoc}
                        isLoading={isUploadingDoc}
                        className="bg-blue-900 hover:bg-blue-950 text-xs"
                      >
                        <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
                        Secure Upload to Vault
                      </Button>
                    </div>
                  </form>

                  {/* Documents List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Vault Files ({documents.length})
                      </h4>
                    </div>

                    {documents.length === 0 ? (
                      <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-medium text-slate-600">No documents uploaded yet.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Upload title documents, 7/12 extracts, or draft agreements to share confidentially with your advocate.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                        {documents.map((docItem) => {
                          const isDeliverable = docItem.isCompletedDeliverable;
                          const isQuarantined = docItem.scanStatus === 'quarantined';

                          return (
                            <div
                              key={docItem.id}
                              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg shrink-0 ${isDeliverable ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                  {isDeliverable ? <FileCheck className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                                      {docItem.originalFilename}
                                    </p>
                                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-slate-100 text-slate-700">
                                      v{docItem.version}
                                    </Badge>
                                    {isDeliverable && (
                                      <Badge variant="navy" className="text-[10px] py-0 px-1.5 bg-purple-100 text-purple-800 border-purple-200">
                                        Advocate Deliverable
                                      </Badge>
                                    )}
                                    {isQuarantined ? (
                                      <Badge variant="error" className="text-[10px] py-0 px-1.5">
                                        Quarantined
                                      </Badge>
                                    ) : (
                                      <Badge variant="success" className="text-[10px] py-0 px-1.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Clean
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500">
                                    {(docItem.size / 1024).toFixed(1)} KB • Uploaded on {formatDate(docItem.createdAt)} by {docItem.uploaderRole}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isQuarantined || downloadingDocId === docItem.id}
                                  isLoading={downloadingDocId === docItem.id}
                                  onClick={() => handleDownloadDocument(docItem)}
                                  className="text-xs h-8 border-slate-200 hover:bg-blue-50 hover:text-blue-900"
                                >
                                  <Download className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Lifecycle Timeline History */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-900" />
                    Booking Timeline & Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {booking.timeline.map((event, idx) => (
                      <div key={idx} className="relative space-y-1">
                        <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-blue-900 ring-4 ring-blue-100" />
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 capitalize">
                            {event.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {event.notes || `State transitioned by ${event.actorRole}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: State Machine Action Console & Fee Breakdown */}
            <div className="lg:col-span-4 space-y-6">
              {/* Action Console Card */}
              <Card className="border-blue-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Booking Actions Console
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* PENDING_PAYMENT Actions */}
                  {booking.status === 'pending_payment' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                        <p className="font-bold">Awaiting ₹{booking.unlockAmountInr || 299} Unlock Payment</p>
                        <p className="text-[11px]">
                          Complete contact unlock to reveal direct advocate phone and notify the lawyer for confirmation.
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        fullWidth
                        size="sm"
                        onClick={handlePayUnlockFee}
                        isLoading={isProcessing}
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold shadow-xs"
                      >
                        <CreditCard className="h-4 w-4 mr-1.5" />
                        Pay ₹{booking.unlockAmountInr || 299} via Razorpay
                      </Button>
                      <Button
                        variant="outline"
                        fullWidth
                        size="sm"
                        onClick={() => handleTransition('pending_lawyer', 'Payment completed (Demo/Simulation mode)')}
                        isLoading={isProcessing}
                        className="text-[11px] text-slate-500 hover:text-slate-700"
                      >
                        ⚡ Simulate Instant Payment (Sandbox)
                      </Button>
                      <Button
                        variant="ghost"
                        fullWidth
                        size="sm"
                        onClick={() => setShowCancelModal(true)}
                        disabled={isProcessing}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Cancel Booking
                      </Button>
                    </div>
                  )}

                  {/* PENDING_LAWYER Actions */}
                  {booking.status === 'pending_lawyer' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1">
                        <p className="font-bold">Payment Verified • Awaiting Advocate</p>
                        <p className="text-[11px]">
                          The advocate has been alerted and will confirm the appointment slot.
                        </p>
                      </div>

                      {/* Lawyer controls */}
                      <Button
                        variant="primary"
                        fullWidth
                        size="sm"
                        onClick={() => handleTransition('confirmed', 'Advocate confirmed appointment slot')}
                        isLoading={isProcessing}
                        className="bg-blue-900 hover:bg-blue-950 text-xs font-semibold"
                      >
                        <CheckCheck className="h-4 w-4 mr-1.5" />
                        Confirm Appointment Slot
                      </Button>

                      <Button
                        variant="outline"
                        fullWidth
                        size="sm"
                        onClick={() => setShowCancelModal(true)}
                        disabled={isProcessing}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Decline / Cancel
                      </Button>
                    </div>
                  )}

                  {/* CONFIRMED Actions */}
                  {booking.status === 'confirmed' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                        <p className="font-bold">Appointment Confirmed</p>
                        <p className="text-[11px]">
                          Consultation slot is locked. Please arrive at the chamber or join the video meeting at the scheduled time.
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        fullWidth
                        size="sm"
                        onClick={() => handleTransition('in_progress', 'Consultation session started')}
                        isLoading={isProcessing}
                        className="text-xs font-semibold"
                      >
                        <PlayCircle className="h-4 w-4 mr-1.5" />
                        Start Consultation
                      </Button>

                      <Button
                        variant="outline"
                        fullWidth
                        size="sm"
                        onClick={() => setShowCancelModal(true)}
                        disabled={isProcessing}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Cancel Appointment
                      </Button>
                    </div>
                  )}

                  {/* IN_PROGRESS Actions */}
                  {booking.status === 'in_progress' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1">
                        <p className="font-bold">Consultation Underway</p>
                        <p className="text-[11px]">
                          Legal review and advisory in progress.
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        fullWidth
                        size="sm"
                        onClick={() => handleTransition('completed', 'Consultation successfully concluded')}
                        isLoading={isProcessing}
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        Mark as Completed
                      </Button>
                    </div>
                  )}

                  {/* COMPLETED Actions */}
                  {booking.status === 'completed' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1 text-center">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
                      <p className="font-bold">Consultation Concluded</p>
                      <p className="text-[11px] text-emerald-800">
                        Thank you for using LegalHubMumbai.
                      </p>
                    </div>
                  )}

                  {/* CANCELLED Alert */}
                  {isCancelled && (
                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 text-center">
                      <p className="font-semibold">No further actions available on cancelled bookings.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fee Breakdown Card */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Fee Breakdown & Receipts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-600">Platform Unlock Fee:</span>
                    <span className="font-bold text-slate-900">₹{booking.unlockAmountInr || 299}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-600">Advocate Consultation Fee:</span>
                    <span className="font-semibold text-slate-800">
                      {booking.consultationFeeInr ? formatINR(booking.consultationFeeInr) : '₹1,500'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    * The ₹299 unlock fee facilitates encrypted document vault access and direct advocate connection. Consultation fees are settled directly with the advocate.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </main>

      {/* Cancellation Dialog */}
      <Dialog
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title={
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span>Cancel Consultation Booking</span>
          </div>
        }
        description={`Cancelling will immediately release the reserved time slot (${booking.preferredDate} at ${booking.preferredTimeSlot}) so other property clients can book.`}
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCancelModal(false)}
              disabled={isProcessing}
              className="text-xs"
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCancelBooking}
              isLoading={isProcessing}
              className="bg-red-600 hover:bg-red-700 text-xs font-semibold"
            >
              Confirm Cancellation
            </Button>
          </>
        }
        maxWidth="md"
      >
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Reason for Cancellation *
          </label>
          <Textarea
            rows={3}
            placeholder="Please provide a brief reason for cancelling (minimum 5 characters)..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="text-xs"
          />
        </div>
      </Dialog>

      <Footer />
    </div>
  );
}
