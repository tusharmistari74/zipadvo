'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Button,
  Input,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  Spinner,
} from '@legalhub/ui';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileCheck,
  Building,
  Upload,
  ArrowRight,
  ArrowLeft,
  Save,
  AlertCircle,
  Scale,
  Calendar,
  User,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../../lib/auth/context';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';
import {
  saveLawyerOnboardingDraft,
  getLawyerKYCStatus,
  submitLawyerKYC,
  validateKycFile,
  getPrivateKycStoragePath,
  maskSensitiveId,
  type LawyerKycStatusSummary,
} from '../../../../lib/services/lawyer-kyc.service';
import {
  practiceAreasEnum,
  mumbaiCourtsEnum,
  type LawyerOnboardingInput,
} from '@legalhub/validation';
import type { PracticeArea, MumbaiCourt } from '@legalhub/types';

const STEPS = [
  { id: 1, label: 'Personal', icon: User },
  { id: 2, label: 'Bar Council', icon: Scale },
  { id: 3, label: 'Specialization', icon: FileCheck },
  { id: 4, label: 'Chamber & Fees', icon: Building },
  { id: 5, label: 'Availability', icon: Calendar },
  { id: 6, label: 'Private KYC', icon: Upload },
  { id: 7, label: 'Review & Submit', icon: CheckCircle2 },
];

