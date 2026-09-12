'use client';

import React, { useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { differenceInDays, isBefore, startOfDay } from 'date-fns';
import { useSearchStore } from '../store/searchStore';

export default function CalendarPicker({ onClose }: { onClose?: () => void }) {
  const selectedDate = useSearchStore(state => state.selectedDate);
  const setDate = useSearchStore(state => state.setDate);
  const today = startOfDay(new Date());

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      if (onClose) onClose();
    }
  };

  const modifiersStyles = {
    live: { backgroundColor: '#d1fae5', color: '#065f46' }, // emerald-100
    forecast: { backgroundColor: '#fef3c7', color: '#92400e' }, // amber-100
    speculative: { backgroundColor: '#fee2e2', color: '#991b1b' }, // red-100
    selected: { backgroundColor: '#4f46e5', color: '#ffffff' }, // primary-600
  };

  const getZone = (date: Date) => {
    const diff = differenceInDays(date, today);
    if (diff < 0) return null;
    if (diff <= 90) return 'live';
    if (diff <= 365) return 'forecast';
    return 'speculative';
  };

  // Mocking cheapest dates - in reality this would come from API prediction data
  const isCheapest = (date: Date) => {
    return date.getDate() % 10 === 0; // Just some mock logic
  };

  return (
    <div className="p-2">
      <DayPicker
        mode="single"
        selected={selectedDate || undefined}
        onSelect={handleSelect}
        disabled={[{ before: today }]}
        modifiers={{
          live: (date) => getZone(date) === 'live',
          forecast: (date) => getZone(date) === 'forecast',
          speculative: (date) => getZone(date) === 'speculative',
          cheapest: (date) => getZone(date) !== null && isCheapest(date),
        }}
        modifiersStyles={modifiersStyles}
        components={{
          DayContent: (props) => (
            <div className="relative w-full h-full flex items-center justify-center" title={`Predicted range: ₹${Math.floor(Math.random() * 2000 + 1000)} - ₹${Math.floor(Math.random() * 2000 + 3000)}`}>
              {props.date.getDate()}
              {props.activeModifiers.cheapest && (
                <span className="absolute top-0 right-0 text-[10px] leading-none text-warning-500">★</span>
              )}
            </div>
          ),
        }}
        className="custom-day-picker"
      />
      <div className="mt-4 pt-4 border-t text-xs flex justify-between px-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />
          <span>0-90d (Live)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
          <span>91-365d (Forecast)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
          <span>365d+ (Speculative)</span>
        </div>
      </div>
      <style jsx global>{`
        .custom-day-picker .rdp-day_selected:not([disabled]) {
          background-color: #4f46e5;
          color: white;
        }
        .custom-day-picker .rdp-day_selected:hover:not([disabled]) {
          background-color: #4338ca;
        }
      `}</style>
    </div>
  );
}
