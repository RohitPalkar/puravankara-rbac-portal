import type { PermissionSnapshot } from 'src/types';

import { create } from 'zustand';

interface PermissionState {
  snapshot: PermissionSnapshot | null;
  setSnapshot: (snapshot: PermissionSnapshot) => void;
  clearSnapshot: () => void;
}

export const usePermissionStore = create<PermissionState>((set) => ({
  snapshot: null,
  setSnapshot: (snapshot) => set({ snapshot }),
  clearSnapshot: () => set({ snapshot: null }),
}));
