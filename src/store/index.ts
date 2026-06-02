import { create } from 'zustand';
import { Language } from '@/types';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;

  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  setLanguage: (language) => set({ language }),

  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  selectedCategory: 'all',
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
}));
