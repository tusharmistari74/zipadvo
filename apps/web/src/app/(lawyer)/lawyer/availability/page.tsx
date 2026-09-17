'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  Spinner,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@legalhub/ui';
import {
  Calendar,
  Clock,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Globe,
  Coffee,
  CalendarOff,
  ShieldCheck,
  ArrowLeft,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../../../../lib/auth/context';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';
import {
  getLawyerAvailabilityConfig,
  saveLawyerAvailabilityConfig,
  MUMBAI_TIMEZONE,
  DEFAULT_LAWYER_AVAILABILITY_CONFIG,
} from '../../../../lib/services/availability.service';
import type {
  LawyerAvailabilityConfig,
  BlockedDate,
  SpecialDateSchedule,
} from '@legalhub/types';
import { ClientBookingCalendar } from '../../../../components/booking/client-booking-calendar';

const DAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];


export default function LawyerAvailabilityPage() {
  const { user, role, isAuthenticated, isLoading: authLoading } = useAuth();

  const [config, setConfig] = useState<LawyerAvailabilityConfig>(DEFAULT_LAWYER_AVAILABILITY_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Blocked Date Input State
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');

  // New Special Date Input State
  const [newSpecialDate, setNewSpecialDate] = useState('');
  const [newSpecialStart, setNewSpecialStart] = useState('10:00');
  const [newSpecialEnd, setNewSpecialEnd] = useState('14:00');
  const [newSpecialNote, setNewSpecialNote] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('weekly');

  useEffect(() => {
    async function loadConfig() {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await getLawyerAvailabilityConfig(user.uid);
        setConfig(data);
      } catch {
        setConfig(DEFAULT_LAWYER_AVAILABILITY_CONFIG);
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      loadConfig();
    }
  }, [user?.uid, authLoading]);

  // Handler: Toggle Day Availability
  const handleToggleDay = (dayIdx: number) => {
    setConfig((prev) => {
      const updated = prev.weeklySchedule.map((day) => {
        if (day.dayOfWeek === dayIdx) {
          return { ...day, isAvailable: !day.isAvailable };
        }
        return day;
      });
      return { ...prev, weeklySchedule: updated };
    });
  };

  // Handler: Update Day Working Hours
  const handleUpdateDayHours = (dayIdx: number, field: 'startTime' | 'endTime', value: string) => {
    setConfig((prev) => {
      const updated = prev.weeklySchedule.map((day) => {
        if (day.dayOfWeek === dayIdx) {
          return { ...day, [field]: value };
        }
        return day;
      });
      return { ...prev, weeklySchedule: updated };
    });
  };

  // Handler: Add Lunch / Court Recess Break
  const handleAddBreak = (dayIdx: number) => {
    setConfig((prev) => {
      const updated = prev.weeklySchedule.map((day) => {
        if (day.dayOfWeek === dayIdx) {
          const newBreak = {
            id: `break-${Date.now()}`,
            label: 'Court Recess / Lunch',
            startTime: '13:00',
            endTime: '14:00',
          };
          return { ...day, breaks: [...day.breaks, newBreak] };
        }
        return day;
      });
      return { ...prev, weeklySchedule: updated };
    });
  };

  // Handler: Remove Break
  const handleRemoveBreak = (dayIdx: number, breakId: string) => {
    setConfig((prev) => {
      const updated = prev.weeklySchedule.map((day) => {
        if (day.dayOfWeek === dayIdx) {
          return { ...day, breaks: day.breaks.filter((b) => b.id !== breakId) };
        }
        return day;
      });
      return { ...prev, weeklySchedule: updated };
    });
  };

  // Handler: Add Blocked Date
  const handleAddBlockedDate = () => {
    if (!newBlockedDate || !newBlockedReason.trim()) {
      setErrorMessage('Please select a date and specify a reason for blocking.');
      return;
    }

    const newBlocked: BlockedDate = {
      id: `block-${Date.now()}`,
      date: newBlockedDate,
      reason: newBlockedReason.trim(),
      createdAt: new Date().toISOString(),
    };

    setConfig((prev) => ({
      ...prev,
      blockedDates: [...prev.blockedDates.filter((b) => b.date !== newBlockedDate), newBlocked],
    }));

    setNewBlockedDate('');
    setNewBlockedReason('');
    setErrorMessage(null);
  };

  // Handler: Remove Blocked Date
  const handleRemoveBlockedDate = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((b) => b.id !== id),
    }));
  };

  // Handler: Add Special Date
  const handleAddSpecialDate = () => {
    if (!newSpecialDate) {
      setErrorMessage('Please select a date for custom hours.');
      return;
    }

    const newSpecial: SpecialDateSchedule = {
      id: `special-${Date.now()}`,
      date: newSpecialDate,
      isAvailable: true,
      startTime: newSpecialStart,
      endTime: newSpecialEnd,
      note: newSpecialNote.trim() || 'Custom Chamber Hours',
    };

    setConfig((prev) => ({
      ...prev,
      specialDates: [...prev.specialDates.filter((s) => s.date !== newSpecialDate), newSpecial],
    }));

    setNewSpecialDate('');
    setNewSpecialNote('');
    setErrorMessage(null);
  };

  // Handler: Remove Special Date
  const handleRemoveSpecialDate = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      specialDates: prev.specialDates.filter((s) => s.id !== id),
    }));
  };

  // Save Config
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const lawyerId = user?.uid || 'lawyer-demo';
    const result = await saveLawyerAvailabilityConfig(lawyerId, config, user?.uid || 'lawyer-demo');

    setIsSaving(false);
    if (result.success) {
      setSuccessMessage('Chamber availability and booking slots schedule saved successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(result.error || 'Failed to save availability configuration.');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Spinner size="lg" className="mx-auto text-blue-900" />
            <p className="text-sm text-slate-500 font-medium">Loading availability schedule...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Authorization Check: Must be lawyer or admin
  if (isAuthenticated && role !== 'lawyer' && role !== 'admin' && role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 py-12">
          <Container className="max-w-md mx-auto">
            <Alert variant="error">
              <AlertCircle className="h-4 w-4 mr-2" />
              <div>
                <p className="font-bold">Access Restricted</p>
                <p className="text-xs">
                  This availability management portal is strictly for registered advocates.
                </p>
              </div>
            </Alert>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-10">
        <Container className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Link href="/lawyer" className="hover:text-blue-900 flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Lawyer Portal
                </Link>
                <span>/</span>
                <span className="text-slate-800 font-medium">Availability & Calendar</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
                <Calendar className="h-7 w-7 text-blue-900" />
                Working Hours & Booking Availability
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Configure your weekly chamber schedule, court recess breaks, and blocked vacation dates for Mumbai clients.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="navy" className="bg-blue-900/10 text-blue-950 border-blue-200 py-1.5 px-3">
                <Globe className="h-3.5 w-3.5 mr-1.5 text-blue-700" />
                {MUMBAI_TIMEZONE} (IST, UTC+5:30)
              </Badge>
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={isSaving}
                className="shadow-sm shadow-blue-900/20"
              >
                <Save className="h-4 w-4 mr-1.5" />
                Save Schedule
              </Button>
            </div>
          </div>

          {/* Alerts */}
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

          {/* Configuration Tabs */}
          <Tabs activeTab={activeTab} onChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-200/70 p-1 border border-slate-300/60 rounded-xl">
              <TabsTrigger value="weekly" className="text-xs font-semibold px-4 py-2">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                Weekly Schedule
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs font-semibold px-4 py-2">
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                Slot Settings
              </TabsTrigger>
              <TabsTrigger value="blocked" className="text-xs font-semibold px-4 py-2">
                <CalendarOff className="h-3.5 w-3.5 mr-1.5" />
                Blocked Dates ({config.blockedDates.length})
              </TabsTrigger>
              <TabsTrigger value="special" className="text-xs font-semibold px-4 py-2">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Special Overrides ({config.specialDates.length})
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs font-semibold px-4 py-2">
                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                Client Calendar Preview
              </TabsTrigger>
            </TabsList>


            {/* Tab 1: Weekly Schedule */}
            <TabsContent value="weekly" className="space-y-4">
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">
                    Weekly Working Days & Court Recess Breaks
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Toggle active consultation days and set chamber consultation hours in 24-hour format (e.g. 10:00 to 19:00).
                  </p>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 divide-y divide-slate-100">
                  {config.weeklySchedule.map((day) => (
                    <div key={day.dayOfWeek} className="py-4 first:pt-0 last:pb-0 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleDay(day.dayOfWeek)}
                            className={`h-6 w-11 rounded-full transition-colors relative cursor-pointer ${
                              day.isAvailable ? 'bg-blue-900' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`h-4 w-4 rounded-full bg-white absolute top-1 transition-transform ${
                                day.isAvailable ? 'left-6' : 'left-1'
                              }`}
                            />
                          </button>
                          <div>
                            <span className="text-sm font-bold text-slate-900">
                              {DAY_LABELS[day.dayOfWeek]}
                            </span>
                            <span className={`text-xs ml-2 font-medium ${day.isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {day.isAvailable ? 'Chamber Open' : 'Closed'}
                            </span>
                          </div>
                        </div>

                        {day.isAvailable && (
                          <div className="flex items-center gap-3 pl-14 sm:pl-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-500 font-medium">From</span>
                              <input
                                type="time"
                                value={day.startTime}
                                onChange={(e) => handleUpdateDayHours(day.dayOfWeek, 'startTime', e.target.value)}
                                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-white shadow-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-500 font-medium">To</span>
                              <input
                                type="time"
                                value={day.endTime}
                                onChange={(e) => handleUpdateDayHours(day.dayOfWeek, 'endTime', e.target.value)}
                                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-white shadow-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddBreak(day.dayOfWeek)}
                              className="text-xs text-slate-600 hover:text-blue-900"
                            >
                              <Coffee className="h-3.5 w-3.5 mr-1 text-amber-600" />
                              Add Recess / Break
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Breaks List */}
                      {day.isAvailable && day.breaks.length > 0 && (
                        <div className="pl-14 space-y-2">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Breaks & Recess (Unavailable for booking)
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {day.breaks.map((b) => (
                              <div
                                key={b.id}
                                className="inline-flex items-center gap-2 bg-amber-50/70 border border-amber-200/80 rounded-lg px-3 py-1 text-xs text-amber-900"
                              >
                                <Coffee className="h-3 w-3 text-amber-600" />
                                <span className="font-semibold">{b.label}:</span>
                                <span>{b.startTime} - {b.endTime}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBreak(day.dayOfWeek, b.id)}
                                  className="text-amber-700 hover:text-red-700 ml-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Slot Settings */}
            <TabsContent value="settings" className="space-y-4">
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">
                    Consultation Duration & Advance Booking Rules
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Fine-tune how client appointments are sliced and how far in advance clients can schedule.
                  </p>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Consultation Slot Duration
                      </label>
                      <select
                        value={config.slotDurationMinutes}
                        onChange={(e) => setConfig({ ...config, slotDurationMinutes: Number(e.target.value) })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        <option value={30}>30 Minutes (Express Consultation)</option>
                        <option value={45}>45 Minutes (Standard Review)</option>
                        <option value={60}>60 Minutes (Comprehensive Consultation - Recommended)</option>
                        <option value={90}>90 Minutes (Deep Due Diligence & Document Review)</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-1">
                        Each booking slot will be generated with this exact duration.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Buffer Between Consultations
                      </label>
                      <select
                        value={config.bufferMinutes}
                        onChange={(e) => setConfig({ ...config, bufferMinutes: Number(e.target.value) })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        <option value={0}>0 Minutes (Back-to-back)</option>
                        <option value={10}>10 Minutes transition buffer</option>
                        <option value={15}>15 Minutes buffer (Recommended)</option>
                        <option value={30}>30 Minutes buffer</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-1">
                        Rest period between successive client consultations.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Advance Booking Limit
                      </label>
                      <select
                        value={config.advanceBookingDays}
                        onChange={(e) => setConfig({ ...config, advanceBookingDays: Number(e.target.value) })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        <option value={7}>7 Days in advance</option>
                        <option value={14}>14 Days in advance (2 Weeks)</option>
                        <option value={30}>30 Days in advance (1 Month - Recommended)</option>
                        <option value={60}>60 Days in advance (2 Months)</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-1">
                        Clients will not be able to schedule beyond this window.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Minimum Booking Notice
                      </label>
                      <select
                        value={config.minimumNoticeHours}
                        onChange={(e) => setConfig({ ...config, minimumNoticeHours: Number(e.target.value) })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        <option value={1}>1 Hour before slot start</option>
                        <option value={2}>2 Hours notice (Recommended)</option>
                        <option value={4}>4 Hours notice</option>
                        <option value={24}>24 Hours (Next-day bookings only)</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-1">
                        Prevents last-minute sudden bookings without preparation time.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Blocked Dates */}
            <TabsContent value="blocked" className="space-y-4">
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">
                    Court Vacations, Holidays & Personal Leave
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Block specific calendar dates so clients cannot book appointments during Bombay High Court vacations or chamber leave.
                  </p>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-6">
                  {/* Add Blocked Date Form */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Add Blocked Date
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <input
                          type="date"
                          value={newBlockedDate}
                          onChange={(e) => setNewBlockedDate(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2 flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Bombay High Court Diwali Recess / Personal Leave"
                          value={newBlockedReason}
                          onChange={(e) => setNewBlockedReason(e.target.value)}
                          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                        />
                        <Button variant="primary" size="sm" onClick={handleAddBlockedDate} className="shrink-0">
                          <Plus className="h-4 w-4 mr-1" />
                          Block Date
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Blocked Dates Roster */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Configured Blocked Dates ({config.blockedDates.length})
                    </span>

                    {config.blockedDates.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">
                        No blocked dates configured.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                        {config.blockedDates.map((item) => (
                          <div key={item.id} className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                              <CalendarOff className="h-4 w-4 text-red-500 shrink-0" />
                              <div>
                                <span className="text-xs font-bold text-slate-900 block">
                                  {item.date}
                                </span>
                                <span className="text-xs text-slate-600">
                                  {item.reason}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveBlockedDate(item.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 h-8 px-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Special Overrides */}
            <TabsContent value="special" className="space-y-4">
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">
                    Special Date Overrides (Custom Working Hours)
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Set unique hours for a specific date (e.g. half-day Saturday or special holiday evening session).
                  </p>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-6">
                  {/* Add Special Date Form */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Add Custom Date Hours
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <input
                          type="date"
                          value={newSpecialDate}
                          onChange={(e) => setNewSpecialDate(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="time"
                          value={newSpecialStart}
                          onChange={(e) => setNewSpecialStart(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="time"
                          value={newSpecialEnd}
                          onChange={(e) => setNewSpecialEnd(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <Button variant="primary" size="sm" onClick={handleAddSpecialDate} className="w-full h-9">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Override
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Special Overrides List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Configured Special Overrides ({config.specialDates.length})
                    </span>

                    {config.specialDates.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">
                        No special date overrides set.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                        {config.specialDates.map((item) => (
                          <div key={item.id} className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50">
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">
                                {item.date} ({item.startTime} - {item.endTime})
                              </span>
                              <span className="text-xs text-slate-500">
                                {item.note || 'Custom hours'}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSpecialDate(item.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 h-8 px-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 5: Client Calendar Preview */}
            <TabsContent value="preview" className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-800 shrink-0" />
                <span>
                  <strong>Interactive Live Preview:</strong> This is how your consultation schedule and slots appear to property buyers and clients on your profile.
                </span>
              </div>
              <ClientBookingCalendar
                lawyerName={user?.displayName || 'Advocate Profile'}
                config={config}
              />
            </TabsContent>
          </Tabs>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
