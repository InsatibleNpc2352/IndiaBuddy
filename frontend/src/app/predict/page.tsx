'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '../../components/SearchBar';
import PriceChart from '../../components/PriceChart';
import NewsReport from '../../components/NewsReport';
import CalendarPicker from '../../components/CalendarPicker';
import { useSearchStore } from '../../store/searchStore';

export const dynamic = 'force-dynamic';

function PredictContent() {
  const searchParams = useSearchParams();
  const origin = useSearchStore(state => state.origin);
  const destination = useSearchStore(state => state.destination);
  const selectedMode = useSearchStore(state => state.selectedMode);
  const predict = useSearchStore(state => state.predict);
  const fetchInitialData = useSearchStore(state => state.fetchInitialData);
  const setOrigin = useSearchStore(state => state.setOrigin);
  const setDestination = useSearchStore(state => state.setDestination);
  const setMode = useSearchStore(state => state.setMode);
  const setDate = useSearchStore(state => state.setDate);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Read URL params and hydrate Zustand store on mount or query param change
  useEffect(() => {
    const urlOrigin = searchParams.get('origin');
    const urlDest = searchParams.get('destination');
    const urlMode = searchParams.get('mode') as any;
    const urlDate = searchParams.get('date');

    if (urlOrigin && urlOrigin !== origin) setOrigin(urlOrigin);
    if (urlDest && urlDest !== destination) setDestination(urlDest);
    if (urlMode && urlMode !== selectedMode) setMode(urlMode);
    if (urlDate) setDate(new Date(urlDate + 'T00:00:00'));

    const effectiveOrigin = urlOrigin || origin;
    const effectiveDest = urlDest || destination;

    if (effectiveOrigin && effectiveDest) {
      predict();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Trigger predict when mode changes
  useEffect(() => {
    if (origin && destination) {
      predict();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMode]);

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-6xl mx-auto">
      
      <div className="text-center mb-4">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Price Predictor</h1>
        <p className="text-gray-600 dark:text-gray-400">See 365-day price forecasts and find the cheapest days to travel.</p>
      </div>

      <SearchBar />

      {origin && destination ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Cheapest Days Calendar</h3>
              <div className="max-w-sm mx-auto">
                <CalendarPicker />
              </div>
            </div>
            <PriceChart />
          </div>
          
          <div className="flex flex-col gap-8">
            <NewsReport />
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6 border border-primary-100 dark:border-primary-800">
              <h3 className="font-bold text-primary-900 dark:text-primary-100 mb-2">How it works</h3>
              <p className="text-sm text-primary-800 dark:text-primary-200 space-y-3">
                <span className="block">Our AI analyzes historical pricing data, upcoming holidays, and macroeconomic news to predict travel costs up to a year in advance.</span>
                <span className="block"><strong>Live Zone (0-90d):</strong> High accuracy based on actual current bookings.</span>
                <span className="block"><strong>Forecast Zone (91-365d):</strong> Medium accuracy based on historical trends.</span>
                <span className="block"><strong>Speculative Zone (365d+):</strong> Low accuracy based on inflation models.</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mt-6">
          <p className="text-gray-500">Enter an origin and destination to see price predictions.</p>
        </div>
      )}
    </div>
  );
}

export default function PredictPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading price predictor...</p>
        </div>
      }
    >
      <PredictContent />
    </Suspense>
  );
}
