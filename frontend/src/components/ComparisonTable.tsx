'use client';

import React, { useState } from 'react';
import { useSearchStore } from '../store/searchStore';
import TransportCard from './TransportCard';
import { Plane, Train, Bus, ChevronDown, ChevronUp } from 'lucide-react';
import type { ScoredOption, Tier } from '../types';

function ModeColumn({
  icon: Icon,
  label,
  options,
  activeTier,
  emptyMsg,
  accentClass,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  options: ScoredOption[];
  activeTier: Tier;
  emptyMsg: string;
  accentClass: string;
}) {
  const [showAll, setShowAll] = useState(false);

  const sorted = [...(options ?? [])].sort(
    (a, b) => b.scores[activeTier] - a.scores[activeTier]
  );
  const visible = showAll ? sorted : sorted.slice(0, 2);

  return (
    <div className="flex flex-col gap-3">
      {/* Column header */}
      <div className={`flex items-center gap-2 pb-2 border-b-2 ${accentClass}`}>
        <Icon className="w-5 h-5" />
        <h3 className="text-base font-bold text-gray-900 dark:text-white">{label}</h3>
        <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded-full ml-auto">
          {sorted.length} {sorted.length === 1 ? 'option' : 'options'}
        </span>
      </div>

      {/* Cards */}
      {sorted.length === 0 ? (
        <div className="text-gray-400 dark:text-gray-500 text-sm text-center py-10 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
          {emptyMsg}
        </div>
      ) : (
        <>
          {visible.map((opt) => (
            <TransportCard key={opt.id} option={opt} />
          ))}

          {sorted.length > 2 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center justify-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline py-1"
            >
              {showAll ? (
                <>Show less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>View {sorted.length - 2} more {label.toLowerCase()} <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function ComparisonTable() {
  const { searchResults, activeTier, isLoading } = useSearchStore();

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow flex flex-col p-5 gap-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            {[1, 2].map((j) => (
              <div key={j} className="rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col gap-3">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/3" />
                  </div>
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
                <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded" />
                <div className="h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (!searchResults) return null;

  const { flights = [], trains = [], buses = [] } = searchResults;

  return (
    <div className="w-full max-w-6xl mx-auto mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModeColumn
          icon={Plane}
          label="Flights"
          options={flights}
          activeTier={activeTier}
          emptyMsg="No flights found for this route"
          accentClass="border-sky-400"
        />
        <ModeColumn
          icon={Train}
          label="Trains"
          options={trains}
          activeTier={activeTier}
          emptyMsg="No trains found for this route"
          accentClass="border-emerald-400"
        />
        <ModeColumn
          icon={Bus}
          label="Buses"
          options={buses}
          activeTier={activeTier}
          emptyMsg="No buses found for this route"
          accentClass="border-amber-400"
        />
      </div>
    </div>
  );
}
