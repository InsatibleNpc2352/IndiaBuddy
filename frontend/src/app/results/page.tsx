'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSearchStore } from '../../store/searchStore';
import SearchBar from '../../components/SearchBar';
import TierSelector from '../../components/TierSelector';
import ComparisonTable from '../../components/ComparisonTable';
import AlternativeBanner from '../../components/AlternativeBanner';
import CautionBanner from '../../components/CautionBanner';
import PromoPanel from '../../components/PromoPanel';
import PriceChart from '../../components/PriceChart';
import { Tag, AlertCircle } from 'lucide-react';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const {
    origin, destination, selectedDate, selectedMode,
    search, predict, fetchInitialData, promos,
    searchResults, isLoading, error,
    setOrigin, setDestination, setDate, setMode,
  } = useSearchStore();
  const [isPromoOpen, setIsPromoOpen] = useState(false);

  // On first load: read URL params → hydrate store → trigger search
  // This handles both soft nav (params already in store) and hard reload (store empty)
  useEffect(() => {
    const urlOrigin = searchParams.get('origin');
    const urlDest = searchParams.get('destination');
    const urlDate = searchParams.get('date');
    const urlMode = searchParams.get('mode') as any;

    const effectiveOrigin = urlOrigin || origin;
    const effectiveDestination = urlDest || destination;

    let effectiveDate = selectedDate;
    if (urlDate && !selectedDate) {
      effectiveDate = new Date(urlDate + 'T00:00:00');
    }

    // Hydrate store from URL if store was reset (e.g. hard reload)
    if (urlOrigin && urlOrigin !== origin) setOrigin(urlOrigin);
    if (urlDest && urlDest !== destination) setDestination(urlDest);
    if (effectiveDate && !selectedDate) setDate(effectiveDate);
    if (urlMode && urlMode !== selectedMode) setMode(urlMode);

    if (effectiveOrigin && effectiveDestination && effectiveDate) {
      search();
      predict();
    }

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasResults = searchResults && (
    (searchResults.flights?.length ?? 0) +
    (searchResults.trains?.length ?? 0) +
    (searchResults.buses?.length ?? 0)
  ) > 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative">

      {/* Sticky Search Header */}
      <div className="sticky top-16 z-30 -mx-4 px-4 py-4 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md border-b dark:border-gray-800 shadow-sm">
        <SearchBar />
      </div>

      <div className="max-w-6xl mx-auto w-full flex flex-col gap-4 mt-2">

        {/* Caution Banner (365+ days) */}
        <CautionBanner />

        {/* Better Alternative Banner */}
        {hasResults && <AlternativeBanner />}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* No search yet — prompt */}
        {!isLoading && !hasResults && !error && !origin && (
          <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-2xl mb-2">✈️ 🚆 🚌</p>
            <p className="font-bold text-gray-700 dark:text-gray-200 text-lg mb-1">Where are you travelling?</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your origin and destination above to compare all modes of transport.</p>
          </div>
        )}
      </div>

      {/* Tier Selector + Promo CTA */}
      {(isLoading || hasResults) && (
        <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-2/3 md:w-3/4">
            <TierSelector />
          </div>
          <button
            onClick={() => setIsPromoOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all hover:shadow"
          >
            <Tag className="w-5 h-5" />
            {promos.length > 0 ? `${promos.length} Verified Offers` : 'View Offers'}
          </button>
        </div>
      )}

      {/* Comparison Table — ALL options per mode */}
      <ComparisonTable />

      {/* Price Prediction Chart */}
      {hasResults && (
        <div className="max-w-6xl mx-auto w-full mt-4">
          <PriceChart />
        </div>
      )}

      <PromoPanel isOpen={isPromoOpen} onClose={() => setIsPromoOpen(false)} />
    </div>
  );
}
