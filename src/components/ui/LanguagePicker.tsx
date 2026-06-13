// Sadhna Health Care — Reusable Language Picker Component
import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useLanguageStore } from '@/src/store/languageStore';
import { useThemeColors } from '@/src/hooks/useTheme';
import { Language } from '@/src/utils/translations';
import { Radius, Spacing } from '@/src/utils/constants';

export function LanguagePicker() {
  const colors = useThemeColors();
  const { language, setLanguage } = useLanguageStore();

  const options: { key: Language; label: string }[] = [
    { key: 'en', label: 'English' },
    { key: 'hi', label: 'हिंदी' },
    { key: 'hinglish', label: 'Hinglish' },
    { key: 'bn', label: 'বাংলা' },
    { key: 'te', label: 'తెలుగు' },
    { key: 'mr', label: 'मराठी' },
    { key: 'ta', label: 'தமிழ்' },
    { key: 'gu', label: 'ગુજરાતી' },
    { key: 'kn', label: 'ಕನ್ನಡ' },
    { key: 'ml', label: 'മലയാളം' },
    { key: 'pa', label: 'ਪੰਜਾਬੀ' },
    { key: 'or', label: 'ଓଡ଼ିଆ' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.scrollView, { backgroundColor: colors.surfaceSecondary }]}
      contentContainerStyle={styles.container}
    >
      {options.map((opt) => {
        const isActive = language === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.tab,
              isActive && { backgroundColor: colors.primary },
            ]}
            onPress={() => setLanguage(opt.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                { color: isActive ? '#FFF' : colors.textSecondary },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 38,
    borderRadius: Radius.md,
    flexGrow: 0,
    alignSelf: 'stretch',
  },
  container: {
    flexDirection: 'row',
    padding: 3,
    alignItems: 'center',
    gap: 4,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

