'use client';

import React from 'react';
import { useSearchStore } from '../store/searchStore';
import { Newspaper, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

export default function NewsReport() {
  const dailyReport = useSearchStore(state => state.dailyReport);

  if (!dailyReport) return null;

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-danger-500" />; // Bullish means prices going UP (bad for buyer)
      case 'bearish': return <TrendingDown className="w-4 h-4 text-success-500" />; // Bearish means prices going DOWN (good for buyer)
      default: return <Minus className="w-4 h-4 text-warning-500" />;
    }
  };

  const modes = [
    { name: 'Flights', icon: '✈️', data: dailyReport.sentiments.flights },
    { name: 'Trains', icon: '🚂', data: dailyReport.sentiments.trains },
    { name: 'Buses', icon: '🚌', data: dailyReport.sentiments.buses },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4 pb-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <Newspaper className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Daily Market Report</h3>
            <p className="text-xs text-gray-500">{format(new Date(dailyReport.date), 'EEEE, MMMM d, yyyy')}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {modes.map(m => (
          <div key={m.name} className="flex items-center gap-3 text-sm">
            <span className="w-6 text-center">{m.icon}</span>
            <span className="font-medium text-gray-700 dark:text-gray-300 w-16">{m.name}</span>
            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
              {/* Score visually represents price trend. 0 = bearish (green), 50 = neutral, 100 = bullish (red) */}
              <div 
                className={`h-full ${m.data.sentiment === 'bullish' ? 'bg-danger-500' : m.data.sentiment === 'bearish' ? 'bg-success-500' : 'bg-warning-500'}`}
                style={{ width: `${m.data.score}%` }}
              />
            </div>
            <div className="flex items-center gap-1 w-20 justify-end text-xs font-medium">
              {getSentimentIcon(m.data.sentiment)}
              <span className="capitalize">{m.data.sentiment}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl mb-4 text-sm text-gray-700 dark:text-gray-300 italic">
        "{dailyReport.summary}"
      </div>

      <div className="bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 rounded-xl p-4">
        <p className="text-sm font-semibold text-primary-800 dark:text-primary-300">
          💡 Recommendation: {dailyReport.recommendation}
        </p>
      </div>

      <p className="text-[10px] text-gray-400 mt-4 text-right">
        Updated today at {new Date(dailyReport.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </p>
    </div>
  );
}
