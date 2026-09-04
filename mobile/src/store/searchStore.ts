import { create } from 'zustand';
import { Mode } from '../types';

interface SearchState {
  origin: string;
  destination: string;
  date: string;
  mode: Mode;
  setSearchData: (data: Partial<SearchState>) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  origin: '',
  destination: '',
  date: new Date().toISOString().split('T')[0],
  mode: 'All',
  setSearchData: (data) => set((state) => ({ ...state, ...data })),
  clearSearch: () => set({ origin: '', destination: '', date: new Date().toISOString().split('T')[0], mode: 'All' }),
}));
