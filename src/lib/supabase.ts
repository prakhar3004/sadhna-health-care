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
const isBrowser = typeof window !== 'undefined';
const customStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isBrowser) {
      try {
        return await AsyncStorage.getItem(key);
      } catch (err) {
        console.error('Error reading auth token:', err);
      }
    }
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isBrowser) {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (err) {
        console.error('Error saving auth token:', err);
      }
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isBrowser) {
      try {
        await AsyncStorage.removeItem(key);
      } catch (err) {
        console.error('Error removing auth token:', err);
      }
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: customStorage,
    autoRefreshToken: isBrowser, // Only refresh tokens on the client
    persistSession: isBrowser, // Only persist sessions on the client
    detectSessionInUrl: false,
  },
});