export default function LawyerKycPage() {
  const { user, profile: authProfile, isAuthenticated, isLoading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [kycSummary, setKycSummary] = useState<LawyerKycStatusSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSavedNotice, setLastSavedNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<LawyerOnboardingInput>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      avatarUrl: '',
    },
    professionalInfo: {
      sanadNumber: 'MAH/',
      enrollmentYear: 2016,
      stateBarCouncil: 'Bar Council of Maharashtra and Goa',
      primaryCourt: 'Bombay High Court',
      additionalCourts: [],
    },
    specializationInfo: {
      title: 'Advocate & Property Legal Consultant',
      bio: 'Practicing advocate specializing in Mumbai conveyance, title search reports, and MahaRERA dispute resolutions.',
      practiceAreas: ['Property Registration & Conveyancing', 'Title Verification & Due Diligence'],
      yearsOfExperience: 8,
      spokenLanguages: ['English', 'Marathi', 'Hindi'],
    },
    chamberAndFees: {
      officeAddress: {
        line1: 'Chamber 201, Fort Chambers',
        line2: 'Nagindas Master Road',
        area: 'Fort',
        city: 'Mumbai',
        pincode: '400001',
        state: 'Maharashtra',
        country: 'India',
        landmark: 'Near Bombay High Court',
      },
      consultationFeeInr: 1500,
      isAcceptingBookings: true,
    },
    availability: {
      availabilitySchedule: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 2, startTime: '10:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 3, startTime: '10:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 4, startTime: '10:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 5, startTime: '10:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', isAvailable: true },
      ],
    },
    kycDocuments: {
      panNumber: '',
      panCardStoragePath: '',
      aadhaarLastFour: '',
      aadhaarProofStoragePath: '',
      sanadNumber: 'MAH/',
      sanadCertificateStoragePath: '',
      officeProofStoragePath: '',
    },
  });

  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // Load existing status and draft
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    async function loadStatus() {
      setIsLoading(true);
      try {
        const summary = await getLawyerKYCStatus(user!.uid);
        setKycSummary(summary);

        if (summary.draftData) {
          // Merge saved draft data if available
          setFormData((prev) => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              ...(summary.draftData?.personalInfo || {}),
            },
            professionalInfo: {
              ...prev.professionalInfo,
              ...(summary.draftData?.professionalInfo || {}),
            },
            specializationInfo: {
              ...prev.specializationInfo,
              ...(summary.draftData?.specializationInfo || {}),
            },
            chamberAndFees: {
              ...prev.chamberAndFees,
              ...(summary.draftData?.chamberAndFees || {}),
              officeAddress: {
                ...prev.chamberAndFees.officeAddress,
                ...(summary.draftData?.chamberAndFees?.officeAddress || {}),
              },
            },
            availability: {
              availabilitySchedule:
                summary.draftData?.availability?.availabilitySchedule ||
                prev.availability.availabilitySchedule,
            },
            kycDocuments: {
              ...prev.kycDocuments,
              ...(summary.draftData?.kycDocuments || {}),
            },
          }));
          if (summary.draftData.currentStep) {
            setCurrentStep(summary.draftData.currentStep);
          }
        } else if (authProfile) {
          // Pre-populate with auth profile
          setFormData((prev) => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              fullName: authProfile.fullName || '',
              email: authProfile.email || '',
              phone: authProfile.phoneNumber || '',
            },
          }));
        }
      } catch (err) {
        console.error('Failed to load KYC status:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStatus();
  }, [isAuthenticated, user, authProfile]);

  // Handle Manual Save Draft
  const handleSaveDraft = async () => {
    if (!user) return;
    setIsSavingDraft(true);
    setErrorMessage(null);
    try {
      await saveLawyerOnboardingDraft(user.uid, {
        currentStep,
        personalInfo: formData.personalInfo,
        professionalInfo: formData.professionalInfo,
        specializationInfo: formData.specializationInfo,
        chamberAndFees: formData.chamberAndFees,
        availability: {
          availabilitySchedule: formData.availability.availabilitySchedule,
        },
        kycDocuments: formData.kycDocuments,
      });
      setLastSavedNotice(`Draft saved at ${new Date().toLocaleTimeString()}`);
      setTimeout(() => setLastSavedNotice(null), 4000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Handle File Upload Simulation / Path Generator
  const handleFileUpload = (
    docType: 'pan' | 'aadhaar' | 'sanad' | 'office_proof',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validation = validateKycFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file');
      return;
    }

    setErrorMessage(null);
    const storagePath = getPrivateKycStoragePath(user.uid, docType, file.name);

    setFormData((prev) => {
      const docs = { ...prev.kycDocuments };
      if (docType === 'pan') docs.panCardStoragePath = storagePath;
      if (docType === 'aadhaar') docs.aadhaarProofStoragePath = storagePath;
      if (docType === 'sanad') docs.sanadCertificateStoragePath = storagePath;
      if (docType === 'office_proof') docs.officeProofStoragePath = storagePath;
      return { ...prev, kycDocuments: docs };
    });
  };

  // Submit Final KYC Application
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!declarationAccepted) {
      setErrorMessage('Please accept the Bar Council compliance declaration before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitLawyerKYC(user.uid, formData);
      if (!res.success) {
        setErrorMessage(res.error || 'Validation failed. Please review all steps.');
        setIsSubmitting(false);
        return;
      }

      // Refresh status
      const updatedSummary = await getLawyerKYCStatus(user.uid);
      setKycSummary(updatedSummary);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Container className="py-24 text-center">
          <Spinner size="lg" className="mx-auto text-blue-700" />
          <p className="text-sm text-slate-600 mt-4">Loading verification status...</p>
        </Container>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Container className="py-20 max-w-md">
          <Card className="border-slate-200 bg-white shadow-md text-center p-6 space-y-4">
            <Scale className="h-12 w-12 text-blue-700 mx-auto" />
            <h1 className="font-serif text-2xl font-bold text-slate-900">Advocate Portal Login</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Please sign in with your advocate account to submit or manage your Bar Council KYC verification.
            </p>
            <Link href="/login?redirect=/lawyer/kyc" className="block">
              <Button variant="primary" fullWidth>
                Sign In to Continue
              </Button>
            </Link>
          </Card>
        </Container>
        <Footer />
      </div>
    );
  }

  // View: SUBMITTED or UNDER_REVIEW Status Tracker
  if (kycSummary?.status === 'submitted' || kycSummary?.status === 'under_review') {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <Navbar />
        <Container className="py-12 max-w-2xl">
          <Card className="border-slate-200 bg-white shadow-md">
            <CardHeader className="text-center pb-4 border-b border-slate-100">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 mb-2">
                <Clock className="h-8 w-8 animate-pulse" />
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 mx-auto">
                Verification in Progress
              </Badge>
              <CardTitle className="text-2xl font-bold text-slate-900 pt-2">
                Application Under Compliance Review
              </CardTitle>
              <p className="text-xs sm:text-sm text-slate-600">
                Your Bar Council Sanad and KYC documents have been securely submitted.
              </p>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <strong className="text-slate-900 block">1. Application & Documents Received</strong>
                    <span className="text-slate-500">
                      Encrypted storage paths recorded on {kycSummary.submittedAt ? new Date(kycSummary.submittedAt).toLocaleDateString('en-IN') : 'recently'}.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-blue-50/60 border border-blue-100">
                  <RefreshCw className="h-5 w-5 text-blue-700 shrink-0 mt-0.5 animate-spin" />
                  <div className="text-xs sm:text-sm">
                    <strong className="text-blue-950 block">2. Bar Council Records Verification</strong>
                    <span className="text-blue-800">
                      Cross-checking Sanad enrollment against Bar Council of Maharashtra & Goa registry.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50/60 border border-slate-100 opacity-60">
                  <ShieldCheck className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <strong className="text-slate-700 block">3. Profile Activation & Badge Issue</strong>
                    <span className="text-slate-500">
                      Upon approval, your verified profile will go live on the public discovery catalog.
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-100/70 border border-slate-200 text-xs text-slate-600 space-y-1 text-center">
                <p className="font-semibold text-slate-800">Review Turnaround Time (SLA)</p>
                <p>Applications are verified within 24 to 48 business hours. You will receive an SMS and email notification once completed.</p>
              </div>

              <div className="text-center pt-2">
                <Link href="/lawyer">
                  <Button variant="outline" size="sm">
                    Go to Lawyer Portal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </Container>
        <Footer />
      </div>
    );
  }

  // View: VERIFIED Status
  if (kycSummary?.status === 'verified') {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <Navbar />
        <Container className="py-12 max-w-2xl">
          <Card className="border-emerald-200 bg-white shadow-md text-center p-8 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <Badge variant="navy" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                Verified Advocate
              </Badge>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Verification Complete & Profile Live
              </h1>
              <p className="text-sm text-slate-600">
                Your Bar Council Sanad credentials have been verified. Your profile is active on the LegalHubMumbai discovery directory.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href={user ? `/lawyers/${user.uid}` : '/find-lawyer'}>
                <Button variant="primary" leftIcon={<ExternalLink className="h-4 w-4" />}>
                  View Public Profile
                </Button>
              </Link>
              <Link href="/lawyer">
                <Button variant="outline">
                  Lawyer Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <Container className="py-8 sm:py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Badge variant="outline" className="bg-white text-blue-700 border-blue-200 mb-1">
                <Scale className="h-3.5 w-3.5 mr-1" />
                Bar Council KYC Onboarding
              </Badge>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Advocate Verification Application
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {lastSavedNotice && (
                <span className="text-xs text-emerald-700 font-medium animate-in fade-in">
                  {lastSavedNotice}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                isLoading={isSavingDraft}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Draft
              </Button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600">
            Complete all 7 sections to verify your Bar Council Sanad credentials and activate your profile.
          </p>
        </div>

        {/* Rejection Alert if applicable */}
        {kycSummary?.status === 'rejected' && (
          <Alert variant="error" className="mb-6">
            <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
            <div>
              <strong className="block font-bold">Previous Submission Rejected</strong>
              <p className="text-xs mt-0.5">
                Reason: {kycSummary.rejectionReason || 'Documents could not be verified. Please re-upload clear copies.'}
              </p>
            </div>
          </Alert>
        )}

        {/* Error message */}
        {errorMessage && (
          <Alert variant="error" className="mb-6">
            <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
            <span>{errorMessage}</span>
          </Alert>
        )}

        {/* Stepper Progress Bar */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex items-center min-w-[640px] justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 -z-0" />
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isDone = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className="flex flex-col items-center gap-1.5 relative z-10 focus:outline-none group"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-700 border-blue-700 text-white ring-4 ring-blue-100'
                        : 'bg-white border-slate-300 text-slate-500 group-hover:border-slate-400'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      isCurrent ? 'text-blue-900 font-bold' : 'text-slate-600'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Card */}
        <Card className="border-slate-200 bg-white shadow-md">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
              {/* STEP 1: Personal & Identity */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-slate-900">
                      Step 1: Personal & Profile Identity
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Basic identity details as they appear on your legal documents.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Legal Name (with Adv. prefix) *
                      </label>
                      <Input
                        placeholder="e.g. Adv. Rajeshwar M. Deshmukh"
                        required
                        value={formData.personalInfo.fullName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            personalInfo: { ...formData.personalInfo, fullName: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Professional Email Address *
                      </label>
                      <Input
                        type="email"
                        placeholder="advocate@example.com"
                        required
                        value={formData.personalInfo.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            personalInfo: { ...formData.personalInfo, email: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contact Phone Number (+91) *
                      </label>
                      <Input
                        type="tel"
                        placeholder="+91 98765 43210"
                        required
                        value={formData.personalInfo.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            personalInfo: { ...formData.personalInfo, phone: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Profile Photo URL (Optional)
                      </label>
                      <Input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={formData.personalInfo.avatarUrl || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            personalInfo: { ...formData.personalInfo, avatarUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Bar Council & Court */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-slate-900">
                      Step 2: Bar Council Enrollment & Primary Court
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Enrollment details from your Bar Council Sanad certificate.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bar Council Sanad Number * (Format: MAH/1234/2015)
                      </label>
                      <Input
                        placeholder="MAH/4821/2012"
                        required
                        value={formData.professionalInfo.sanadNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            professionalInfo: {
                              ...formData.professionalInfo,
                              sanadNumber: e.target.value.toUpperCase(),
                            },
                            kycDocuments: {
                              ...formData.kycDocuments,
                              sanadNumber: e.target.value.toUpperCase(),
                            },
                          })
                        }
                      />
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Must match your physical Sanad certificate.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Year of Enrollment *
                      </label>
                      <Input
                        type="number"
                        min={1950}
                        max={new Date().getFullYear()}
                        required
                        value={formData.professionalInfo.enrollmentYear}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            professionalInfo: {
                              ...formData.professionalInfo,
                              enrollmentYear: parseInt(e.target.value) || 2015,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        State Bar Council *
                      </label>
                      <Input
                        readOnly
                        disabled
                        value={formData.professionalInfo.stateBarCouncil}
                        className="bg-slate-50 text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Primary Court Jurisdiction *
                      </label>
                      <select
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-none"
                        value={formData.professionalInfo.primaryCourt}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            professionalInfo: {
                              ...formData.professionalInfo,
                              primaryCourt: e.target.value as MumbaiCourt,
                            },
                          })
                        }
                      >
                        {mumbaiCourtsEnum.options.map((court) => (
                          <option key={court} value={court}>
                            {court}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Specialization & Experience */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-slate-900">
                      Step 3: Practice Specializations & Experience
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Highlight your real estate, conveyance, and registry expertise.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Professional Title *
                      </label>
                      <Input
                        placeholder="e.g. Senior Property & Conveyancing Advocate"
                        required
                        value={formData.specializationInfo.title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specializationInfo: {
                              ...formData.specializationInfo,
                              title: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Years of Active Practice *
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        required
                        value={formData.specializationInfo.yearsOfExperience}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specializationInfo: {
                              ...formData.specializationInfo,
                              yearsOfExperience: parseInt(e.target.value) || 1,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Core Practice Specializations (Select all that apply) *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {practiceAreasEnum.options.map((area) => {
                        const isSelected = formData.specializationInfo.practiceAreas.includes(
                          area as PracticeArea
                        );

                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => {
                              const updated = isSelected
                                ? formData.specializationInfo.practiceAreas.filter((a) => a !== area)
                                : [...formData.specializationInfo.practiceAreas, area as PracticeArea];
                              setFormData({
                                ...formData,
                                specializationInfo: {
                                  ...formData.specializationInfo,
                                  practiceAreas: updated,
                                },
                              });
                            }}
                            className={`p-3 rounded-lg border text-left text-xs font-medium transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-blue-50/80 border-blue-600 text-blue-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span>{area}</span>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Professional Bio (Min 30 characters) *
                    </label>
                    <Textarea
                      rows={4}
                      placeholder="Describe your legal background, major matters handled, court experience..."
                      required
                      value={formData.specializationInfo.bio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specializationInfo: {
                            ...formData.specializationInfo,
                            bio: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Chamber Address & Fees */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-slate-900">
                      Step 4: Chamber Address & Consultation Fee
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Your registered chamber location in Mumbai / MMR and initial consultation fee.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Chamber Address Line 1 *
                      </label>
                      <Input
                        placeholder="Chamber No., Building Name"
                        required
                        value={formData.chamberAndFees.officeAddress.line1}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chamberAndFees: {
                              ...formData.chamberAndFees,
                              officeAddress: {
                                ...formData.chamberAndFees.officeAddress,
                                line1: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Locality / Area in Mumbai *
                      </label>
                      <Input
                        placeholder="e.g. Fort, Bandra West, Andheri East"
                        required
                        value={formData.chamberAndFees.officeAddress.area}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chamberAndFees: {
                              ...formData.chamberAndFees,
                              officeAddress: {
                                ...formData.chamberAndFees.officeAddress,
                                area: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pincode * (6-digit)
                      </label>
                      <Input
                        placeholder="400001"
                        maxLength={6}
                        required
                        value={formData.chamberAndFees.officeAddress.pincode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chamberAndFees: {
                              ...formData.chamberAndFees,
                              officeAddress: {
                                ...formData.chamberAndFees.officeAddress,
                                pincode: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        City *
                      </label>
                      <select
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs"
                        value={formData.chamberAndFees.officeAddress.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chamberAndFees: {
                              ...formData.chamberAndFees,
                              officeAddress: {
                                ...formData.chamberAndFees.officeAddress,
                                city: e.target.value as 'Mumbai' | 'Navi Mumbai' | 'Thane',
                              },
                            },
                          })
                        }
                      >
                        <option value="Mumbai">Mumbai</option>
                        <option value="Navi Mumbai">Navi Mumbai</option>
                        <option value="Thane">Thane</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Consultation Fee (INR) *
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={100000}
                        required
                        value={formData.chamberAndFees.consultationFeeInr}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chamberAndFees: {
                              ...formData.chamberAndFees,
                              consultationFeeInr: parseInt(e.target.value) || 1000,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Availability Schedule */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-slate-900">
                      Step 5: Weekly Consultation Schedule
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Define the days and time windows you are open for chamber visits or video consultations.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {formData.availability.availabilitySchedule.map((slot, index) => {
                      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/60"
                        >
                          <div className="w-20 font-bold text-sm text-slate-900">
                            {dayLabels[slot.dayOfWeek]}
                          </div>

                          <div className="flex items-center gap-3">
                            <input
                              type="time"
                              className="rounded border border-slate-300 px-2 py-1 text-xs"
                              value={slot.startTime}
                              disabled={!slot.isAvailable}
                              onChange={(e) => {
                                const updated = [...formData.availability.availabilitySchedule];
                                updated[index] = { ...slot, startTime: e.target.value };
                                setFormData({
                                  ...formData,
                                  availability: { availabilitySchedule: updated },
                                });
                              }}
                            />
                            <span className="text-xs text-slate-400">to</span>
                            <input
                              type="time"
                              className="rounded border border-slate-300 px-2 py-1 text-xs"
                              value={slot.endTime}
                              disabled={!slot.isAvailable}
                              onChange={(e) => {
                                const updated = [...formData.availability.availabilitySchedule];
                                updated[index] = { ...slot, endTime: e.target.value };
                                setFormData({
                                  ...formData,
                                  availability: { availabilitySchedule: updated },
                                });
                              }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...formData.availability.availabilitySchedule];
                              updated[index] = { ...slot, isAvailable: !slot.isAvailable };
                              setFormData({
                                ...formData,
                                availability: { availabilitySchedule: updated },
                              });
                            }}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                              slot.isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {slot.isAvailable ? 'Available' : 'Closed'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 6: Private KYC Uploads */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-slate-900">
                      Step 6: Private KYC Documents & Identity Proofs
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Uploaded files are stored in private, encrypted compliance storage. They are never publicly accessible.
                    </p>
                  </div>

                  {/* PAN Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block">
                          1. PAN Card Verification *
                        </strong>
                        <span className="text-xs text-slate-500">
                          Enter 10-character PAN and upload scanned document (PDF or Image, &lt;5MB).
                        </span>
                      </div>
                      {formData.kycDocuments.panCardStoragePath && (
                        <Badge variant="navy" className="bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Attached
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          PAN Number (e.g. ABCDE1234F) *
                        </label>
                        <Input
                          placeholder="ABCDE1234F"
                          maxLength={10}
                          required
                          value={formData.kycDocuments.panNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              kycDocuments: {
                                ...formData.kycDocuments,
                                panNumber: e.target.value.toUpperCase(),
                              },
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Upload Scanned PAN Card *
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          onChange={(e) => handleFileUpload('pan', e)}
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Aadhaar Last 4 + Proof */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block">
                          2. Masked Aadhaar Verification *
                        </strong>
                        <span className="text-xs text-slate-500">
                          Provide last 4 digits only and upload masked Aadhaar copy.
                        </span>
                      </div>
                      {formData.kycDocuments.aadhaarProofStoragePath && (
                        <Badge variant="navy" className="bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Attached
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Aadhaar Last 4 Digits *
                        </label>
                        <Input
                          placeholder="1234"
                          maxLength={4}
                          required
                          value={formData.kycDocuments.aadhaarLastFour}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              kycDocuments: {
                                ...formData.kycDocuments,
                                aadhaarLastFour: e.target.value.replace(/\D/g, ''),
                              },
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Upload Masked Aadhaar Copy *
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          onChange={(e) => handleFileUpload('aadhaar', e)}
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bar Council Sanad Certificate */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block">
                          3. Bar Council Sanad Certificate *
                        </strong>
                        <span className="text-xs text-slate-500">
                          Upload high-resolution scan of your State Bar Council Sanad.
                        </span>
                      </div>
                      {formData.kycDocuments.sanadCertificateStoragePath && (
                        <Badge variant="navy" className="bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Attached
                        </Badge>
                      )}
                    </div>

                    <div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => handleFileUpload('sanad', e)}
                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: Review & Final Submit */}
              {currentStep === 7 && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-slate-900">
                      Step 7: Application Review & Final Submission
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Verify all submitted details before dispatching for Bar Council compliance check.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                      <strong className="text-slate-900 block font-bold">Personal & Sanad</strong>
                      <p><span className="text-slate-500">Name:</span> {formData.personalInfo.fullName}</p>
                      <p><span className="text-slate-500">Email:</span> {formData.personalInfo.email}</p>
                      <p><span className="text-slate-500">Sanad:</span> <span className="font-mono font-bold text-blue-800">{formData.professionalInfo.sanadNumber}</span> ({formData.professionalInfo.enrollmentYear})</p>
                      <p><span className="text-slate-500">Primary Court:</span> {formData.professionalInfo.primaryCourt}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                      <strong className="text-slate-900 block font-bold">Chamber & Experience</strong>
                      <p><span className="text-slate-500">Experience:</span> {formData.specializationInfo.yearsOfExperience} Years</p>
                      <p><span className="text-slate-500">Chamber:</span> {formData.chamberAndFees.officeAddress.area}, {formData.chamberAndFees.officeAddress.city}</p>
                      <p><span className="text-slate-500">Consultation Fee:</span> ₹{formData.chamberAndFees.consultationFeeInr}</p>
                      <p><span className="text-slate-500">Specializations:</span> {formData.specializationInfo.practiceAreas.length} Areas Selected</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <strong className="text-slate-900 block font-bold">Private KYC Summary</strong>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-700">
                      <div>PAN: <span className="font-mono font-semibold">{maskSensitiveId('pan', formData.kycDocuments.panNumber || 'ABCDE1234F')}</span></div>
                      <div>Aadhaar: <span className="font-mono font-semibold">{maskSensitiveId('aadhaar', formData.kycDocuments.aadhaarLastFour || '1234')}</span></div>
                      <div>Sanad Doc: <span className="text-emerald-700 font-semibold">{formData.kycDocuments.sanadCertificateStoragePath ? 'Attached' : 'Pending'}</span></div>
                    </div>
                  </div>

                  {/* Declaration Checkbox */}
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={declarationAccepted}
                        onChange={(e) => setDeclarationAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-xs text-slate-800 leading-relaxed">
                        I hereby declare that I am an actively enrolled advocate with the Bar Council of Maharashtra & Goa,
                        and that all information and documents uploaded are genuine, accurate, and valid under the Advocates Act, 1961.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation & Action Buttons */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setErrorMessage(null);
                      setCurrentStep((prev) => Math.max(1, prev - 1));
                    }}
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                  >
                    Previous
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 7 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      setErrorMessage(null);
                      setCurrentStep((prev) => Math.min(7, prev + 1));
                    }}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                    className="bg-emerald-600 hover:bg-emerald-700 shadow-md font-bold"
                  >
                    Submit for Verification
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </Container>

      <Footer />
    </div>
  );
}
