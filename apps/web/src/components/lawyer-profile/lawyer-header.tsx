import React from 'react';
import { Card, CardContent, Badge, Rating, Avatar } from '@legalhub/ui';
import {
  ShieldCheck,
  MapPin,
  Scale,
  Languages,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import type { PublicLawyerProfile } from '../../lib/services/lawyer-profile.service';

interface LawyerHeaderProps {
  profile: PublicLawyerProfile;
}

export function LawyerHeader({ profile }: LawyerHeaderProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Top profile identity row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar
            src={profile.avatarUrl}
            name={profile.fullName}
            size="xl"
            className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-slate-900 text-white font-serif text-2xl sm:text-3xl font-bold shadow-md"
          />

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {profile.fullName}
              </h1>
              {profile.isSanadVerified && (
                <Badge variant="navy" className="bg-blue-50 text-blue-700 border-blue-200">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  Sanad Verified
                </Badge>
              )}
            </div>

            <p className="text-sm sm:text-base font-medium text-slate-700">
              {profile.title}
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-slate-600 pt-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <Rating value={profile.rating} size="sm" />
                <span>
                  {profile.rating.toFixed(1)}{' '}
                  <span className="font-normal text-slate-500">
                    ({profile.reviewCount} client reviews)
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-600">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>{profile.yearsOfExperience}+ Years Practice</span>
              </div>

              <div className="flex items-center gap-1 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>{profile.locality}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Credentials & Bar Enrollment Strip */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Bar Council Sanad
            </span>
            <span className="font-mono font-bold text-blue-800 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              {profile.sanadNumber}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {profile.barCouncilName} ({profile.enrollmentYear})
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Primary Court
            </span>
            <span className="font-semibold text-slate-900 flex items-center gap-1">
              <Scale className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{profile.primaryCourt}</span>
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              Appears in High Court & District Forums
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Languages Spoken
            </span>
            <span className="font-semibold text-slate-900 flex items-center gap-1">
              <Languages className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{profile.spokenLanguages.join(', ')}</span>
            </span>
            <span className="text-[11px] text-slate-500 block">
              Fluent in Regional & English Conveyance
            </span>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="pt-2 space-y-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Professional Summary
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
