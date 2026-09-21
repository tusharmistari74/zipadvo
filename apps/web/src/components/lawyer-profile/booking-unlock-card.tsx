'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@legalhub/ui';
import {
  Lock,
  CheckCircle2,
  ArrowRight,
  Building,
} from 'lucide-react';
import { formatINR } from '@legalhub/utils';
import type { PublicLawyerProfile } from '../../lib/services/lawyer-profile.service';
import { usePlatformSettings } from '../../lib/hooks/use-platform-settings';
import { BookingModal } from '../booking/booking-modal';

interface BookingUnlockCardProps {
  profile: PublicLawyerProfile;
}

export function BookingUnlockCard({ profile }: BookingUnlockCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { unlockFee } = usePlatformSettings();
  const facilitationFee = unlockFee;

  return (
    <div className="space-y-4 sticky top-24">
      <Card className="border-blue-200 bg-white shadow-md overflow-hidden">
        {/* Card Header with Fee */}
        <CardHeader className="bg-slate-900 text-white p-5 space-y-1">
          <div className="flex items-center justify-between">
            <Badge variant="navy" className="bg-slate-800 text-blue-300 border-slate-700">
              Facilitation Unlock
            </Badge>
            <span className="font-serif text-2xl font-bold text-white">
              {formatINR(facilitationFee)}
            </span>
          </div>
          <CardTitle className="text-base font-bold text-white pt-1">
            Direct Contact & Chamber Booking
          </CardTitle>
          <p className="text-xs text-slate-300">
            One-time platform unlock fee. No broker markups.
          </p>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          {/* Benefits list */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Included with Unlock:
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Direct Advocate Details:</strong> Phone, WhatsApp, and Chamber location
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Encrypted Document Vault:</strong> Securely upload 7/12, Index II, Sale Deeds
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Consultation Scheduling:</strong> In-person chamber visit or video meeting
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Money-Back Guarantee:</strong> 100% refund if advocate is unresponsive &gt;24h
                </span>
              </li>
            </ul>
          </div>

          {/* Advocate Consultation Fee Guidance */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-900">
              <span>Advocate Consultation Fee:</span>
              <span>{formatINR(profile.consultationFeeInr)}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Agreed and paid directly to the advocate. Zero platform commission.
            </p>
          </div>

          {/* Primary Unlock CTA */}
          <div className="space-y-2">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => setIsModalOpen(true)}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="shadow-sm font-semibold bg-emerald-600 hover:bg-emerald-700 border-none"
            >
              Book & Unlock for {formatINR(facilitationFee)}
            </Button>
            <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
              <Lock className="h-3 w-3 text-slate-400" />
              Direct Mumbai advocate booking with instant slot lock
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Chamber Location & Directions Box */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Building className="h-4 w-4 text-slate-500" />
            <span>Chamber Location</span>
          </div>
          <p className="text-xs text-slate-700 font-medium">
            {profile.chamberAddress}
          </p>
          {profile.landmark && (
            <p className="text-[11px] text-slate-500">
              Landmark: {profile.landmark}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bar Council Regulatory Notice */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-[11px] text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">BCI Compliance Notice</p>
        <p className="leading-relaxed">
          ZipAdvo is a technology intermediary and not a law firm. Lawyer profiles are listed for factual reference in compliance with Bar Council of India Rule 36.
        </p>
      </div>

      {/* Booking Modal */}
      <BookingModal
        lawyer={profile}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

