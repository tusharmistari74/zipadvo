'use client';

import React, { useState } from 'react';
import type { LawyerReview, AggregateRatingSummary } from '@legalhub/types';

interface ReviewModalProps {
  bookingId: string;
  lawyerName: string;
  serviceCategory?: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: (review: LawyerReview, aggregate?: AggregateRatingSummary) => void;
}

export function ReviewModal({
  bookingId,
  lawyerName,
  serviceCategory,
  isOpen,
  onClose,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMessage(null);

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          rating,
          reviewTitle: reviewTitle.trim() || undefined,
          reviewComment: reviewComment.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setIsSuccess(true);
      if (onReviewSubmitted && data.review) {
        onReviewSubmitted(data.review, data.aggregateSummary);
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Verified Consultation Review
            </span>
            <h3 className="text-lg font-bold text-white mt-1">Rate Your Consultation</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg transition"
          >
            ✕
          </button>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-0.5">
          <div>
            <strong className="text-slate-300">Advocate:</strong> {lawyerName}
          </div>
          {serviceCategory && (
            <div>
              <strong className="text-slate-300">Service:</strong> {serviceCategory}
            </div>
          )}
          <div>
            <strong className="text-slate-300">Booking:</strong> <span className="font-mono text-amber-400">{bookingId}</span>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center space-y-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <div className="text-3xl">⭐</div>
            <h4 className="text-base font-bold text-emerald-300">Thank you for your review!</h4>
            <p className="text-xs text-emerald-400/80">
              Your verified review helps Mumbai property clients make informed legal decisions.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating Selector */}
            <div className="text-center py-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Overall Experience Rating *
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="text-3xl transition-transform hover:scale-125 focus:outline-none"
                    >
                      <span className={active ? 'text-amber-400' : 'text-slate-600'}>
                        ★
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="text-xs text-amber-400/90 font-semibold mt-1">
                {rating === 5 && 'Excellent (5/5)'}
                {rating === 4 && 'Very Good (4/5)'}
                {rating === 3 && 'Average (3/5)'}
                {rating === 2 && 'Needs Improvement (2/5)'}
                {rating === 1 && 'Unsatisfactory (1/5)'}
              </div>
            </div>

            {/* Optional Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Review Headline (Optional)
              </label>
              <input
                type="text"
                maxLength={100}
                placeholder="e.g., Extremely knowledgeable on Bandra redevelopment..."
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Optional Comment */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Detailed Feedback (Optional)
                </label>
                <span className="text-[10px] text-slate-500">
                  {reviewComment.length}/1000
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={1000}
                placeholder="Describe the consultation quality, advice clarity, and professional punctuality..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
                ⚠️ {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
