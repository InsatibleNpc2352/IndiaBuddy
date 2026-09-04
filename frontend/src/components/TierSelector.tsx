'use client';

import React from 'react';
import { useSearchStore } from '../store/searchStore';
import { Tier } from '../types';
import { motion } from 'framer-motion';
import { Zap, Armchair, IndianRupee, Star, Coins } from 'lucide-react';

const tiers: { id: Tier; label: string; icon: any }[] = [
  { id: 'fastest', label: 'Fastest', icon: Zap },
  { id: 'comfort', label: 'Best Comfort', icon: Armchair },
  { id: 'cost', label: 'Best Cost', icon: IndianRupee },
  { id: 'overall', label: 'Best Overall', icon: Star },
  { id: 'economic', label: 'Most Economic', icon: Coins },
];

export default function TierSelector() {
  const { activeTier, setActiveTier } = useSearchStore();

  return (
    <div className="w-full max-w-4xl mx-auto flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 relative">
      {tiers.map((tier) => {
        const isActive = activeTier === tier.id;
        const Icon = tier.icon;
        
        return (
          <button
            key={tier.id}
            onClick={() => setActiveTier(tier.id)}
            className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-2 py-3 px-2 rounded-lg text-sm font-medium z-10 transition-colors ${
              isActive ? 'text-primary-700 dark:text-primary-100' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="hidden md:inline">{tier.label}</span>
          </button>
        );
      })}
      
      {/* Animated background pill */}
      <div className="absolute inset-y-1 flex z-0" style={{ width: `${100 / tiers.length}%`, left: `${tiers.findIndex(t => t.id === activeTier) * (100 / tiers.length)}%` }}>
        <motion.div
          layoutId="activeTier"
          className="w-full h-full bg-white dark:bg-gray-700 rounded-lg shadow-sm"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  );
}
