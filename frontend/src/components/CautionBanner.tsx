'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useSearchStore } from '../store/searchStore';
import { differenceInDays, startOfDay } from 'date-fns';

export default function CautionBanner() {
  const { selectedDate } = useSearchStore();

  if (!selectedDate) return null;

  const today = startOfDay(new Date());
  const diff = differenceInDays(selectedDate, today);

  if (diff <= 365) return null; // Only show for 365+ days

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 bg-red-50 border border-red-400 rounded-xl p-4 flex items-start gap-3 shadow-sm">
      <div className="p-1 text-red-600 shrink-0 mt-0.5">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-bold text-red-900">Speculative Price Estimate</h4>
        <p className="text-red-800 text-sm mt-1">
          You are searching for a date more than a year in advance. Airlines and railways have not yet opened bookings for these dates. The prices shown are highly speculative estimates based on historical yearly patterns and macroeconomic inflation models, and are subject to significant change.
        </p>
      </div>
    </div>
  );
}
