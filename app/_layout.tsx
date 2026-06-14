// Sadhna Health Care — Root Layout
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { useColorScheme } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { useLanguageStore } from '@/src/store/languageStore';

// Prevent splash screen auto-hiding before assets load
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, error] = useFonts(Platform.select({
    web: {
      Ionicons: 'https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf',
      FontAwesome: 'https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf',
    },
    default: {
      ...FontAwesome.font,
      ...Ionicons.font,
    },
  }) as any);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Load persisted native language selection
    useLanguageStore.getState().loadLanguage();

    // Initialize Supabase Auth State Listener
    const unsubscribe = useAuthStore.getState().initialize();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Active status heartbeat & AppState tracking (like FB/Instagram)
  useEffect(() => {
    const store = useAuthStore.getState();
    
    // Heartbeat to update last_seen_at when app is open
    const interval = setInterval(() => {
      const state = useAuthStore.getState();
      if (state.isAuthenticated && state.user) {
        state.updateActivityStatus(true);
      }
    }, 60000); // every 1 minute

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const state = useAuthStore.getState();
      if (!state.isAuthenticated || !state.user) return;

      if (nextAppState === 'active') {
        state.updateActivityStatus(true);
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        state.updateActivityStatus(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Initial update on mount if authenticated
    if (store.isAuthenticated && store.user) {
      store.updateActivityStatus(true);
    }

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

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
