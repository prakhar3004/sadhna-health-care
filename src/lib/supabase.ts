// Sadhna Health Care — Supabase Client Configuration
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

if (SUPABASE_URL === 'https://your-project.supabase.co' || SUPABASE_ANON_KEY === 'your-anon-key') {
  console.warn(
    '⚠️ Sadhna Health Care: Using placeholder Supabase credentials. ' +
    'Please set up EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
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
