'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@legalhub/ui';
import { Calendar, Clock, CheckCircle2, XCircle, CalendarDays } from 'lucide-react';
import type { PublicLawyerProfile } from '../../lib/services/lawyer-profile.service';
import { ClientBookingCalendar } from '../booking/client-booking-calendar';
import { DEFAULT_LAWYER_AVAILABILITY_CONFIG } from '../../lib/services/availability.service';
import type { TimeSlotItem } from '@legalhub/types';

interface LawyerAvailabilityProps {
  profile: PublicLawyerProfile;
}

export function LawyerAvailability({ profile }: LawyerAvailabilityProps) {
  const [showLiveCalendar, setShowLiveCalendar] = useState(false);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<{ date: string; slot: TimeSlotItem } | null>(null);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const config = {
    ...DEFAULT_LAWYER_AVAILABILITY_CONFIG,
    weeklySchedule: DEFAULT_LAWYER_AVAILABILITY_CONFIG.weeklySchedule.map((day) => {
      const match = profile.availabilitySchedule.find((s) => s.dayOfWeek === day.dayOfWeek);
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
    setSelectedSlotInfo({ date, slot });
  };

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-700" />
                Chamber & Consultation Schedule
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Weekly availability for chamber appointments and video consultations in Mumbai.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showLiveCalendar ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setShowLiveCalendar(!showLiveCalendar)}
                className="text-xs font-semibold flex items-center gap-1.5"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {showLiveCalendar ? 'Hide Live Calendar' : 'View Booking Slots'}
              </Button>
              {profile.isAcceptingBookings ? (
                <Badge variant="navy" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  Accepting Inquiries
                </Badge>
              ) : (
                <Badge variant="outline" className="text-slate-500">
                  Slots Temporarily Full
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Next Available Slot Callout */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <Clock className="h-4 w-4 text-blue-700 shrink-0" />
              <span className="text-slate-700">Next Available Consultation:</span>
              <span className="font-bold text-blue-950">{profile.nextAvailableSlot}</span>
            </div>
            <span className="text-[11px] text-blue-700 font-medium hidden sm:inline">
              Asia/Kolkata (IST)
            </span>
          </div>

          {/* Weekly Schedule Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2">
            {[1, 2, 3, 4, 5, 6].map((dayIdx) => {
              const slot = profile.availabilitySchedule.find((s) => s.dayOfWeek === dayIdx);
              const isAvailable = slot?.isAvailable ?? false;

              return (
                <div
                  key={dayIdx}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    isAvailable
                      ? 'bg-slate-50/60 border-slate-200'
                      : 'bg-slate-50/20 border-slate-100 opacity-60'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block mb-1">
                    {dayNames[dayIdx]}
                  </span>
                  {isAvailable ? (
                    <div className="space-y-1">
                      <span className="inline-flex items-center text-[11px] text-emerald-700 font-medium">
                        <CheckCircle2 className="h-3 w-3 mr-0.5 text-emerald-600" />
                        Open
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {slot?.startTime} - {slot?.endTime}
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center text-[11px] text-slate-400">
                      <XCircle className="h-3 w-3 mr-0.5 text-slate-300" />
                      Closed
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 pt-1">
            * Exact consultation slot and mode (In-person chamber visit or secure video consult) is confirmed directly with the advocate upon booking unlock.
          </p>
        </CardContent>
      </Card>

      {/* Expandable Live Interactive Calendar */}
      {showLiveCalendar && (
        <div className="pt-2 animate-in fade-in duration-300 space-y-3">
          <ClientBookingCalendar
            lawyerName={profile.fullName}
            config={config}
            consultationFeeInr={profile.consultationFeeInr}
            onSelectSlot={handleSelectSlot}
          />
          {selectedSlotInfo && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
              <span className="font-semibold">
                Selected for consultation: {selectedSlotInfo.date} ({selectedSlotInfo.slot.startTime} - {selectedSlotInfo.slot.endTime})
              </span>
              <Badge variant="navy" className="bg-emerald-700 text-white text-[10px]">
                Ready to Proceed
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


