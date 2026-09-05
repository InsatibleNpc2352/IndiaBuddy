'use client';

import React from 'react';
import { ScoredOption } from '../types';
import { useSearchStore } from '../store/searchStore';
import { Clock, Tag, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TransportCard({ option }: { option: ScoredOption }) {
  const { activeTier } = useSearchStore();

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-500 border-success-500';
    if (score >= 60) return 'text-warning-500 border-warning-500';
    return 'text-danger-500 border-danger-500';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-success-500';
    if (score >= 60) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.25 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow relative group"
    >
      
      {/* Top row: Operator and Score */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
            {option.operatorLogo ? (
              <img src={option.operatorLogo} alt={option.operator} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-xl font-bold text-gray-400">{option.operator[0]}</span>
            )}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{option.operator}</h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">{option.class}</span>
          </div>
        </div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm ${getScoreColor(option.scores[activeTier])}`}
        >
          {option.scores[activeTier]}
        </motion.div>
      </div>

      {/* Price and Duration */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</p>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            ₹{option.price.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-end gap-1">
            <Clock className="w-3 h-3" /> Duration
          </p>
          <div className="font-semibold text-gray-700 dark:text-gray-200">
            {formatDuration(option.durationMinutes)}
          </div>
        </div>
      </div>

      {/* Times */}
      <div className="flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 mb-4">
        <span>{option.departureTime}</span>
        <div className="flex-1 border-t-2 border-dashed border-gray-300 dark:border-gray-600 mx-3 relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] bg-gray-50 dark:bg-gray-700 px-1 text-gray-400">
            {option.mode === 'flight' ? '✈️' : option.mode === 'train' ? '🚂' : '🚌'}
          </div>
        </div>
        <span>{option.arrivalTime}</span>
      </div>

      {/* Tiers micro-bars */}
      <div className="grid grid-cols-5 gap-1 mb-4 h-8" title="Scores: Fastest, Comfort, Cost, Overall, Economic">
        {Object.entries(option.scores).map(([tier, score], idx) => (
          <div key={tier} className="h-full flex flex-col justify-end group/bar relative">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${score}%` }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className={`w-full rounded-t-sm opacity-60 ${activeTier === tier ? '!opacity-100' : ''} ${getBarColor(score)}`}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 pointer-events-none whitespace-nowrap z-10">
              {tier}: {score}
            </div>
          </div>
        ))}
      </div>

      {/* Promos */}
      {option.promoCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-4 bg-emerald-50 dark:bg-emerald-900/30 w-max px-2 py-1 rounded text-left">
          <Tag className="w-3 h-3" />
          {option.promoCount} offers available
        </div>
      )}

      {/* CTA */}
      <a
        href={option.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
      >
        Book Now <ExternalLink className="w-4 h-4" />
      </a>
    </motion.div>
  );
}
