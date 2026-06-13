// Sadhna Health Care — Button Component
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useTheme';
import { Radius, FontSize, Spacing } from '@/src/utils/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const colors = useThemeColors();

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: FontSize.sm, iconSize: 16 },
    md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: FontSize.base, iconSize: 18 },
    lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: FontSize.md, iconSize: 20 },
  };

  const variantStyles = {
    primary: {
      bg: colors.primary,
      text: '#FFFFFF',
      border: 'transparent',
    },
    secondary: {
      bg: colors.primaryFaded,
      text: colors.primary,
      border: 'transparent',
    },
    outline: {
      bg: 'transparent',
      text: colors.primary,
      border: colors.primary,
    },
    ghost: {
      bg: 'transparent',
      text: colors.textSecondary,
      border: 'transparent',
    },
    danger: {
      bg: colors.error,
      text: '#FFFFFF',
      border: 'transparent',
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: currentVariant.bg,
          borderColor: currentVariant.border,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          opacity: disabled ? 0.5 : 1,
          borderWidth: variant === 'outline' ? 1.5 : 0,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={currentVariant.text} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={currentSize.iconSize}
              color={currentVariant.text}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              styles.text,
              { color: currentVariant.text, fontSize: currentSize.fontSize },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={currentSize.iconSize}
              color={currentVariant.text}
              style={{ marginLeft: 8 }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
  },
});
