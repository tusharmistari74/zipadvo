'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  Button,
  Input,
  Textarea,
  Badge,
  Alert,
} from '@legalhub/ui';
import {
  ShieldCheck,
  Building,
  Video,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import type { PublicLawyerProfile } from '../../lib/services/lawyer-profile.service';
import type { PracticeArea, ConsultationMode, TimeSlotItem } from '@legalhub/types';
import { useAuth } from '../../lib/auth/context';
import { ClientBookingCalendar } from './client-booking-calendar';
import { DEFAULT_LAWYER_AVAILABILITY_CONFIG } from '../../lib/services/availability.service';
import { createBooking } from '../../lib/services/booking.service';
import { saveLocalAuthSession } from '../../lib/auth/auth-service';
import { usePlatformSettings } from '../../lib/hooks/use-platform-settings';
import type { UserProfile } from '@legalhub/types';
import { formatINR } from '@legalhub/utils';

interface BookingModalProps {
  lawyer: PublicLawyerProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ lawyer, isOpen, onClose }: BookingModalProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { unlockFee } = usePlatformSettings();

  // Step 1..4
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedService, setSelectedService] = useState<PracticeArea>(
    lawyer.practiceAreas[0] || 'Property Registration & Conveyancing'
  );
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotItem | null>(null);
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>('in_person_office');
  const [caseDescription, setCaseDescription] = useState('');
  const [clientName, setClientName] = useState(profile?.fullName || user?.displayName || 'Tushar Mistari');
  const [clientPhone, setClientPhone] = useState(profile?.phoneNumber || user?.phoneNumber || '+91 77689 42390');
  const [clientEmail, setClientEmail] = useState(profile?.email || user?.email || 'tusharmistari702@gmail.com');

  // Status & Error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync profile details once auth mounts
  React.useEffect(() => {
    if (profile) {
      if (profile.fullName) setClientName(profile.fullName);
      if (profile.phoneNumber) setClientPhone(profile.phoneNumber);
      if (profile.email) setClientEmail(profile.email);
    } else if (user) {
      if (user.displayName) setClientName(user.displayName);
      if (user.phoneNumber) setClientPhone(user.phoneNumber);
      if (user.email) setClientEmail(user.email);
    }
  }, [profile, user]);

  const availabilityConfig = {
    ...DEFAULT_LAWYER_AVAILABILITY_CONFIG,
    weeklySchedule: DEFAULT_LAWYER_AVAILABILITY_CONFIG.weeklySchedule.map((day) => {
      const match = lawyer.availabilitySchedule.find((s) => s.dayOfWeek === day.dayOfWeek);
      if (match) {
        return {
          ...day,
          isAvailable: match.isAvailable,
          startTime: match.startTime,
          endTime: match.endTime,
        };
      }
      return day;
    }),
  };

  const handleSelectSlot = (date: string, slot: TimeSlotItem) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
    setErrorMessage(null);
  };

  const handleNextFromStep1 = () => {
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!selectedDate || !selectedSlot || !selectedSlot.isAvailable) {
      setErrorMessage('Please select an available consultation date and time slot.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(3);
  };

  const handleNextFromStep3 = () => {
    if (!clientName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!clientPhone.trim() || clientPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number with +91 country code.');
      return;
    }
    if (!caseDescription.trim() || caseDescription.trim().length < 10) {
      setErrorMessage('Please provide a brief description of your property case/matter (minimum 10 characters).');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(4);
  };

  const handleConfirmAndCreateBooking = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const clientUid = user?.uid || profile?.uid || profile?.id || `client_${Date.now().toString(36)}`;

    // Ensure active client session is saved locally
    if (!profile) {
      const activeClientSession: UserProfile = {
        id: clientUid,
        uid: clientUid,
        email: clientEmail.trim() || 'tusharmistari702@gmail.com',
        fullName: clientName.trim() || 'Tushar Mistari',
        phoneNumber: clientPhone.trim() || '+91 77689 42390',
        role: 'client',
        status: 'active',
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveLocalAuthSession(activeClientSession);
    }

    const result = await createBooking(
      {
        lawyerUid: lawyer.id,
        serviceCategory: selectedService,
        caseDescription: caseDescription.trim(),
        preferredDate: selectedDate,
        preferredTimeSlot: selectedSlot?.id || '10:00-11:00',
        consultationMode,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim() || undefined,
        uploadedDocumentIds: [],
      },
      clientUid
    );

    setIsSubmitting(false);

    if (result.success && result.booking) {
      onClose();
      router.push(`/booking/${result.booking.id}`);
    } else {
      setErrorMessage(result.error || 'Failed to create booking. Please choose another slot.');
    }
  };

  // Stepper Header
  const modalTitle = (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-600" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Bar Council Verified Appointment
        </span>
        <Badge variant="navy" className="ml-auto text-[11px]">
          Step {currentStep} of 4
        </Badge>
      </div>
      <h2 className="text-lg font-bold text-slate-900">
        Schedule Consultation with {lawyer.fullName}
      </h2>
      <p className="text-xs text-slate-500">
        {lawyer.title} • {lawyer.primaryCourt}
      </p>
    </div>
  );

  // Modal Footer Buttons
  const modalFooter = (
    <div className="w-full flex items-center justify-between">
      {currentStep > 1 ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)}
          disabled={isSubmitting}
          className="text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting} className="text-xs">
          Cancel
        </Button>
      )}

      <div>
        {currentStep === 1 && (
          <Button variant="primary" size="sm" onClick={handleNextFromStep1} className="text-xs">
            Select Slot <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
        {currentStep === 2 && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleNextFromStep2}
            disabled={!selectedSlot || !selectedSlot.isAvailable}
            className="text-xs"
          >
            Proceed to Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
        {currentStep === 3 && (
          <Button variant="primary" size="sm" onClick={handleNextFromStep3} className="text-xs">
            Review Summary <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
        {currentStep === 4 && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirmAndCreateBooking}
            isLoading={isSubmitting}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-900/20"
          >
            Confirm & Create Booking
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={modalFooter}
      maxWidth="2xl"
    >
      <div className="space-y-4 py-2">
        {/* Stepper Progress */}
        <div className="grid grid-cols-4 gap-2 pb-3 border-b border-slate-100">
          {['Service', 'Slot', 'Details', 'Review'].map((label, idx) => {
            const stepNum = idx + 1;
            const isDone = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;

            return (
              <div key={label} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    isDone ? 'bg-emerald-500' : isCurrent ? 'bg-blue-900' : 'bg-slate-200'
                  }`}
                />
                <span
                  className={`text-[10px] block truncate font-medium ${
                    isCurrent ? 'text-blue-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  {stepNum}. {label}
                </span>
              </div>
            );
          })}
        </div>

        {errorMessage && (
          <Alert variant="error" className="animate-in fade-in">
            <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
            <span>{errorMessage}</span>
          </Alert>
        )}

        {/* Step 1: Select Service */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Select Legal Matter / Practice Area
              </h3>
              <p className="text-xs text-slate-500">
                Choose the specialized practice area for your property consultation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {lawyer.practiceAreas.map((area) => {
                const isSelected = selectedService === area;
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setSelectedService(area)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/70 ring-2 ring-blue-900/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{area}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-900 shrink-0" />}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Verified advocate chamber consultation
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">Consultation Fee Guidance:</span>
              <span className="font-bold text-slate-900">
                {formatINR(lawyer.consultationFeeInr)} / consultation
              </span>
            </div>
          </div>
        )}

        {/* Step 2: Select Date & Slot */}
        {currentStep === 2 && (
          <div className="space-y-3">
            <ClientBookingCalendar
              lawyerName={lawyer.fullName}
              config={availabilityConfig}
              consultationFeeInr={lawyer.consultationFeeInr}
              selectedDate={selectedDate}
              selectedSlotId={selectedSlot?.id}
              onSelectSlot={handleSelectSlot}
            />
          </div>
        )}

        {/* Step 3: Client Details & Consultation Mode */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Consultation Mode & Case Notes
              </h3>
              <p className="text-xs text-slate-500">
                Select how you wish to consult with {lawyer.fullName} and describe your requirement.
              </p>
            </div>

            {/* Consultation Mode Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'in_person_office' as ConsultationMode,
                  label: 'Chamber Visit',
                  desc: lawyer.locality + ', Mumbai',
                  icon: Building,
                },
                {
                  id: 'video_call' as ConsultationMode,
                  label: 'Video Consult',
                  desc: 'Secure Google Meet / Zoom',
                  icon: Video,
                },
                {
                  id: 'phone_call' as ConsultationMode,
                  label: 'Phone Call',
                  desc: 'Direct audio call',
                  icon: Phone,
                },
              ].map((mode) => {
                const isSelected = consultationMode === mode.id;
                const Icon = mode.icon;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setConsultationMode(mode.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/70 ring-2 ring-blue-900/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mb-1.5 ${isSelected ? 'text-blue-900' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold text-slate-900 block">{mode.label}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{mode.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Case Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Brief Case Description / Legal Question *
              </label>
              <Textarea
                rows={3}
                placeholder="e.g. Need verification of 30-year title chain and deed of conveyance for an apartment in Bandra West..."
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                className="text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Your notes are confidential and shared solely with the verified advocate.
              </p>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Your Full Name *
                </label>
                <Input
                  placeholder="e.g. Rajesh Sharma"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  WhatsApp / Mobile Number *
                </label>
                <Input
                  placeholder="+91 98200 12345"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Email Address (Optional)
              </label>
              <Input
                placeholder="rajesh.sharma@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>
        )}

        {/* Step 4: Review & Summary Breakdown */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Review Appointment Summary
              </h3>
              <p className="text-xs text-slate-500">
                Please verify your consultation slot and review the fee transparency breakdown.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-600">Advocate:</span>
                <span className="font-bold text-slate-900">{lawyer.fullName} ({lawyer.sanadNumber})</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-600">Practice Area:</span>
                <span className="font-semibold text-slate-800">{selectedService}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-600">Date & Slot:</span>
                <span className="font-bold text-blue-950">{selectedDate} at {selectedSlot?.startTime} - {selectedSlot?.endTime} (IST)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-600">Consultation Mode:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {consultationMode.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Client Contact:</span>
                <span className="font-semibold text-slate-800">{clientName} ({clientPhone})</span>
              </div>
            </div>

            {/* Dynamic Unlock Fee Transparency Callout */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span className="text-xs font-bold text-emerald-950">
                    Platform Contact & Slot Unlock Fee
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-900" suppressHydrationWarning>₹{unlockFee}</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed" suppressHydrationWarning>
                Paying ₹{unlockFee} instantly reserves your appointment slot, reveals direct mobile & chamber coordinates, and sends your case briefing directly to the advocate.
              </p>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
