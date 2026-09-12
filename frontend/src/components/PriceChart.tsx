'use client';

import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import { Prediction } from '../types';
import { format, parseISO } from 'date-fns';
import { useSearchStore } from '../store/searchStore';

export default function PriceChart() {
  const prediction = useSearchStore(state => state.prediction);
  const selectedDate = useSearchStore(state => state.selectedDate);
  const selectedMode = useSearchStore(state => state.selectedMode);
  const [view, setView] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const filteredPrediction = useMemo(() => {
    if (!prediction || prediction.length === 0) return [];
    const limit = view === '7d' ? 7 : view === '30d' ? 30 : view === '90d' ? 90 : prediction.length;
    return prediction.slice(0, limit);
  }, [prediction, view]);

  if (!prediction || prediction.length === 0) return null;

  // Format data for Recharts
  const data = filteredPrediction.map(p => ({
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
      const activeModeLabel =
        selectedMode === 'flights' ? 'Flights' :
        selectedMode === 'trains' ? 'Trains' :
        selectedMode === 'buses' ? 'Buses' :
        'All Modes (Flights, Trains, Buses)';

      return (
        <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 text-sm min-w-[220px]">
          <div className="border-b border-gray-100 dark:border-gray-700 pb-2 mb-2">
            <p className="font-bold text-gray-900 dark:text-white">
              {label ? format(parseISO(label), 'MMM d, yyyy') : ''}
            </p>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold mt-0.5">
              Mode: {activeModeLabel}
            </p>
          </div>
          
          {payload.map((entry: any, index: number) => {
            if (entry.dataKey === 'historicalPrice' && entry.value) {
              return (
                <div key={index} className="flex justify-between items-center text-xs py-0.5">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Actual Price:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">₹{entry.value}</span>
                </div>
              );
            }
            if (entry.dataKey === 'predictedPrice' && entry.value) {
              return (
                <div key={index} className="mt-1 pt-1 border-t border-gray-50 dark:border-gray-700">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-orange-600 dark:text-orange-400 font-semibold">Predicted Price:</span>
                    <span className="font-bold text-orange-700 dark:text-orange-300">₹{entry.value}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex justify-between">
                    <span>Forecast Range:</span>
                    <span>₹{entry.payload.lowerBound} - ₹{entry.payload.upperBound}</span>
                  </p>
                </div>
              );
            }
            return null;
          })}

          <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-700 text-[10px] flex items-center justify-between text-gray-400">
            <span className={selectedMode === 'flights' || selectedMode === 'all' ? 'text-sky-600 dark:text-sky-400 font-bold' : ''}>Flights</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className={selectedMode === 'trains' || selectedMode === 'all' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>Trains</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className={selectedMode === 'buses' || selectedMode === 'all' ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>Buses</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Price Forecast</h3>
            {/* Explicit Mode Badges */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                selectedMode === 'flights' || selectedMode === 'all'
                  ? 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300'
                  : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700 opacity-60'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                Flights
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                selectedMode === 'trains' || selectedMode === 'all'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700 opacity-60'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Trains
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                selectedMode === 'buses' || selectedMode === 'all'
                  ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                  : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700 opacity-60'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Buses
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Historical trends and 365-day predictive pricing across Flights, Trains, and Buses
          </p>
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

      <div className="h-[320px] w-full">
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

            {/* Recharts Legend with explicit Flights, Trains, Buses labels */}
            <Legend
              verticalAlign="top"
              height={42}
              content={() => {
                const modesList = [
                  { id: 'flights', label: 'Flights', color: '#0ea5e9' },
                  { id: 'trains', label: 'Trains', color: '#10b981' },
                  { id: 'buses', label: 'Buses', color: '#f59e0b' },
                ];
                return (
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-700 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Modes:</span>
                      {modesList.map((m) => {
                        const isActive = selectedMode === 'all' || selectedMode === m.id;
                        return (
                          <span
                            key={m.id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isActive
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                : 'text-gray-400 dark:text-gray-500 opacity-50'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                            {m.label}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-blue-500 inline-block" /> Actual Price
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-orange-500 border-b border-dashed inline-block" /> Predicted Price
                      </span>
                    </div>
                  </div>
                );
              }}
            />

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
