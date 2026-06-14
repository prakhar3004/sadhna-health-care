// Sadhna Health Care — Avatar Component
import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useTheme';
import { getInitials } from '@/src/utils/helpers';
import { Radius } from '@/src/utils/constants';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  showOnline?: boolean;
  isOnline?: boolean;
  lastSeenAt?: string | null;
  style?: ViewStyle;
}

export function Avatar({ uri, name, size = 44, showOnline = false, isOnline = false, lastSeenAt, style }: AvatarProps) {
  const colors = useThemeColors();
  const initials = getInitials(name);
  const fontSize = size * 0.36;
  const onlineDotSize = size * 0.28;

  // Resolve online status dynamically
  let active = isOnline;
  if (lastSeenAt) {
    const diffMs = Date.now() - new Date(lastSeenAt).getTime();
    if (diffMs < 5 * 60 * 1000) { // 5 minutes
      active = true;
    }
  }

  return (
    <View style={[{ width: size, height: size }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: colors.border,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.primaryFaded,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize, color: colors.primary }]}>
            {initials}
          </Text>
        </View>
      )}
      {showOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: onlineDotSize,
              height: onlineDotSize,
              borderRadius: onlineDotSize / 2,
              backgroundColor: active ? '#22C55E' : '#94A3B8',
              borderColor: colors.surface,
              borderWidth: 2,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderWidth: 1.5,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});
