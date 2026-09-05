'use client';

import React, { useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import NewsReport from '../components/NewsReport';
import { useSearchStore } from '../store/searchStore';
import { Map, Zap, TrendingDown, Bell, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { fetchInitialData, setOrigin, setDestination } = useSearchStore();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const quickLinks = [
    { origin: 'Delhi', dest: 'Mumbai' },
    { origin: 'Bangalore', dest: 'Goa' },
    { origin: 'Chennai', dest: 'Kochi' },
    { origin: 'Hyderabad', dest: 'Pune' },
  ];

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="text-center pt-10 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight"
        >
          Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-400">Smartest</span> Way <br className="hidden md:block"/> to Travel India
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10"
        >
          Compare flights, trains, and buses in one click. Our AI predicts prices and finds hidden promo codes to save you money.
        </motion.p>
        
        <div className="-mt-4 relative z-10">
          <SearchBar />
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <span className="text-sm text-gray-500 py-1.5 px-2">Popular:</span>
          {quickLinks.map((link, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                setOrigin(link.origin);
                setDestination(link.dest);
              }}
              className="text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-1.5 hover:border-primary-500 hover:text-primary-600 transition-colors shadow-sm cursor-pointer"
            >
              {link.origin} → {link.dest}
            </motion.button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Map className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">1. Search Anywhere</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Enter your route and we'll instantly check every flight, train, and bus available.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">2. Compare Tiers</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Use our 5 smart tiers to find the fastest, cheapest, or best overall option for your needs.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingDown className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">3. Book & Save</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Apply our auto-discovered promo codes and book at the statistically cheapest time.</p>
        </div>
      </section>

      {/* Market Report & Features */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto w-full items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Travel smarter with data.</h2>
          <ul className="space-y-6">
            <li className="flex gap-4">
              <div className="mt-1 bg-primary-100 p-2 rounded-lg text-primary-600"><TrendingDown className="w-5 h-5"/></div>
              <div>
                <h4 className="font-bold text-lg">AI Price Prediction</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Know exactly when prices will drop up to a year in advance using our confidence-interval models.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="mt-1 bg-primary-100 p-2 rounded-lg text-primary-600"><Bell className="w-5 h-5"/></div>
              <div>
                <h4 className="font-bold text-lg">Smart Alerts</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Get notified instantly when a better mode of transport becomes available for your route.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="mt-1 bg-primary-100 p-2 rounded-lg text-primary-600"><Shield className="w-5 h-5"/></div>
              <div>
                <h4 className="font-bold text-lg">Verified Promos</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Stop hunting for coupons. We scrape and verify credit card offers and promo codes daily.</p>
              </div>
            </li>
          </ul>
          <a href="/predict" className="inline-flex items-center gap-2 mt-8 text-primary-600 font-bold hover:gap-3 transition-all">
            Try the Price Predictor <ArrowRight className="w-5 h-5" />
          </a>
        </div>
        <div>
          <NewsReport />
        </div>
      </section>
    </div>
  );
}
