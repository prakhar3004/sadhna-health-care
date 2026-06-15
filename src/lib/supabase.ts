// Sadhna Health Care — Supabase Client Configuration
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from '@/src/lib/config';

if (!isSupabaseConfigured()) {
  console.warn(
    '⚠️ Sadhna Health Care: Using placeholder Supabase credentials — running in demo mode. ' +
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file to enable the live backend.'
  );
}

// Storage adapter. CRITICAL: React Native has NO window.localStorage — using it
// (the old `typeof window` check) silently no-ops session storage on the APK, so
// the user never stays authenticated and live features fail. We pick by platform:
//   • native  → AsyncStorage (correct for the APK)
//   • web      → window.localStorage
//   • SSR/prerender (web build in Node, no window) → no-op, so export doesn't crash
const isWeb = Platform.OS === 'web';
const hasWindow = typeof window !== 'undefined' && !!(window as any).localStorage;
const webLS = (): Storage | null => (hasWindow ? (window as any).localStorage : null);

const customStorage = {
  getItem: (key: string): string | null | Promise<string | null> => {
    if (isWeb) {
      const ls = webLS();
      try { return ls ? ls.getItem(key) : null; } catch { return null; }
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string): void | Promise<void> => {
    if (isWeb) {
      const ls = webLS();
      try { ls?.setItem(key, value); } catch {}
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string): void | Promise<void> => {
    if (isWeb) {
      const ls = webLS();
      try { ls?.removeItem(key); } catch {}
      return;
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: customStorage,
    // Always on for a real client (native or web browser); off only during the
    // web SSR/prerender pass where there is no window.
    autoRefreshToken: !isWeb || hasWindow,
    persistSession: !isWeb || hasWindow,
    detectSessionInUrl: false,
  },
});
