'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Container,
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Alert,
} from '@legalhub/ui';
import {
  Save,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../../../lib/auth/context';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';
import { LawyerPortalNav } from '../../../../components/lawyer/lawyer-portal-nav';
import { practiceAreasEnum, mumbaiCourtsEnum } from '@legalhub/validation';
import type { PracticeArea, MumbaiCourt } from '@legalhub/types';

export default function LawyerProfileEditPage() {
  const { user, profile } = useAuth();

  const [title, setTitle] = useState('Senior Property & Conveyancing Advocate');
  const [bio, setBio] = useState(
    'Over 14 years of specialized real estate practice in Mumbai City and Suburban districts. Extensive experience conducting comprehensive 30-year title investigations, drafting development agreements, and handling complex deemed conveyance matters before the Competent Authority.'
  );
  const [primaryCourt, setPrimaryCourt] = useState<MumbaiCourt>('Bombay High Court');
  const [consultationFeeInr, setConsultationFeeInr] = useState(1500);
  const [selectedAreas, setSelectedAreas] = useState<PracticeArea[]>([
    'Property Registration & Conveyancing',
    'Title Verification & Due Diligence',
    'RERA Advisory & Disputes',
    'Society Matters & Redevelopment',
  ]);
  const [chamberAddress, setChamberAddress] = useState(
    '402, Examiner Press Building, Dalal Street, Fort, Mumbai 400001'
  );
  const [isAcceptingBookings, setIsAcceptingBookings] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const togglePracticeArea = (area: PracticeArea) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Simulate profile update save
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSuccessMessage('Chamber profile & consultation details updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch {
      setErrorMessage('Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <LawyerPortalNav />

      <main className="py-8">
        <Container className="max-w-4xl">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="navy" className="text-xs">
                  Public Profile Editor
                </Badge>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  MAH/4821/2012 Verified
                </Badge>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Advocate Chamber Profile & Fees
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Update your public profile, practice areas, consultation fee, and chamber address on ZipAdvo.
              </p>
            </div>

            <Link href={user ? `/lawyers/${user.uid}` : '/lawyers/lawyer-1'} target="_blank">
              <Button variant="outline" size="sm" leftIcon={<ExternalLink className="h-4 w-4" />}>
                View Public Profile
              </Button>
            </Link>
          </div>

          {successMessage && (
            <Alert variant="success" className="mb-6">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <span>{successMessage}</span>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="error" className="mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{errorMessage}</span>
            </Alert>
          )}

          <form onSubmit={handleSave}>
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Full Name & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Advocate Name
                    </label>
                    <Input
                      disabled
                      value={profile?.fullName || 'Adv. Rajeshwar M. Deshmukh'}
                      className="bg-slate-50 text-slate-600"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Name is locked to Bar Council Sanad records.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Professional Title *
                    </label>
                    <Input
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Property & Conveyancing Advocate"
                    />
                  </div>
                </div>

                {/* Professional Bio */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Professional Summary & Practice Experience *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Primary Court & Fee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Primary Court Jurisdiction *
                    </label>
                    <select
                      value={primaryCourt}
                      onChange={(e) => setPrimaryCourt(e.target.value as MumbaiCourt)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-blue-600 focus:outline-none"
                    >
                      {mumbaiCourtsEnum.options.map((court) => (
                        <option key={court} value={court}>
                          {court}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Standard Consultation Fee (₹ INR) *
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={50000}
                      required
                      value={consultationFeeInr}
                      onChange={(e) => setConsultationFeeInr(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Chamber Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chamber / Office Address in Mumbai *
                  </label>
                  <Input
                    required
                    value={chamberAddress}
                    onChange={(e) => setChamberAddress(e.target.value)}
                    placeholder="Chamber Suite, Building Name, Street, Locality, Pincode"
                  />
                </div>

                {/* Practice Areas Checklist */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Core Practice Specializations ({selectedAreas.length} selected)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {practiceAreasEnum.options.map((area) => {
                      const isSelected = selectedAreas.includes(area);
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => togglePracticeArea(area)}
                          className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-semibold'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span>{area}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accept Bookings Toggle */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Accept Online Booking Requests</h4>
                    <p className="text-[11px] text-slate-500">
                      When enabled, clients can schedule consultations directly on your profile.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAcceptingBookings}
                    onChange={(e) => setIsAcceptingBookings(e.target.checked)}
                    className="h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSaving}
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
