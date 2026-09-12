'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, ArrowRight } from 'lucide-react';
import { useSearchStore } from '../store/searchStore';

export default function AlternativeBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const searchResults = useSearchStore(state => state.searchResults);
  const activeTier = useSearchStore(state => state.activeTier);
  const setMode = useSearchStore(state => state.setMode);

  if (!isVisible || !searchResults) return null;

  // Compute the cheapest overall mode vs the currently-shown best
  const { flights = [], trains = [], buses = [] } = searchResults;

  const getBest = (opts: any[]) =>
    opts.length ? [...opts].sort((a, b) => b.scores[activeTier] - a.scores[activeTier])[0] : null;

  const bestFlight = getBest(flights);
  const bestTrain = getBest(trains);
  const bestBus = getBest(buses);

  const allBest = [bestFlight, bestTrain, bestBus].filter(Boolean);
  if (allBest.length < 2) return null;

  const cheapest = allBest.reduce((a, b) => (a.price < b.price ? a : b));
  const mostExpensive = allBest.reduce((a, b) => (a.price > b.price ? a : b));
  if (cheapest === mostExpensive) return null;

  const savingPercent = Math.round(((mostExpensive.price - cheapest.price) / mostExpensive.price) * 100);
  if (savingPercent < 10) return null;

  const modeLabel = cheapest.mode === 'flight' ? 'Flights' : cheapest.mode === 'train' ? 'Trains' : 'Buses';
  const modeKey = cheapest.mode === 'flight' ? 'flights' : cheapest.mode === 'train' ? 'trains' : 'buses';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        className="w-full max-w-4xl mx-auto bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300 rounded-lg shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 dark:text-amber-100 text-sm">Better option found!</h4>
            <p className="text-amber-800 dark:text-amber-200 text-xs mt-0.5">
              <span className="font-semibold">{modeLabel}</span> saves you{' '}
              <span className="font-bold">₹{(mostExpensive.price - cheapest.price).toLocaleString('en-IN')}</span>{' '}
              ({savingPercent}% cheaper) on this route.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setMode(modeKey as any)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            View {modeLabel} <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1.5 text-amber-600 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
