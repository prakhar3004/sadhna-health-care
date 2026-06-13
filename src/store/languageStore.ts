// Sadhna Health Care — Language Store (Zustand)
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, TRANSLATIONS } from '@/src/utils/translations';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  loadLanguage: () => Promise<void>;
  t: (key: string) => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'en',

  setLanguage: async (lang) => {
    set({ language: lang });
    try {
      // Check if window is defined to avoid SSR crash in Node
      if (typeof window !== 'undefined') {
        await AsyncStorage.setItem('app_lang', lang);
      }
    } catch (err) {
      console.warn('Error saving language selection:', err);
    }
  },

  loadLanguage: async () => {
    try {
      if (typeof window !== 'undefined') {
        const savedLang = await AsyncStorage.getItem('app_lang');
        const validLanguages = ['en', 'hi', 'hinglish', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa', 'or'];
        if (savedLang && validLanguages.includes(savedLang)) {
          set({ language: savedLang as Language });
        }
      }
    } catch (err) {
      console.warn('Error loading language selection:', err);
    }
  },

  t: (key) => {
    const lang = get().language;
    const dict = TRANSLATIONS[lang];
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    // Fallback to English dictionary if not found in active language
    const fallbackDict = TRANSLATIONS['en'];
    if (fallbackDict && fallbackDict[key] !== undefined) {
      return fallbackDict[key];
    }
    return key;
  },
}));
