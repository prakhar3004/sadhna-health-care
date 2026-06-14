// Sadhna Health Care — Notifications Screen
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/src/components/ui/Avatar';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { NotificationsService } from '@/src/services/notificationsService';
import { AppNotification } from '@/src/types';
import { formatRelativeTime } from '@/src/utils/helpers';
import { FontSize, Spacing, Radius } from '@/src/utils/constants';

const TYPE_ICON: Record<AppNotification['type'], { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  like: { icon: 'heart', color: '#EF4444' },
  comment: { icon: 'chatbubble-ellipses', color: '#3B82F6' },
  follow: { icon: 'person-add', color: '#0D9488' },
  message: { icon: 'mail', color: '#8B5CF6' },
  appointment: { icon: 'calendar', color: '#F59E0B' },
  group_invite: { icon: 'people', color: '#10B981' },
  announcement: { icon: 'megaphone', color: '#DC2626' },
};

export default function NotificationsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setItems(await NotificationsService.fetchNotifications(user.id));
    } catch (e) {
      console.warn('Failed to load notifications:', e);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleMarkAllRead = useCallback(async () => {
    if (!user) return;
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true }))); // optimistic
    try {
      await NotificationsService.markAllRead(user.id);
    } catch (e) {
      console.warn('Failed to mark all read:', e);
    }
  }, [user?.id]);

  const handlePress = useCallback(
    async (n: AppNotification) => {
      if (!n.is_read) {
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
        NotificationsService.markRead(n.id).catch(() => {});
      }
      // Route to the most relevant destination for the notification type.
      switch (n.type) {
        case 'follow':
          if (n.actor_id) router.push(`/user/${n.actor_id}` as any);
          break;
        case 'like':
        case 'comment':
          if (n.entity_id) router.push({ pathname: '/post/[id]', params: { id: n.entity_id } } as any);
          break;
        case 'message':
          if (n.entity_id) router.push(`/chat/${n.entity_id}` as any);
          break;
        case 'appointment':
          router.push('/(tabs)/appointments' as any);
          break;
        default:
          break;
      }
    },
    [router]
  );

  const renderItem = ({ item }: { item: AppNotification }) => {
    const meta = TYPE_ICON[item.type] || TYPE_ICON.follow;
    return (
      <TouchableOpacity
        style={[
          styles.row,
          { backgroundColor: item.is_read ? 'transparent' : colors.primaryFaded },
        ]}
        onPress={() => handlePress(item)}
        activeOpacity={0.6}
      >
        <View style={styles.avatarWrap}>
          <Avatar uri={item.actor?.avatar_url} name={item.actor?.full_name || 'User'} size={48} />
          <View style={[styles.typeBadge, { backgroundColor: meta.color }]}>
            <Ionicons name={meta.icon} size={11} color="#FFF" />
          </View>
        </View>
        <View style={styles.body}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {item.title || item.actor?.full_name || 'Notification'}
          </Text>
          {!!item.body && (
            <Text style={[styles.sub, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.body}
            </Text>
          )}
          <Text style={[styles.time, { color: colors.textTertiary }]}>
            {formatRelativeTime(item.created_at)}
          </Text>
        </View>
        {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={[styles.markAll, { color: colors.primary }]}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No notifications yet</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={[styles.sep, { backgroundColor: colors.divider }]} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: '800' },
  markAll: { fontSize: FontSize.sm, fontWeight: '600', paddingHorizontal: Spacing.sm },
  list: { flexGrow: 1, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  avatarWrap: { position: 'relative' },
  typeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  body: { flex: 1 },
  title: { fontSize: FontSize.sm, fontWeight: '600' },
  sub: { fontSize: FontSize.sm, marginTop: 2 },
  time: { fontSize: FontSize.xs, marginTop: 4 },
  unreadDot: { width: 10, height: 10, borderRadius: 5 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 12 },
  emptyText: { fontSize: FontSize.base },
  sep: { height: 1, marginLeft: 80 },
});
