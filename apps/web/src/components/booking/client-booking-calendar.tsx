'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Alert } from '@legalhub/ui';
import {
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import type { LawyerAvailabilityConfig, TimeSlotItem } from '@legalhub/types';
import {
  generateDateRangeAvailability,
  getIsoDateInIST,
  MUMBAI_TIMEZONE,
} from '../../lib/services/availability.service';
import { formatINR } from '@legalhub/utils';
import { usePlatformSettings } from '../../lib/hooks/use-platform-settings';

interface ClientBookingCalendarProps {
  lawyerName: string;
  config: LawyerAvailabilityConfig;
  consultationFeeInr?: number;
  existingBookings?: Array<{ preferredDate: string; preferredTimeSlot: string; status: string }>;
  selectedDate?: string;
  selectedSlotId?: string;
  onSelectSlot?: (date: string, slot: TimeSlotItem) => void;
}

export function ClientBookingCalendar({
  lawyerName,
  config,
  consultationFeeInr = 1500,
  existingBookings = [],
  selectedDate: initialSelectedDate,
  selectedSlotId: initialSelectedSlotId,
  onSelectSlot,
}: ClientBookingCalendarProps) {
  const { unlockFee } = usePlatformSettings();
  const todayIST = useMemo(() => getIsoDateInIST(), []);
  const [selectedDate, setSelectedDate] = useState<string>(initialSelectedDate || todayIST);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotItem | null>(null);

  // Generate availability summaries for the next 14 days
  const dateSummaries = useMemo(() => {
    return generateDateRangeAvailability(config, 14, existingBookings);
  }, [config, existingBookings]);

  // Current selected day's summary
  const currentDaySummary = useMemo(() => {
    return dateSummaries.find((s) => s.date === selectedDate) || dateSummaries[0];
  }, [dateSummaries, selectedDate]);

  // Group slots into Morning (before 12:00), Afternoon (12:00 - 17:00), Evening (17:00+)
  const slotGroups = useMemo(() => {
    if (!currentDaySummary || !currentDaySummary.slots) {
      return { morning: [], afternoon: [], evening: [] };
    }

    const morning: TimeSlotItem[] = [];
    const afternoon: TimeSlotItem[] = [];
    const evening: TimeSlotItem[] = [];

    currentDaySummary.slots.forEach((slot) => {
      const hour = parseInt(slot.startTime.split(':')[0] || '0', 10);
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  }, [currentDaySummary]);


  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlotItem) => {
    if (!slot.isAvailable) return;
    setSelectedSlot(slot);
    if (onSelectSlot) {
      onSelectSlot(selectedDate, slot);
    }
  };

  const formatSlotDisplay = (startTime: string, endTime: string) => {
    const formatTime12 = (t: string) => {
      const parts = t.split(':').map(Number);
      const h = parts[0] ?? 0;
      const m = parts[1] ?? 0;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
    };
    return `${formatTime12(startTime)} - ${formatTime12(endTime)}`;
  };

  const formatDateHeader = (dateStr: string) => {
    const parts = dateStr.split('-').map(Number);
    const y = parts[0] ?? 2026;
    const m = parts[1] ?? 1;
    const d = parts[2] ?? 1;
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-700" />
              Select Consultation Slot
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct chamber appointment & video consultation with {lawyerName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white text-slate-700 border-slate-300 text-[11px] font-medium">
              <Clock className="h-3 w-3 mr-1 text-blue-600" />
              {MUMBAI_TIMEZONE} (IST)
            </Badge>
            <Badge variant="navy" className="bg-blue-50 text-blue-800 border-blue-200 text-[11px]">
              {config.slotDurationMinutes} min slot
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Date Selector Carousel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Available Dates (Next 14 Days)
            </span>
            <span className="text-xs text-slate-500">
              {formatDateHeader(selectedDate)}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
            {dateSummaries.map((summary) => {
              const parts = summary.date.split('-').map(Number);
              const y = parts[0] ?? 2026;
              const m = parts[1] ?? 1;
              const d = parts[2] ?? 1;
              const dateObj = new Date(Date.UTC(y, m - 1, d));
              const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' });
              const dayNumber = dateObj.getUTCDate();
              const isSelected = summary.date === selectedDate;
              const isToday = summary.date === todayIST;


              return (
                <button
                  key={summary.date}
                  type="button"
                  onClick={() => handleDateSelect(summary.date)}
                  className={`flex flex-col items-center justify-center min-w-[64px] sm:min-w-[72px] py-2.5 px-2 rounded-xl border transition-all text-center shrink-0 ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900 shadow-sm shadow-blue-900/20'
                      : summary.isBlocked
                      ? 'bg-red-50/50 border-red-200 text-slate-400 opacity-80 hover:border-red-300'
                      : !summary.isWorkingDay
                      ? 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/30'
                  }`}
                >
                  <span className={`text-[11px] font-medium uppercase ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                    {dayName}
                  </span>
                  <span className="text-base sm:text-lg font-bold my-0.5">
                    {dayNumber}
                  </span>
                  {isToday ? (
                    <span className={`text-[9px] font-bold px-1 rounded ${isSelected ? 'bg-blue-800 text-white' : 'text-blue-600'}`}>
                      Today
                    </span>
                  ) : summary.isBlocked ? (
                    <span className="text-[9px] text-red-500 font-medium">Off</span>
                  ) : !summary.isWorkingDay ? (
                    <span className="text-[9px] text-slate-400">Closed</span>
                  ) : (
                    <span className={`text-[9px] font-semibold ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`}>
                      {summary.availableSlotCount} open
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots Area */}
        {currentDaySummary?.isBlocked ? (
          <Alert variant="warning" className="bg-amber-50/70 border-amber-200 text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 mr-2 shrink-0" />
            <div>
              <p className="font-semibold text-xs sm:text-sm">Chambers Unavailable on this Date</p>
              <p className="text-xs text-amber-800 mt-0.5">
                {currentDaySummary.blockedReason || 'Lawyer is on leave or observing court recess.'} Please select another available date.
              </p>
            </div>
          </Alert>
        ) : !currentDaySummary?.isWorkingDay ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Clock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Chamber Closed</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Advocate does not take consultations on this day of the week. Please select a working weekday or Saturday.
            </p>
          </div>
        ) : currentDaySummary.availableSlotCount === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">All Slots Fully Booked</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              All consultation slots for this date have been reserved. Please choose the next available working date.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Morning Slots */}
            {slotGroups.morning.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  Morning Slots (Before 12:00 PM)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {slotGroups.morning.map((slot) => renderSlotButton(slot))}
                </div>
              </div>
            )}

            {/* Afternoon Slots */}
            {slotGroups.afternoon.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Sunset className="h-3.5 w-3.5 text-orange-500" />
                  Afternoon Slots (12:00 PM - 05:00 PM)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {slotGroups.afternoon.map((slot) => renderSlotButton(slot))}
                </div>
              </div>
            )}

            {/* Evening Slots */}
            {slotGroups.evening.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Moon className="h-3.5 w-3.5 text-indigo-500" />
                  Evening Slots (05:00 PM onwards)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {slotGroups.evening.map((slot) => renderSlotButton(slot))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected Slot Confirmation Footer */}
        {selectedSlot && (
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Selected Appointment Slot:</p>
                <p className="text-sm font-bold text-blue-950">
                  {formatDateHeader(selectedDate)} at {formatSlotDisplay(selectedSlot.startTime, selectedSlot.endTime)}
                </p>
                <p className="text-[11px] text-blue-700 mt-0.5" suppressHydrationWarning>
                  Regular Consultation Fee: {formatINR(consultationFeeInr)} (Unlocked for ₹{unlockFee})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Badge variant="navy" className="bg-emerald-600 text-white border-none py-1 px-3 text-xs">
                Slot Available
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  function renderSlotButton(slot: TimeSlotItem) {
    const isSelected = selectedSlot?.id === slot.id || initialSelectedSlotId === slot.id;

    if (!slot.isAvailable) {
      return (
        <div
          key={slot.id}
          className="py-2.5 px-3 rounded-lg border border-slate-200 bg-slate-50/80 text-slate-400 text-xs flex items-center justify-between cursor-not-allowed select-none"
        >
          <span className="line-through">{formatSlotDisplay(slot.startTime, slot.endTime)}</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
            {slot.reason === 'booked'
              ? 'Booked'
              : slot.reason === 'break'
              ? slot.breakLabel || 'Recess'
              : slot.reason === 'past'
              ? 'Past'
              : 'Unavailable'}
          </span>
        </div>
      );
    }

    return (
      <button
        key={slot.id}
        type="button"
        onClick={() => handleSlotSelect(slot)}
        className={`py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
          isSelected
            ? 'bg-blue-900 text-white border-blue-900 shadow-sm ring-2 ring-blue-900/20'
            : 'bg-white text-slate-800 border-slate-200 hover:border-blue-500 hover:bg-blue-50/40'
        }`}
      >
        <span>{formatSlotDisplay(slot.startTime, slot.endTime)}</span>
        <span
          className={`h-2 w-2 rounded-full ${
            isSelected ? 'bg-emerald-400' : 'bg-emerald-500'
          }`}
        />
      </button>
    );
  }
}
