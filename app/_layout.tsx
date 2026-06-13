// Sadhna Health Care — Root Layout
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { useLanguageStore } from '@/src/store/languageStore';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Load persisted native language selection
    useLanguageStore.getState().loadLanguage();

    // Initialize Supabase Auth State Listener
    const unsubscribe = useAuthStore.getState().initialize();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="post/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="user/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="post/create"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}
