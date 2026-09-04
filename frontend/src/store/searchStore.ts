import { create } from 'zustand';
import { DailyReport, Prediction, PromoCode, ScoredOption, Tier, TransportMode } from '../types';
import { compareRoutes, getDailyReport, getPromos, predictPrice, searchRoutes } from '../lib/api';

interface SearchState {
  origin: string;
  destination: string;
  selectedDate: Date | null;
  selectedMode: TransportMode;
  activeTier: Tier;
  searchResults: { flights: ScoredOption[]; trains: ScoredOption[]; buses: ScoredOption[] } | null;
  prediction: Prediction[];
  promos: PromoCode[];
  dailyReport: DailyReport | null;
  isLoading: boolean;
  error: string | null;

  setOrigin: (origin: string) => void;
  setDestination: (destination: string) => void;
  setDate: (date: Date | null) => void;
  setMode: (mode: TransportMode) => void;
  setActiveTier: (tier: Tier) => void;
  search: () => Promise<void>;
  predict: () => Promise<void>;
  fetchInitialData: () => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  origin: '',
  destination: '',
  selectedDate: null,
  selectedMode: 'all',
  activeTier: 'overall',
  searchResults: null,
  prediction: [],
  promos: [],
  dailyReport: null,
  isLoading: false,
  error: null,

  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setDate: (selectedDate) => set({ selectedDate }),
  setMode: (selectedMode) => set({ selectedMode }),
  setActiveTier: (activeTier) => set({ activeTier }),

  search: async () => {
    const { origin, destination, selectedDate, selectedMode } = get();
    if (!origin || !destination || !selectedDate) return;

    set({ isLoading: true, error: null, searchResults: null });
    try {
      // selectedDate could be Date or string after URL hydration
      const dateObj = selectedDate instanceof Date ? selectedDate : new Date(selectedDate as any);
      const dateStr = dateObj.toISOString().split('T')[0];

      let results: { flights: ScoredOption[]; trains: ScoredOption[]; buses: ScoredOption[] };

      // Always fetch compare (all modes) so we can show all columns
      results = await compareRoutes(origin, destination, dateStr);

      // If a specific mode filter is set, zero out the others
      if (selectedMode === 'flights') {
        results = { flights: results.flights, trains: [], buses: [] };
      } else if (selectedMode === 'trains') {
        results = { flights: [], trains: results.trains, buses: [] };
      } else if (selectedMode === 'buses') {
        results = { flights: [], trains: [], buses: results.buses };
      }

      set({ searchResults: results, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch results. Is the backend running?', isLoading: false });
    }
  },

  predict: async () => {
    const { origin, destination, selectedMode } = get();
    if (!origin || !destination) return;

    set({ isLoading: true, error: null });
    try {
      const data = await predictPrice(origin, destination, selectedMode);
      set({ prediction: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch predictions', isLoading: false });
    }
  },

  fetchInitialData: async () => {
    try {
      const [promos, report] = await Promise.all([getPromos(), getDailyReport()]);
      set({ promos, dailyReport: report });
    } catch (error) {
      console.error('Failed to fetch initial data', error);
    }
  }
}));
