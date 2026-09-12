'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Button,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  Breadcrumb,
  Spinner,
} from '@legalhub/ui';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  Building,
  Scale,
  AlertTriangle,
  ArrowLeft,
  ShieldAlert,
  Lock,
  ExternalLink,
  AlertCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../../../../lib/auth/context';
import { Navbar } from '../../../../../components/layout/navbar';
import { Footer } from '../../../../../components/layout/footer';
import {
  getAdminLawyerDetail,
  approveLawyerKyc,
  rejectLawyerKyc,
  markLawyerUnderReview,
  suspendLawyer,
  restoreLawyer,
  type AdminLawyerDetail,
} from '../../../../../lib/services/admin-lawyer.service';
import { maskSensitiveId } from '../../../../../lib/services/lawyer-kyc.service';
import { formatDate, formatINR } from '@legalhub/utils';

interface AdminLawyerDetailPageProps {
  params: { lawyerId: string };
}

export default function AdminLawyerDetailPage({ params }: AdminLawyerDetailPageProps) {
  const { user, role, isAuthenticated, isLoading: authLoading } = useAuth();

  const [lawyer, setLawyer] = useState<AdminLawyerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Rejection modal / reason state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Suspension modal state
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');

  // Reviewer checklist state
  const [checklist, setChecklist] = useState({
    sanadMatches: false,
    nameMatchesPan: false,
    chamberAddressValid: false,
    documentsClear: false,
  });

  const isAdmin = role === 'admin' || role === 'super_admin';

  // Fetch Lawyer Detail
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setIsLoading(false);
      return;
    }

    async function loadDetail() {
      setIsLoading(true);
      try {
        const data = await getAdminLawyerDetail(params.lawyerId);
        setLawyer(data);
        if (data?.kycStatus === 'verified') {
          setChecklist({
            sanadMatches: true,
            nameMatchesPan: true,
            chamberAddressValid: true,
            documentsClear: true,
          });
        }
      } catch (err) {
        console.error('Failed to load lawyer detail:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDetail();
  }, [isAuthenticated, isAdmin, params.lawyerId]);

  // Handle Approve
  const handleApprove = async () => {
    if (!user || !lawyer) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await approveLawyerKyc(user.uid, lawyer.id, 'Approved by compliance administrator');
      if (res.success) {
        setActionSuccess('Advocate successfully verified and activated for public discovery.');
        const updated = await getAdminLawyerDetail(lawyer.id);
        setLawyer(updated);
      } else {
        setErrorMessage(res.error || 'Approval failed');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reject
  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !lawyer) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await rejectLawyerKyc(user.uid, lawyer.id, rejectionReason);
      if (res.success) {
        setShowRejectModal(false);
        setActionSuccess('Application rejected and notice recorded for the advocate.');
        const updated = await getAdminLawyerDetail(lawyer.id);
        setLawyer(updated);
      } else {
        setErrorMessage(res.error || 'Rejection failed');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Rejection failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Mark Under Review
  const handleMarkUnderReview = async () => {
    if (!user || !lawyer) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await markLawyerUnderReview(user.uid, lawyer.id);
      if (res.success) {
        setActionSuccess('Application marked as Under Review.');
        const updated = await getAdminLawyerDetail(lawyer.id);
        setLawyer(updated);
      } else {
        setErrorMessage(res.error || 'Failed to update status');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Suspend
  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !lawyer) return;
    setIsProcessing(true);
    try {
      const res = await suspendLawyer(user.uid, lawyer.id, suspensionReason);
      if (res.success) {
        setShowSuspendModal(false);
        setActionSuccess('Advocate profile has been suspended.');
        const updated = await getAdminLawyerDetail(lawyer.id);
        setLawyer(updated);
      } else {
        setErrorMessage(res.error || 'Suspension failed');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Suspension failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Restore
  const handleRestore = async () => {
    if (!user || !lawyer) return;
    setIsProcessing(true);
    try {
      const res = await restoreLawyer(user.uid, lawyer.id);
      if (res.success) {
        setActionSuccess('Advocate profile has been restored to verified active status.');
        const updated = await getAdminLawyerDetail(lawyer.id);
        setLawyer(updated);
      } else {
        setErrorMessage(res.error || 'Restoration failed');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Restoration failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Container className="py-24 text-center">
          <Spinner size="lg" className="mx-auto text-blue-700" />
          <p className="text-sm text-slate-600 mt-4">Loading application review...</p>
        </Container>
        <Footer />
      </div>
    );
  }

  // 403 Forbidden
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Container className="py-20 max-w-md">
          <Card className="border-rose-200 bg-white shadow-md text-center p-8 space-y-4">
            <ShieldAlert className="h-10 w-10 text-rose-600 mx-auto" />
            <h1 className="font-serif text-2xl font-bold text-slate-900">403 - Forbidden</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Only Administrator accounts can inspect private KYC documentation and approve Sanad credentials.
            </p>
            <Link href="/" className="block">
              <Button variant="primary" fullWidth>
                Return to Homepage
              </Button>
            </Link>
          </Card>
        </Container>
        <Footer />
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Container className="py-20 text-center">
          <Scale className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-slate-900">Lawyer Application Not Found</h1>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            The requested advocate application record does not exist.
          </p>
          <Link href="/admin/lawyers">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Verification Roster
            </Button>
          </Link>
        </Container>
        <Footer />
      </div>
    );
  }

  const allChecklistCompleted =
    checklist.sanadMatches &&
    checklist.nameMatchesPan &&
    checklist.chamberAddressValid &&
    checklist.documentsClear;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      {/* Breadcrumb Bar */}
      <div className="border-b border-slate-200 bg-white py-3">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Lawyer Verification Roster', href: '/admin/lawyers' },
              { label: lawyer.fullName },
            ]}
          />
        </Container>
      </div>

      <main className="py-8 sm:py-12">
        <Container>
          {/* Top Header Card */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link href="/admin/lawyers" className="text-xs text-blue-700 hover:underline flex items-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Roster
                </Link>
                <span className="text-slate-300">|</span>
                <span className="text-xs text-slate-500 font-mono">UID: {lawyer.uid}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  {lawyer.fullName}
                </h1>
                {lawyer.kycStatus === 'verified' && (
                  <Badge variant="navy" className="bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                    Verified Active
                  </Badge>
                )}
                {lawyer.kycStatus === 'submitted' && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    Pending Compliance Review
                  </Badge>
                )}
                {lawyer.kycStatus === 'under_review' && (
                  <Badge variant="navy" className="bg-blue-100 text-blue-800">
                    Under Active Investigation
                  </Badge>
                )}
                {lawyer.kycStatus === 'rejected' && (
                  <Badge variant="navy" className="bg-rose-100 text-rose-800">
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Rejected
                  </Badge>
                )}
                {lawyer.kycStatus === 'suspended' && (
                  <Badge variant="navy" className="bg-slate-800 text-white">
                    Suspended
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/lawyers/${lawyer.id}`} target="_blank">
                <Button variant="outline" size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                  Public Preview
                </Button>
              </Link>
            </div>
          </div>

          {/* Success Banner */}
          {actionSuccess && (
            <Alert variant="success" className="mb-6 animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 mr-2 shrink-0" />
              <span>{actionSuccess}</span>
            </Alert>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <Alert variant="error" className="mb-6">
              <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
              <span>{errorMessage}</span>
            </Alert>
          )}

          {/* Rejection Alert if already rejected */}
          {lawyer.kycStatus === 'rejected' && lawyer.rejectionReason && (
            <Alert variant="error" className="mb-6">
              <AlertTriangle className="h-5 w-5 mr-2 shrink-0" />
              <div>
                <strong className="block font-bold">Application Rejection Record</strong>
                <p className="text-xs mt-0.5">{lawyer.rejectionReason}</p>
              </div>
            </Alert>
          )}

          {/* 2-Column Review Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Verification Review Details */}
            <div className="lg:col-span-8 space-y-6">
              {/* 1. Bar Council Sanad Verification Card */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-blue-700" />
                      1. Bar Council Sanad Verification Check
                    </span>
                    <Badge variant="outline" className="font-mono text-blue-900 bg-blue-50">
                      {lawyer.sanadNumber}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-500 font-semibold block">Sanad Number</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{lawyer.sanadNumber}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-500 font-semibold block">Enrollment Year</span>
                      <span className="font-bold text-slate-900 text-sm">{lawyer.enrollmentYear}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-500 font-semibold block">State Bar Council</span>
                      <span className="font-medium text-slate-900 text-xs">{lawyer.stateBarCouncil}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-950 text-xs flex items-center justify-between">
                    <span>Bar Council of Maharashtra & Goa (BCMG) Roll Check:</span>
                    <span className="font-mono font-semibold text-blue-800">
                      {lawyer.sanadNumber} • Active Status
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Permitted Private KYC Documents */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-700" />
                    2. Private Identity & Credential Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3 text-xs sm:text-sm">
                  {/* PAN Document */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block font-bold">Permanent Account Number (PAN)</strong>
                      <span className="font-mono text-slate-600 text-xs">
                        {maskSensitiveId('pan', lawyer.kycSubmission?.panNumberEncrypted || 'ABCDE1234F')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {lawyer.kycSubmission?.panCardStoragePath || 'pan.pdf'}
                      </span>
                      <Button variant="outline" size="sm" leftIcon={<Eye className="h-3 w-3" />}>
                        Inspect
                      </Button>
                    </div>
                  </div>

                  {/* Aadhaar Last 4 + Proof */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block font-bold">Masked Aadhaar ID</strong>
                      <span className="font-mono text-slate-600 text-xs">
                        {maskSensitiveId('aadhaar', lawyer.kycSubmission?.aadhaarLastFour || '1234')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {lawyer.kycSubmission?.aadhaarProofStoragePath || 'aadhaar.pdf'}
                      </span>
                      <Button variant="outline" size="sm" leftIcon={<Eye className="h-3 w-3" />}>
                        Inspect
                      </Button>
                    </div>
                  </div>

                  {/* Sanad Certificate Upload */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block font-bold">Bar Council Sanad Certificate</strong>
                      <span className="text-slate-500 text-xs">Official state bar certificate scan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {lawyer.kycSubmission?.sanadCertificateStoragePath || 'sanad.pdf'}
                      </span>
                      <Button variant="outline" size="sm" leftIcon={<Eye className="h-3 w-3" />}>
                        Inspect
                      </Button>
                    </div>
                  </div>

                  {/* Office Proof */}
                  {lawyer.kycSubmission?.officeProofStoragePath && (
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                      <div>
                        <strong className="text-slate-900 block font-bold">Chamber Address Proof</strong>
                        <span className="text-slate-500 text-xs">Utility bill / lease agreement</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">
                          {lawyer.kycSubmission.officeProofStoragePath}
                        </span>
                        <Button variant="outline" size="sm" leftIcon={<Eye className="h-3 w-3" />}>
                          Inspect
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 3. Professional Information & Specializations */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-slate-700" />
                    3. Professional Profile & Practice Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold block">Professional Title</span>
                      <span className="font-medium text-slate-900">{lawyer.title}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold block">Experience</span>
                      <span className="font-medium text-slate-900">{lawyer.experienceYears} Years</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">
                      Selected Specializations
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {lawyer.practiceAreas.map((area, i) => (
                        <span
                          key={i}
                          className="inline-block bg-blue-50 text-blue-900 border border-blue-100 px-2.5 py-1 rounded-md text-xs font-medium"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                      Professional Bio
                    </span>
                    <p className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                      {lawyer.bio}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 4. Chamber Address & Consultation Fee */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-700" />
                    4. Chamber Location & Fee Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold block">Registered Chamber</span>
                      <span className="font-medium text-slate-900">{lawyer.chamberAddress}</span>
                      {lawyer.landmark && (
                        <span className="text-slate-500 text-xs block">Landmark: {lawyer.landmark}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold block">Consultation Fee</span>
                      <span className="font-bold text-slate-900 text-base">{formatINR(lawyer.consultationFeeInr)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Sticky Decision Console & Checklist */}
            <div className="lg:col-span-4 space-y-6 sticky top-24">
              {/* Decision Console */}
              <Card className="border-slate-300 bg-white shadow-md">
                <CardHeader className="bg-slate-900 text-white p-4 rounded-t-lg">
                  <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
                    <span>Compliance Action Console</span>
                    <Badge variant="navy" className="bg-slate-800 text-xs text-blue-300">
                      Privileged
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Interactive Verification Checklist */}
                  <div className="space-y-2.5 border-b border-slate-100 pb-4">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                      Admin Verification Checklist
                    </span>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.sanadMatches}
                        onChange={(e) => setChecklist({ ...checklist, sanadMatches: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span>Sanad number valid &amp; enrolled with BCMG</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.nameMatchesPan}
                        onChange={(e) => setChecklist({ ...checklist, nameMatchesPan: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span>PAN &amp; Aadhaar name matches Bar Sanad</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.chamberAddressValid}
                        onChange={(e) => setChecklist({ ...checklist, chamberAddressValid: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span>Chamber address verified in Mumbai / MMR</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.documentsClear}
                        onChange={(e) => setChecklist({ ...checklist, documentsClear: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span>Scanned documents are legible &amp; authentic</span>
                    </label>
                  </div>

                  {/* Primary Decision Actions */}
                  <div className="space-y-2 pt-1">
                    {lawyer.kycStatus !== 'verified' ? (
                      <Button
                        variant="primary"
                        fullWidth
                        size="md"
                        isLoading={isProcessing}
                        disabled={!allChecklistCompleted}
                        onClick={handleApprove}
                        leftIcon={<CheckCircle2 className="h-4 w-4" />}
                        className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow-sm"
                      >
                        Approve &amp; Activate Sanad
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        fullWidth
                        size="md"
                        isLoading={isProcessing}
                        onClick={() => setShowSuspendModal(true)}
                        leftIcon={<AlertTriangle className="h-4 w-4" />}
                        className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                      >
                        Suspend / Block Profile
                      </Button>
                    )}

                    {lawyer.kycStatus === 'suspended' && (
                      <Button
                        variant="primary"
                        fullWidth
                        size="md"
                        isLoading={isProcessing}
                        onClick={handleRestore}
                        leftIcon={<RefreshCw className="h-4 w-4" />}
                      >
                        Restore Profile
                      </Button>
                    )}

                    {lawyer.kycStatus === 'submitted' && (
                      <Button
                        variant="outline"
                        fullWidth
                        size="sm"
                        isLoading={isProcessing}
                        onClick={handleMarkUnderReview}
                        leftIcon={<Clock className="h-3.5 w-3.5 text-amber-600" />}
                      >
                        Mark Under Review
                      </Button>
                    )}

                    {lawyer.kycStatus !== 'rejected' && (
                      <Button
                        variant="outline"
                        fullWidth
                        size="sm"
                        onClick={() => setShowRejectModal(true)}
                        leftIcon={<XCircle className="h-3.5 w-3.5 text-rose-600" />}
                        className="border-rose-200 text-rose-700 hover:bg-rose-50"
                      >
                        Reject Application
                      </Button>
                    )}
                  </div>

                  {!allChecklistCompleted && lawyer.kycStatus !== 'verified' && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 text-center">
                      Complete all 4 verification checkboxes above to enable final approval.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Application Timeline Card */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader className="p-4 pb-2 border-b border-slate-100">
                  <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Application History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Submitted Date:</span>
                    <strong className="text-slate-900">{lawyer.submittedAt ? formatDate(lawyer.submittedAt) : 'N/A'}</strong>
                  </div>
                  {lawyer.verifiedAt && (
                    <div className="flex justify-between text-emerald-800">
                      <span>Verified Date:</span>
                      <strong>{formatDate(lawyer.verifiedAt)}</strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Current Status:</span>
                    <span className="font-mono font-bold uppercase">{lawyer.kycStatus}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </main>

      {/* REJECTION REASON MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <Card className="max-w-md w-full border-slate-200 bg-white shadow-xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-rose-600" />
                Reject Lawyer Application
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide a detailed rejection reason. This message will be sent to the advocate so they can correct their documents and resubmit.
              </p>

              <form onSubmit={handleReject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mandatory Rejection Explanation (Min 10 characters) *
                  </label>
                  <Textarea
                    rows={4}
                    required
                    placeholder="e.g. The Bar Council Sanad certificate scan is blurred and enrollment number MAH/XXXX/YYYY does not match the applicant identity."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRejectModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isProcessing}
                    disabled={rejectionReason.trim().length < 10}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SUSPENSION MODAL */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <Card className="max-w-md w-full border-slate-200 bg-white shadow-xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Suspend Advocate Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Suspending this advocate will immediately hide their profile from public discovery and disable new bookings.
              </p>

              <form onSubmit={handleSuspend} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason for Suspension *
                  </label>
                  <Textarea
                    rows={3}
                    required
                    placeholder="e.g. Client complaint investigation pending or Bar Council license status update."
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSuspendModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isProcessing}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Confirm Suspension
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
