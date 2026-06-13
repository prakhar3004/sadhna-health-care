// Sadhna Health Care — Card Component
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useThemeColors } from '@/src/hooks/useTheme';
import { Radius, Spacing } from '@/src/utils/constants';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  noPadding?: boolean;
}

export function Card({ children, style, padding, noPadding = false }: CardProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          shadowColor: colors.shadow,
          borderColor: colors.borderLight,
        },
        !noPadding && { padding: padding ?? Spacing.base },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
});
