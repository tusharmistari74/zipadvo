'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Card,
  CardContent,
  Badge,
  Button,
  Spinner,
  StatusBadge,
} from '@legalhub/ui';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../../../lib/auth/context';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';
import { LawyerPortalNav } from '../../../../components/lawyer/lawyer-portal-nav';
import { getLawyerBookings } from '../../../../lib/services/lawyer-dashboard.service';
import type { Booking } from '@legalhub/types';

export default function LawyerCalendarPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]!
  );

  const lawyerUid = user?.uid || 'lawyer-1';

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await getLawyerBookings(lawyerUid);
        if (res.success) setBookings(res.bookings);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [lawyerUid]);

  // Day's appointments
  const dateAppointments = bookings.filter(
    (b) => b.preferredDate === selectedDate && b.status !== 'cancelled'
  );

  // Time Slots for Day View
  const HOURS = [
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ];

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]!);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]!);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]!);
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <LawyerPortalNav />

      <main className="py-8">
        <Container className="max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Advocate Practice Calendar & Schedule
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Daily agenda, Bombay High Court appearances, and client consultation appointment slots.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/lawyer/availability">
                <Button variant="outline" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
                  Working Hours & Rules
                </Button>
              </Link>
            </div>
          </div>

          {/* Calendar Toolbar */}
          <Card className="border-slate-200 bg-white shadow-xs mb-6">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleToday} className="text-xs">
                  Today
                </Button>
                <button
                  type="button"
                  onClick={handlePrevDay}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  aria-label="Previous day"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextDay}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  aria-label="Next day"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="font-serif font-bold text-slate-900 text-base sm:text-lg ml-2">
                  {new Date(selectedDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Day View Agenda */}
          {isLoading ? (
            <div className="py-20 text-center">
              <Spinner size="lg" className="mx-auto text-blue-700" />
            </div>
          ) : (
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-6">
                <div className="divide-y divide-slate-100">
                  {HOURS.map((hour) => {
                    const matchedBookings = dateAppointments.filter((b) =>
                      b.preferredTimeSlot.startsWith(hour)
                    );

                    return (
                      <div key={hour} className="py-3 flex items-start gap-4 min-h-[60px]">
                        <span className="w-16 text-xs font-mono font-bold text-slate-400 shrink-0 pt-1">
                          {hour}
                        </span>

                        <div className="flex-1 space-y-2">
                          {matchedBookings.length > 0 ? (
                            matchedBookings.map((b) => (
                              <div
                                key={b.id}
                                className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-blue-950">
                                      {b.clientName}
                                    </span>
                                    <StatusBadge status={b.status} />
                                    <Badge variant="outline" className="text-[10px] bg-white">
                                      {b.preferredTimeSlot}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-blue-900 font-medium mt-0.5">
                                    {b.serviceCategory}
                                  </p>
                                </div>

                                <Link href="/lawyer/bookings">
                                  <Button variant="outline" size="sm" className="bg-white text-xs">
                                    Manage Case
                                  </Button>
                                </Link>
                              </div>
                            ))
                          ) : (
                            <div className="h-full flex items-center">
                              <span className="text-[11px] text-slate-300 italic">
                                Available consultation slot
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
