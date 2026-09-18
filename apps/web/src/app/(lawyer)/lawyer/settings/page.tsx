'use client';

import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Button,
  Alert,
} from '@legalhub/ui';
import {
  Bell,
  Calendar,
  Save,
  CheckCircle2,
  Smartphone,
  Mail,
} from 'lucide-react';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';
import { LawyerPortalNav } from '../../../../components/lawyer/lawyer-portal-nav';

export default function LawyerSettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);
  const [allowVideoConsultations, setAllowVideoConsultations] = useState(true);
  const [allowOfficeConsultations, setAllowOfficeConsultations] = useState(true);
  const [slotBufferMinutes, setSlotBufferMinutes] = useState(15);
  const [minimumAdvanceHours, setMinimumAdvanceHours] = useState(4);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <LawyerPortalNav />

      <main className="py-8">
        <Container className="max-w-4xl">
          <div className="mb-6">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Practice & Notification Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configure notification channels, consultation preferences, and appointment buffers.
            </p>
          </div>

          {savedSuccess && (
            <Alert variant="success" className="mb-6">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <span>Practice settings successfully updated.</span>
            </Alert>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Notification Channels */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">Notification Alerts</h2>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Email Notifications</h4>
                      <p className="text-[11px] text-slate-500">
                        Receive instant emails for new booking requests and payments.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-slate-500" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">SMS / WhatsApp Reminders</h4>
                      <p className="text-[11px] text-slate-500">
                        Receive appointment reminder alerts via SMS before consultations.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsNotifs}
                    onChange={(e) => setSmsNotifs(e.target.checked)}
                    className="h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-slate-500" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">In-App Notification Feed</h4>
                      <p className="text-[11px] text-slate-500">
                        Show badge counters and popover notifications in the header.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={inAppNotifs}
                    onChange={(e) => setInAppNotifs(e.target.checked)}
                    className="h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Consultation Preferences */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">Booking Constraints & Buffers</h2>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Buffer Between Consultation Slots (Minutes)
                    </label>
                    <select
                      value={slotBufferMinutes}
                      onChange={(e) => setSlotBufferMinutes(parseInt(e.target.value))}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    >
                      <option value={0}>0 minutes (Back-to-back)</option>
                      <option value={15}>15 minutes (Recommended)</option>
                      <option value={30}>30 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Minimum Notice for Bookings (Hours)
                    </label>
                    <select
                      value={minimumAdvanceHours}
                      onChange={(e) => setMinimumAdvanceHours(parseInt(e.target.value))}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    >
                      <option value={2}>2 hours</option>
                      <option value={4}>4 hours</option>
                      <option value={24}>24 hours</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Enable In-Person Chamber Consultations</h4>
                      <p className="text-[11px] text-slate-500">Allow clients to meet at your registered chamber address in Mumbai.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowOfficeConsultations}
                      onChange={(e) => setAllowOfficeConsultations(e.target.checked)}
                      className="h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Enable Video Consultations</h4>
                      <p className="text-[11px] text-slate-500">Allow remote video consultations via secure meeting link.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowVideoConsultations}
                      onChange={(e) => setAllowVideoConsultations(e.target.checked)}
                      className="h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Practice Settings
              </Button>
            </div>
          </form>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
