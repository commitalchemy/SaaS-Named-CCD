import { create } from 'zustand';
import type { Account } from '../types';

interface UiStore {
  selectedAccount: Account | null;
  selectAccount: (a: Account | null) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  selectedAccount: null,
  selectAccount: (a) => set({ selectedAccount: a }),
}));
