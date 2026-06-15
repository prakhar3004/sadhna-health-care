// Sadhna Health Care — Messages Screen
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/src/components/ui/Avatar';
import { RoleBadge } from '@/src/components/ui/RoleBadge';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { useLanguageStore } from '@/src/store/languageStore';
import { ChatService } from '@/src/services/chatService';
import { Conversation } from '@/src/types';
import { formatRelativeTime, truncateText } from '@/src/utils/helpers';
import { FontSize, Spacing, Radius } from '@/src/utils/constants';

const MESSAGES_TRANS: Record<string, Record<string, string>> = {
  en: {
    messages: 'Messages',
    online_now: 'Online Now',
    start_conv: 'Start a conversation',
  },
  hi: {
    messages: 'संदेश',
    online_now: 'अभी ऑनलाइन',
    start_conv: 'बातचीत शुरू करें',
  },
  hinglish: {
    messages: 'Messages',
    online_now: 'Online Now',
    start_conv: 'Baat shuru karein',
  },
  bn: {
    messages: 'বার্তা',
    online_now: 'এখন অনলাইনে',
    start_conv: 'কথোপকথন শুরু করুন',
  },
  te: {
    messages: 'సందేశాలు',
    online_now: 'ఇప్పుడు ఆన్‌లైన్‌లో',
    start_conv: 'సంభాషణను ప్రారంభించండి',
  },
  mr: {
    messages: 'संदेश',
    online_now: 'आता ऑनलाइन',
    start_conv: 'संभाषण सुरू करा',
  },
  ta: {
    messages: 'செய்திகள்',
    online_now: 'இப்போது ஆன்லைனில்',
    start_conv: 'உரையாடலைத் தொடங்குங்கள்',
  },
  gu: {
    messages: 'સંદેશા',
    online_now: 'હમણાં ઓનલાઈન',
    start_conv: 'વાતચીત શરૂ કરો',
  },
  kn: {
    messages: 'ಸಂದೇಶಗಳು',
    online_now: 'ಈಗ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದಾರೆ',
    start_conv: 'ಸಂಭಾಷಣೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ',
  },
  ml: {
    messages: 'സന്ദേശങ്ങൾ',
    online_now: 'ഇപ്പോൾ ഓൺലൈനിൽ',
    start_conv: 'ഒരു സംഭാഷണം ആരംഭിക്കുക',
  },
  pa: {
    messages: 'ਸੁਨੇਹੇ',
    online_now: 'ਹੁਣੇ ਆਨਲਾਈਨ',
    start_conv: 'ਗੱਲਬาਤ ਸ਼ੁਰੂ ਕਰੋ',
  },
  or: {
    messages: 'ସନ୍ଦେଶ',
    online_now: 'ଏବେ ଅନ୍‌ଲାଇନ୍‌',
    start_conv: 'କଥୋପକଥନ ଆରମ୍ଭ କରନ୍ତୁ',
  }
};

export default function MessagesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { language } = useLanguageStore();

  const trans = MESSAGES_TRANS[language] || MESSAGES_TRANS['en'];

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setConversations(await ChatService.fetchConversations(user.id));
    } catch (e) {
      console.warn('Failed to load conversations:', e);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherUser = item.participants.find((p) => p.id !== user?.id) || item.participants[0];
    const hasUnread = item.unread_count > 0;

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          { backgroundColor: hasUnread ? colors.primaryFaded : 'transparent' },
        ]}
        onPress={() => router.push(`/chat/${item.id}` as any)}
        activeOpacity={0.6}
      >
        <Avatar
          uri={otherUser.avatar_url}
          name={otherUser.full_name}
          size={52}
          showOnline
          isOnline={otherUser.is_online}
          lastSeenAt={otherUser.last_seen_at}
        />
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <View style={styles.nameSection}>
              <Text
                style={[
                  styles.conversationName,
                  { color: colors.text, fontWeight: hasUnread ? '700' : '600' },
                ]}
                numberOfLines={1}
              >
                {otherUser.full_name}
              </Text>
              <RoleBadge role={otherUser.role} size="sm" showLabel={false} />
            </View>
            <Text style={[styles.conversationTime, { color: hasUnread ? colors.primary : colors.textTertiary }]}>
              {item.last_message ? formatRelativeTime(item.last_message.created_at) : ''}
            </Text>
          </View>
          <View style={styles.lastMessageRow}>
            <Text
              style={[
                styles.lastMessage,
                { color: hasUnread ? colors.text : colors.textTertiary },
              ]}
              numberOfLines={1}
            >
              {item.last_message
                ? truncateText(item.last_message.content, 55)
                : trans.start_conv}
            </Text>
            {hasUnread && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.unreadCount}>{item.unread_count}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{trans.messages}</Text>
        <TouchableOpacity
          style={[styles.newChatButton, { backgroundColor: colors.primaryFaded }]}
          onPress={() => router.push('/(tabs)/search' as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Online Users Strip */}
      <View style={[styles.onlineStrip, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <Text style={[styles.onlineTitle, { color: colors.textTertiary }]}>{trans.online_now}</Text>
        <FlatList
          horizontal
          data={conversations
            .map((c) => c.participants.find((p) => p.id !== user?.id) || c.participants[0])
            .filter((p) => {
              if (!p) return false;
              return p.is_online || (p.last_seen_at && (Date.now() - new Date(p.last_seen_at).getTime() < 5 * 60 * 1000));
            })}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.onlineItem}
              onPress={() => {
                const conv = conversations.find(c => c.participants.some(p => p.id === item.id));
                if (conv) router.push(`/chat/${conv.id}` as any);
              }}
            >
              <Avatar uri={item.avatar_url} name={item.full_name} size={44} showOnline isOnline={item.is_online} lastSeenAt={item.last_seen_at} />
              <Text style={[styles.onlineName, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.full_name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.onlineList}
        />
      </View>

      {/* Conversations */}
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.conversationsList, conversations.length === 0 && { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.divider }]} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{trans.start_conv}</Text>
            <Text style={[styles.emptySub, { color: colors.textTertiary }]}>
              Find people in Discover and start a conversation.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineStrip: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  onlineTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  onlineList: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.base,
  },
  onlineItem: {
    alignItems: 'center',
    width: 56,
  },
  onlineName: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  conversationsList: {
    paddingBottom: 100,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  conversationInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  conversationName: {
    fontSize: FontSize.base,
  },
  conversationTime: {
    fontSize: FontSize.xs,
    marginLeft: 8,
  },
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  lastMessage: {
    fontSize: FontSize.sm,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    marginLeft: 80,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: 10,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    maxWidth: 260,
  },
});
