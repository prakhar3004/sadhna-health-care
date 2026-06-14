// Sadhna Health Care — Supabase Client Configuration
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from '@/src/lib/config';

if (!isSupabaseConfigured()) {
  console.warn(
    '⚠️ Sadhna Health Care: Using placeholder Supabase credentials — running in demo mode. ' +
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file to enable the live backend.'
  );
}

// Custom storage wrapper to prevent SSR crash in Node.js (ReferenceError: window is not defined)
const customStorage = {
  getItem: (key: string): string | null | Promise<string | null> => {
    if (typeof window !== 'undefined') {
      try {
        return window.localStorage.getItem(key);
      } catch (err) {
        console.error('Error reading from localStorage:', err);
        return null;
      }
    }
    try {
      return AsyncStorage.getItem(key);
    } catch (err) {
      console.error('Error reading from AsyncStorage:', err);
      return null;
    }
  },
  setItem: (key: string, value: string): void | Promise<void> => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (err) {
        console.error('Error writing to localStorage:', err);
        return;
      }
    }
    try {
      return AsyncStorage.setItem(key, value);
    } catch (err) {
      console.error('Error writing to AsyncStorage:', err);
    }
  },
  removeItem: (key: string): void | Promise<void> => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch (err) {
        console.error('Error removing from localStorage:', err);
        return;
      }
    }
    try {
      return AsyncStorage.removeItem(key);
    } catch (err) {
      console.error('Error removing from AsyncStorage:', err);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: customStorage,
    autoRefreshToken: typeof window !== 'undefined', // Only refresh tokens on the client
    persistSession: typeof window !== 'undefined', // Only persist sessions on the client
    detectSessionInUrl: false,
  },
});
