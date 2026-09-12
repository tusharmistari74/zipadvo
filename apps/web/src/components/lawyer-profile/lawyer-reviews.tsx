import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Rating, Badge } from '@legalhub/ui';
import { Star, ShieldCheck, MessageSquare } from 'lucide-react';
import { formatDate } from '@legalhub/utils';
import type { PublicLawyerProfile } from '../../lib/services/lawyer-profile.service';

interface LawyerReviewsProps {
  profile: PublicLawyerProfile;
}

export function LawyerReviews({ profile }: LawyerReviewsProps) {
  const { ratingBreakdown, reviews, rating, reviewCount } = profile;

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              Client Reviews & Verified Ratings
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Authentic feedback from clients who completed property consultations.
            </p>
          </div>
          <Badge variant="outline" className="bg-slate-50 text-slate-700">
            {reviewCount} Reviews
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Rating Summary & Histogram */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 rounded-xl bg-slate-50 border border-slate-100 items-center">
          {/* Average Score Box */}
          <div className="md:col-span-4 text-center md:border-r md:border-slate-200 md:pr-6 space-y-1.5">
            <div className="font-serif text-4xl sm:text-5xl font-bold text-slate-900">
              {rating.toFixed(1)}
            </div>
            <div className="flex justify-center">
              <Rating value={rating} size="md" />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Based on {reviewCount} verified ratings
            </p>
          </div>

          {/* Rating Distribution Histogram */}
          <div className="md:col-span-8 space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingBreakdown[stars as 1 | 2 | 3 | 4 | 5] || 0;
              const percentage = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;

              return (
                <div key={stars} className="flex items-center gap-2.5 text-xs">
                  <span className="w-7 font-bold text-slate-700 flex items-center gap-0.5">
                    {stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-500 text-[11px]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Verified Consultations
          </h3>

          {reviews.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center space-y-2">
              <MessageSquare className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-sm font-medium text-slate-700">No client reviews yet</p>
              <p className="text-xs text-slate-500">
                Reviews will appear here once clients complete consultations with this advocate.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {rev.clientDisplayName}
                      </span>
                      {rev.isVerifiedClient && (
                        <span className="inline-flex items-center rounded-sm bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                          <ShieldCheck className="h-3 w-3 mr-0.5" />
                          Verified Client
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Rating value={rev.rating} size="sm" />
                    {rev.reviewTitle && (
                      <span className="text-xs font-bold text-slate-800">
                        {rev.reviewTitle}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {rev.reviewComment}
                  </p>

                  {rev.serviceCategory && (
                    <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1">
                      <span className="font-medium text-slate-600">Service:</span>
                      <span>{rev.serviceCategory}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
