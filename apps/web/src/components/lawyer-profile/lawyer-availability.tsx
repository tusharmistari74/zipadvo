import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@legalhub/ui';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { PublicLawyerProfile } from '../../lib/services/lawyer-profile.service';

interface LawyerAvailabilityProps {
  profile: PublicLawyerProfile;
}

export function LawyerAvailability({ profile }: LawyerAvailabilityProps) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-700" />
              Chamber & Consultation Schedule
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Weekly availability for chamber appointments and video consultations.
            </p>
          </div>
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
            Direct Scheduling
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
  );
}
