import { create } from 'zustand';
import type { FilterState } from '../types';

interface FilterStore extends FilterState {
  setVertical: (v: string) => void;
  setBusinessStatus: (v: string) => void;
  setBusinessOutcome: (v: string) => void;
  setSearch: (v: string) => void;
  clearAll: () => void;
}

const DEFAULTS: FilterState = { vertical: 'All', businessStatus: 'All', businessOutcome: 'All', search: '' };

export const useFilterStore = create<FilterStore>((set) => ({
  ...DEFAULTS,
  setVertical: (vertical) => set({ vertical }),
  setBusinessStatus: (businessStatus) => set({ businessStatus }),
  setBusinessOutcome: (businessOutcome) => set({ businessOutcome }),
  setSearch: (search) => set({ search }),
  clearAll: () => set({ ...DEFAULTS }),
}));
