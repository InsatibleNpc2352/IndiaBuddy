'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchStore } from '../store/searchStore';
import { X, Copy, CheckCircle, AlertCircle, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PromoPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const promos = useSearchStore(state => state.promos);
  const [filter, setFilter] = useState<'all' | 'flights' | 'trains' | 'buses'>('all');

  const filteredPromos = promos.filter(p => filter === 'all' || p.mode === filter || p.mode === 'all');

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary-600" />
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Available Offers</h2>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex gap-2 overflow-x-auto border-b dark:border-gray-700 pb-4">
              {(['all', 'flights', 'trains', 'buses'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                    filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredPromos.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No verified offers found</p>
                </div>
              ) : (
                filteredPromos.map(promo => (
                  <div key={promo.id} className="border dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-bl-lg text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      {promo.mode}
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2 text-xs font-medium">
                      {promo.isVerified ? (
                        <span className="text-success-600 dark:text-success-500 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Verified</span>
                      ) : (
                        <span className="text-warning-600 dark:text-warning-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Unverified</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-2 border border-dashed border-gray-300 dark:border-gray-600">
                      <span className="font-mono text-lg font-bold tracking-widest text-primary-600 dark:text-primary-400">{promo.code}</span>
                      <button
                        onClick={() => copyCode(promo.code)}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 transition-colors"
                        title="Copy code"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{promo.description}</p>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      {promo.minAmount && <p>Min booking: ₹{promo.minAmount}</p>}
                      {promo.cardRequirement && <p>Requires: {promo.cardRequirement}</p>}
                      <p className="text-danger-500 font-medium">Expires: {new Date(promo.expiryDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
