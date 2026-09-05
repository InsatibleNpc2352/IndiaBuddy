'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchStore } from '../store/searchStore';
import { getCities } from '../lib/api';
import { ArrowRightLeft, Calendar, Plane, Train, Bus, MapPin, Search, TrendingDown, Sparkles } from 'lucide-react';
import CalendarPicker from './CalendarPicker';
import { useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import type { TransportMode } from '../types';

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const isPredict = pathname === '/predict' || pathname?.startsWith('/predict');
  const { origin, destination, setOrigin, setDestination, selectedDate, selectedMode, setMode, search, predict } = useSearchStore();
  const [originQuery, setOriginQuery] = useState(origin);
  const [destQuery, setDestQuery] = useState(destination);
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCities = async (q: string, setter: (cities: string[]) => void) => {
      if (q.length > 1) {
        try {
          const cities = await getCities(q);
          setter(cities);
        } catch {
          setter([]);
        }
      } else {
        setter([]);
      }
    };
    const timer = setTimeout(() => fetchCities(originQuery, setOriginSuggestions), 250);
    return () => clearTimeout(timer);
  }, [originQuery]);

  useEffect(() => {
    const fetchCities = async (q: string, setter: (cities: string[]) => void) => {
      if (q.length > 1) {
        try {
          const cities = await getCities(q);
          setter(cities);
        } catch {
          setter([]);
        }
      } else {
        setter([]);
      }
    };
    const timer = setTimeout(() => fetchCities(destQuery, setDestSuggestions), 250);
    return () => clearTimeout(timer);
  }, [destQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) setShowOriginDropdown(false);
      if (destRef.current && !destRef.current.contains(event.target as Node)) setShowDestDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync input fields when store values change (e.g. hydration or external update)
  useEffect(() => {
    setOriginQuery(origin);
  }, [origin]);

  useEffect(() => {
    setDestQuery(destination);
  }, [destination]);

  const handleSwap = () => {
    const tempO = origin;
    const tempD = destination;
    setOrigin(tempD);
    setDestination(tempO);
    setOriginQuery(tempD);
    setDestQuery(tempO);
  };

  const handleSearch = async () => {
    if (isPredict) {
      if (!origin || !destination) return;
      setIsSearching(true);
      const params = new URLSearchParams({
        origin,
        destination,
        mode: selectedMode,
      });
      if (selectedDate) {
        params.set('date', format(selectedDate, 'yyyy-MM-dd'));
      }
      // Update URL query params in-place without redirecting to /results
      router.push(`/predict?${params.toString()}`);
      try {
        await predict();
      } finally {
        setIsSearching(false);
      }
    } else {
      if (!origin || !destination || !selectedDate) return;
      setIsSearching(true);
      // Encode route params so results page can refetch even after page reload
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const params = new URLSearchParams({
        origin,
        destination,
        date: dateStr,
        mode: selectedMode,
      });
      // Soft navigation — Zustand state is preserved in-memory
      router.push(`/results?${params.toString()}`);
      setIsSearching(false);
    }
  };

  type ModeOption = { id: TransportMode; label: string; icon?: React.FC<{ className?: string }> };
  const modes: ModeOption[] = [
    { id: 'all', label: 'All Modes' },
    { id: 'flights', label: 'Flights', icon: Plane as React.FC<{ className?: string }> },
    { id: 'trains', label: 'Trains', icon: Train as React.FC<{ className?: string }> },
    { id: 'buses', label: 'Buses', icon: Bus as React.FC<{ className?: string }> },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col gap-4">
      <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
        {/* Origin */}
        <div ref={originRef} className="relative flex-1 min-w-[180px]">
          <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
            <MapPin className="text-gray-400 w-5 h-5 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="From — city or airport"
              className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-200 text-sm"
              value={originQuery}
              onChange={(e) => {
                setOriginQuery(e.target.value);
                setOrigin(e.target.value);
                setShowOriginDropdown(true);
              }}
              onFocus={() => setShowOriginDropdown(true)}
            />
          </div>
          <AnimatePresence>
            {showOriginDropdown && originSuggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute z-30 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {originSuggestions.map((city) => (
                  <li
                    key={city}
                    className="px-4 py-2.5 hover:bg-primary-50 dark:hover:bg-gray-700 cursor-pointer text-sm flex items-center gap-2"
                    onClick={() => {
                      setOrigin(city);
                      setOriginQuery(city);
                      setShowOriginDropdown(false);
                    }}
                  >
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />{city}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ rotate: 180 }}
          transition={{ duration: 0.2 }}
          onClick={handleSwap}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Swap origin and destination"
        >
          <ArrowRightLeft className="w-5 h-5 text-gray-500" />
        </motion.button>

        {/* Destination */}
        <div ref={destRef} className="relative flex-1 min-w-[180px]">
          <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
            <MapPin className="text-gray-400 w-5 h-5 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="To — city or airport"
              className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-200 text-sm"
              value={destQuery}
              onChange={(e) => {
                setDestQuery(e.target.value);
                setDestination(e.target.value);
                setShowDestDropdown(true);
              }}
              onFocus={() => setShowDestDropdown(true)}
            />
          </div>
          <AnimatePresence>
            {showDestDropdown && destSuggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute z-30 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {destSuggestions.map((city) => (
                  <li
                    key={city}
                    className="px-4 py-2.5 hover:bg-primary-50 dark:hover:bg-gray-700 cursor-pointer text-sm flex items-center gap-2"
                    onClick={() => {
                      setDestination(city);
                      setDestQuery(city);
                      setShowDestDropdown(false);
                    }}
                  >
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />{city}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Date */}
        <div className="relative min-w-[160px]">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full flex items-center border rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 transition-colors text-left"
          >
            <Calendar className="text-gray-400 w-5 h-5 mr-2 shrink-0" />
            <span className="text-gray-700 dark:text-gray-200 truncate text-sm">
              {selectedDate ? format(selectedDate, 'dd MMM yyyy') : (isPredict ? 'Date (Optional)' : 'Select Date')}
            </span>
          </button>
          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute z-30 mt-1 right-0 sm:left-0 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl p-2"
              >
                <CalendarPicker onClose={() => setShowCalendar(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search / Predict Button */}
        <button
          onClick={handleSearch}
          disabled={isPredict ? (!origin || !destination || isSearching) : (!origin || !destination || !selectedDate || isSearching)}
          className="w-full md:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isPredict ? (
            <>
              <TrendingDown className="w-5 h-5" />
              {isSearching ? 'Predicting…' : 'Predict Prices'}
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              {isSearching ? 'Searching…' : 'Search'}
            </>
          )}
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setMode(mode.id)}
              className={`relative flex items-center px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-primary-700 dark:text-primary-200'
                  : 'text-gray-600 hover:bg-gray-200/60 dark:text-gray-300 dark:hover:bg-gray-700/60 bg-gray-100 dark:bg-gray-700'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeModeTab"
                  className="absolute inset-0 bg-primary-100 dark:bg-primary-900 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center">
                {Icon && <Icon className="w-4 h-4 mr-1.5" />}
                {mode.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
