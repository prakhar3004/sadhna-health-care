// Sadhna Health Care — Entry Point (Auth Router)
import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/src/store/authStore';
import { useThemeColors } from '@/src/hooks/useTheme';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const colors = useThemeColors();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    if (user && !user.is_profile_complete) {
      return <Redirect href="/(auth)/profile-setup" />;
    }
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
