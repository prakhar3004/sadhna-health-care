// Sadhna Health Care — Dashboard config store (Zustand).
// Loads the visibility rules once and exposes a synchronous visibility check
// that dashboards use to gate their widgets.
import { create } from 'zustand';
import {
  DashboardConfigService,
  DashboardRule,
  resolveVisibility,
} from '@/src/services/dashboardConfigService';
import { useAuthStore } from '@/src/store/authStore';

interface DashboardConfigState {
  rules: DashboardRule[];
  loaded: boolean;
  load: () => Promise<void>;
  isVisible: (widgetKey: string) => boolean;
}

export const useDashboardConfigStore = create<DashboardConfigState>((set, get) => ({
  rules: [],
  loaded: false,

  load: async () => {
    try {
      const rules = await DashboardConfigService.fetchRules();
      set({ rules, loaded: true });
    } catch (e) {
      console.warn('Failed to load dashboard config:', e);
      set({ loaded: true }); // fail open — widgets stay visible
    }
  },

  isVisible: (widgetKey: string) => {
    const user = useAuthStore.getState().user;
    return resolveVisibility(get().rules, user?.id, user?.role, widgetKey);
  },
}));
