// Sadhna Health Care — Tab Layout
import React, { useState, useEffect } from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useLanguageStore } from '@/src/store/languageStore';
import { useAuthStore } from '@/src/store/authStore';
import { ChatService } from '@/src/services/chatService';
import { ScreenLoader } from '@/src/components/ui/ScreenLoader';

export default function TabLayout() {
  const colors = useThemeColors();
  const { language } = useLanguageStore();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const insets = useSafeAreaInsets();

  // Total unread messages, driven by the same source as the Messages screen.
  const [unreadMessages, setUnreadMessages] = useState(0);
  useEffect(() => {
    if (!user) return;
    let active = true;
    ChatService.fetchConversations(user.id)
      .then((convs) => {
        if (active) setUnreadMessages(convs.reduce((sum, c) => sum + (c.unread_count || 0), 0));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user?.id]);

  const getTabTitle = (tab: 'home' | 'discover' | 'visits' | 'messages' | 'profile') => {
    const maps: Record<string, Record<string, string>> = {
      en: { home: 'Home', discover: 'Discover', visits: 'Visits', messages: 'Messages', profile: 'Profile' },
      hi: { home: 'होम', discover: 'खोजें', visits: 'अपॉइंटमेंट', messages: 'संदेश', profile: 'प्रोफ़ाइल' },
      hinglish: { home: 'Home', discover: 'Discover', visits: 'Visits', messages: 'Messages', profile: 'Profile' },
      bn: { home: 'হোম', discover: 'অনুসন্ধান', visits: 'পরিদর্শন', messages: 'বার্তা', profile: 'প্রোফাইল' },
      te: { home: 'హోమ్', discover: 'కనుగొనండి', visits: 'సందర్శనలు', messages: 'సందేశాలు', profile: 'ప్రొఫైల్' },
      mr: { home: 'होम', discover: 'शोध', visits: 'भेटी', messages: 'संदेश', profile: 'प्रोफाइल' },
      ta: { home: 'முகப்பு', discover: 'கண்டறிக', visits: 'வருகைகள்', messages: 'செய்திகள்', profile: 'சுயவிவரம்' },
      gu: { home: 'હોમ', discover: 'શોધો', visits: 'મુલાકાતો', messages: 'સંદેશા', profile: 'પ્રોફાઇલ' },
      kn: { home: 'ಹೋಮ್', discover: 'ಹುಡುಕಿ', visits: 'ಭೇಟಿಗಳು', messages: 'ಸಂದೇಶಗಳು', profile: 'ಪ್ರೊಫೈಲ್' },
      ml: { home: 'ഹോം', discover: 'കണ്ടെത്തുക', visits: 'സന്ദർശനങ്ങൾ', messages: 'സന്ദേശങ്ങൾ', profile: 'പ്രൊഫൈൽ' },
      pa: { home: 'ਹੋਮ', discover: 'ਖੋਜੋ', visits: 'ਮੁਲਾਕਾਤਾਂ', messages: 'ਸੁਨੇਹੇ', profile: 'ਪ੍ਰੋਫਾਈਲ' },
      or: { home: 'ହୋମ୍', discover: 'ଆବିଷ୍କାର', visits: 'ପରିଦର୍ଶନ', messages: 'ସନ୍ଦେଶ', profile: 'ପ୍ରୋଫାଇଲ୍' }
    };
    return maps[language]?.[tab] || maps['en']?.[tab];
  };

  // ─── Auth guard (protects the entire tabs group, reactively) ──
  // Runs on every render, so a sign-out / token expiry that flips the auth
  // store immediately bounces the user out of the protected area.
  if (isLoading) return <ScreenLoader />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (user && !user.is_profile_complete) return <Redirect href="/(auth)/profile-setup" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? (60 + insets.bottom) : (64 + insets.bottom),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: getTabTitle('home'),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: getTabTitle('discover'),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: getTabTitle('visits'),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: getTabTitle('messages'),
          tabBarIcon: ({ focused, color }) => (
            <View>
              <Ionicons
                name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
                size={24}
                color={color}
              />
              {/* Unread badge — only shown when there are unread messages */}
              {unreadMessages > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={styles.badgeText}>
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: getTabTitle('profile'),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
  },
});
