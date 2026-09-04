'use client';

import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import { Prediction } from '../types';
import { format, parseISO } from 'date-fns';
import { useSearchStore } from '../store/searchStore';

export default function PriceChart() {
  const { prediction, selectedDate } = useSearchStore();
  const [view, setView] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  if (!prediction || prediction.length === 0) return null;

  // Format data for Recharts
  const data = prediction.map(p => ({
    date: p.date,
    historicalPrice: p.historicalPrice,
    predictedPrice: p.predictedPrice,
    range: [p.lowerBound, p.upperBound],
    lowerBound: p.lowerBound,
    upperBound: p.upperBound,
  }));

  const todayStr = new Date().toISOString().split('T')[0];
  const selectedStr = selectedDate ? selectedDate.toISOString().split('T')[0] : null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 text-sm">
          <p className="font-bold text-gray-900 dark:text-white mb-2">{format(parseISO(label), 'MMM d, yyyy')}</p>
          
          {payload.map((entry: any, index: number) => {
            if (entry.dataKey === 'historicalPrice' && entry.value) {
              return <p key={index} className="text-blue-600 dark:text-blue-400">Actual: ₹{entry.value}</p>;
            }
            if (entry.dataKey === 'predictedPrice' && entry.value) {
              return (
                <div key={index}>
                  <p className="text-orange-600 dark:text-orange-400 font-semibold">Predicted: ₹{entry.value}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Range: ₹{entry.payload.lowerBound} - ₹{entry.payload.upperBound}
                  </p>
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Price Forecast</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Historical trends and 365-day prediction</p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['7d', '30d', '90d', '1y'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                view === v ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(parseISO(date), 'MMM d')}
              minTickGap={30}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={(val) => `₹${val}`}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Confidence Interval Area */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill="#ffedd5" // orange-100
              fillOpacity={0.5}
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="none"
              fill="#ffffff"
              fillOpacity={1}
            />

            {/* Historical Line */}
            <Line
              type="monotone"
              dataKey="historicalPrice"
              stroke="#3b82f6" // blue-500
              strokeWidth={2}
              dot={false}
              connectNulls
            />

            {/* Predicted Line */}
            <Line
              type="monotone"
              dataKey="predictedPrice"
              stroke="#f97316" // orange-500
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
            />

            <ReferenceLine x={todayStr} stroke="#9ca3af" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#9ca3af', fontSize: 10 }} />
            
            {selectedStr && (
              <ReferenceLine x={selectedStr} stroke="#4f46e5" strokeWidth={2} label={{ position: 'top', value: 'Selected', fill: '#4f46e5', fontSize: 10 }} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
