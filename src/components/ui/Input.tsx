// Sadhna Health Care — Input Component
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useTheme';
import { Radius, FontSize, Spacing } from '@/src/utils/constants';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  editable?: boolean;
  style?: ViewStyle;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  icon,
  error,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  editable = true,
  style,
}: InputProps) {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const borderColor = error
    ? colors.error
    : isFocused
      ? colors.primary
      : colors.border;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: colors.surfaceSecondary,
            borderWidth: isFocused ? 1.5 : 1,
          },
          multiline && { height: numberOfLines * 24 + 24, alignItems: 'flex-start' },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? colors.primary : colors.textTertiary}
            style={styles.icon}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={editable}
          style={[
            styles.input,
            {
              color: colors.text,
            },
            multiline && { textAlignVertical: 'top', paddingTop: 12 },
          ]}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    paddingVertical: 14,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  error: {
    fontSize: FontSize.xs,
    marginTop: 4,
    marginLeft: 4,
  },
});
