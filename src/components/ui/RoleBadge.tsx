// Sadhna Health Care — Role Badge Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserRole, RoleConfig } from '@/src/utils/constants';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  verified?: boolean;
}

export function RoleBadge({ role, size = 'sm', showLabel = true, verified = false }: RoleBadgeProps) {
  const config = RoleConfig[role];
  
  const sizeStyles = {
    sm: { paddingV: 3, paddingH: 8, fontSize: 11, iconSize: 12 },
    md: { paddingV: 5, paddingH: 12, fontSize: 13, iconSize: 14 },
    lg: { paddingV: 7, paddingH: 16, fontSize: 15, iconSize: 16 },
  };

  const s = sizeStyles[size];

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: config.fadedColor,
            paddingVertical: s.paddingV,
            paddingHorizontal: s.paddingH,
          },
        ]}
      >
        <Ionicons
          name={config.icon as any}
          size={s.iconSize}
          color={config.color}
          style={showLabel ? { marginRight: 4 } : undefined}
        />
        {showLabel && (
          <Text style={[styles.label, { color: config.color, fontSize: s.fontSize }]}>
            {config.label}
          </Text>
        )}
      </View>
      {verified && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={s.iconSize + 2} color="#3B82F6" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
  },
  label: {
    fontWeight: '600',
  },
  verifiedBadge: {
    marginLeft: 2,
  },
});
