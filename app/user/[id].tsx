// Sadhna Health Care — User Profile (Other User)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/src/components/ui/Avatar';
import { RoleBadge } from '@/src/components/ui/RoleBadge';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { PostCard } from '@/src/components/feed/PostCard';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { PeopleService } from '@/src/services/peopleService';
import { PostsService } from '@/src/services/postsService';
import { ChatService } from '@/src/services/chatService';
import { Profile, Post } from '@/src/types';
import { RoleConfig, FontSize, Spacing, Radius } from '@/src/utils/constants';
import { formatCount } from '@/src/utils/helpers';

export default function UserProfileScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const [p, posts] = await Promise.all([
          PeopleService.fetchProfile(id),
          PeopleService.fetchUserPosts(id),
        ]);
        if (!active) return;
        setProfile(p);
        setUserPosts(posts);
        if (user && user.id !== id) {
          setIsFollowing(await PeopleService.isFollowing(user.id, id));
        }
      } catch (e) {
        console.warn('Failed to load profile:', e);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, user?.id]);

  const handleToggleFollow = useCallback(async () => {
    if (!user || !id || followBusy || user.id === id) return;
    const next = !isFollowing;
    setIsFollowing(next); // optimistic
    setFollowBusy(true);
    try {
      await PeopleService.setFollow(user.id, id, next);
    } catch (e) {
      setIsFollowing(!next); // revert on failure
    } finally {
      setFollowBusy(false);
    }
  }, [user, id, isFollowing, followBusy]);

  const handleMessage = useCallback(async () => {
    if (!user || !id) return;
    try {
      const convId = await ChatService.getOrCreateDirectConversation(user.id, id);
      router.push(`/chat/${convId}` as any);
    } catch (e) {
      console.warn('Failed to open chat:', e);
    }
  }, [user, id]);

  if (!profile) return null;
  const roleConfig = RoleConfig[profile.role];
  const isSelf = user?.id === profile.id;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Hero */}
        <View style={[styles.profileHero, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatarContainer, { borderColor: roleConfig.color }]}>
            <Avatar
              uri={profile.avatar_url}
              name={profile.full_name}
              size={90}
              showOnline
              isOnline={profile.is_online}
            />
          </View>
          <Text style={[styles.fullName, { color: colors.text }]}>{profile.full_name}</Text>
          <Text style={[styles.usernameText, { color: colors.textTertiary }]}>@{profile.username}</Text>
          <View style={styles.badgeRow}>
            <RoleBadge role={profile.role} size="md" verified={profile.is_verified} />
          </View>

          {profile.bio && (
            <Text style={[styles.bio, { color: colors.textSecondary }]}>{profile.bio}</Text>
          )}

          {/* Stats */}
          <View style={[styles.statsRow, { borderColor: colors.divider }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{formatCount(profile.posts_count)}</Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Posts</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{formatCount(profile.followers_count)}</Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Followers</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{formatCount(profile.following_count)}</Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Following</Text>
            </View>
          </View>

          {/* Action Buttons */}
          {!isSelf && (
            <View style={styles.actionButtons}>
              <Button
                title={isFollowing ? 'Following' : 'Follow'}
                variant={isFollowing ? 'outline' : 'primary'}
                size="md"
                icon={isFollowing ? 'checkmark' : 'person-add-outline'}
                onPress={handleToggleFollow}
                disabled={followBusy}
                style={{ flex: 1 }}
              />
              <Button
                title="Message"
                variant="secondary"
                size="md"
                icon="chatbubble-outline"
                onPress={handleMessage}
                style={{ flex: 1 }}
              />
            </View>
          )}
        </View>

        {/* Professional Info */}
        {profile.role === 'doctor' && profile.specialization && (
          <Card style={styles.infoCard}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Professional Info</Text>
            <View style={styles.infoGrid}>
              <View style={[styles.infoItem, { backgroundColor: colors.surfaceSecondary }]}>
                <Ionicons name="medical" size={20} color={colors.primary} />
                <Text style={[styles.infoValue, { color: colors.text }]}>{profile.specialization}</Text>
                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Specialization</Text>
              </View>
              <View style={[styles.infoItem, { backgroundColor: colors.surfaceSecondary }]}>
                <Ionicons name="briefcase" size={20} color={colors.primary} />
                <Text style={[styles.infoValue, { color: colors.text }]}>{profile.experience_years}+ yrs</Text>
                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Experience</Text>
              </View>
              <View style={[styles.infoItem, { backgroundColor: colors.surfaceSecondary }]}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{profile.location}</Text>
                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Location</Text>
              </View>
            </View>
          </Card>
        )}

        {/* User's Posts */}
        <View style={styles.postsSection}>
          <Text style={[styles.postsSectionTitle, { color: colors.text }]}>
            Recent Posts
          </Text>
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onReact={(postId, reaction) => {
                  if (user) PostsService.setReaction(postId, user.id, reaction).catch(() => {});
                }}
                onBookmark={(postId, bookmarked) => {
                  if (user) PostsService.toggleBookmark(postId, user.id, bookmarked).catch(() => {});
                }}
                onComment={(postId) => router.push(`/post/${postId}` as any)}
              />
            ))
          ) : (
            <View style={styles.emptyPosts}>
              <Ionicons name="document-text-outline" size={40} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No posts yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHero: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  avatarContainer: {
    borderWidth: 3,
    borderRadius: 50,
    padding: 3,
  },
  fullName: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    marginTop: Spacing.md,
  },
  usernameText: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: Spacing.sm,
  },
  bio: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.base,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: FontSize.xl, fontWeight: '800' },
  statLabel: { fontSize: FontSize.xs, marginTop: 2 },
  statDivider: { width: 1, height: 30 },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    marginTop: Spacing.base,
  },
  infoCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
  },
  infoTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    gap: 6,
  },
  infoValue: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  infoLabel: {
    fontSize: 10,
  },
  postsSection: {
    marginTop: Spacing.xl,
  },
  postsSectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: FontSize.sm,
  },
});
