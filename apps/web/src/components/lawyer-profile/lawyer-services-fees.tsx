import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@legalhub/ui';
import { FileCheck, Clock, FileText, ShieldAlert } from 'lucide-react';
import { formatINR } from '@legalhub/utils';
import type { PublicLawyerProfile } from '../../lib/services/lawyer-profile.service';

interface LawyerServicesFeesProps {
  profile: PublicLawyerProfile;
}

export function LawyerServicesFees({ profile }: LawyerServicesFeesProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">
              Practice Specializations & Services
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Core legal expertise and indicative service fee structures.
            </p>
          </div>
          <Badge variant="outline" className="bg-slate-50 text-slate-700">
            {profile.practiceAreas.length} Specializations
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Practice Area Badges */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Core Practice Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.practiceAreas.map((area, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-lg bg-blue-50/70 border border-blue-100 px-3 py-1.5 text-xs font-medium text-blue-900"
              >
                <FileCheck className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Detailed Service Cards & Fee Estimates */}
        {profile.services && profile.services.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Indicative Service Offerings & Fee Guidance
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {profile.services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-colors space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-700 shrink-0" />
                      <h4 className="text-sm font-bold text-slate-900">{service.name}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center text-slate-500">
                        <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        {service.durationEstimate}
                      </span>
                      <span className="font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                        {formatINR(service.indicativeFeeInr)}*
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fee Disclaimer Note */}
        <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            *Indicative fee estimates are governed by matter complexity, number of property survey numbers, and title history.
            Advocates confirm exact professional fees directly with clients following initial document review.
            ZipAdvo takes zero commission from advocate fees.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
