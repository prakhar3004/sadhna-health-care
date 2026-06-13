// Sadhna Health Care — Auth Layout (public area guard)
import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  // A fully onboarded, signed-in user has no business on login/register —
  // send them into the app. (Authenticated-but-incomplete users stay here so
  // they can reach profile-setup, which lives in this group.)
  if (isAuthenticated && user?.is_profile_complete) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
