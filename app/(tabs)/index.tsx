// Sadhna Health Care — Home Feed & Dashboard Screen
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PostCard } from '@/src/components/feed/PostCard';
import { Avatar } from '@/src/components/ui/Avatar';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { useLanguageStore } from '@/src/store/languageStore';
import { PostsService } from '@/src/services/postsService';
import { PeopleService } from '@/src/services/peopleService';
import { StoriesService, UserStories } from '@/src/services/storiesService';
import { StoryViewer } from '@/src/components/feed/StoryViewer';
import { Post, Profile } from '@/src/types';
import { APP_NAME, FontSize, Spacing, Radius } from '@/src/utils/constants';

// Role Dashboards
import { PatientDashboard } from '@/src/components/dashboard/PatientDashboard';
import { DoctorDashboard } from '@/src/components/dashboard/DoctorDashboard';
import { CaregiverDashboard } from '@/src/components/dashboard/CaregiverDashboard';

export default function HomeFeedScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const t = useLanguageStore((state) => state.t);
  const { language, setLanguage } = useLanguageStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'dashboard'>('feed');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'doctor' | 'caregiver' | 'patient' | 'milestone'>('all');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [people, setPeople] = useState<Profile[]>([]);
  
  // Stories & Creation States
  const [userStories, setUserStories] = useState<UserStories[]>([]);
  const [isStoryViewerVisible, setIsStoryViewerVisible] = useState(false);
  const [selectedStoryUserIdx, setSelectedStoryUserIdx] = useState(0);
  const [showCreateOptions, setShowCreateOptions] = useState(false);

  const loadFeed = useCallback(async () => {
    if (!user) return;
    try {
      const [feed, suggested, activeStories] = await Promise.all([
        PostsService.fetchFeed(user.id),
        PeopleService.search('', 'all', user.id),
        StoriesService.fetchStoriesGroupedByUser(),
      ]);
      setPosts(feed);
      setPeople(suggested);
      setUserStories(activeStories);
    } catch (e) {
      console.warn('Failed to load feed:', e);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const languageOptions: { key: any; label: string }[] = [
    { key: 'en', label: 'English' },
    { key: 'hi', label: 'हिंदी' },
    { key: 'hinglish', label: 'Hinglish' },
    { key: 'bn', label: 'বাংলা' },
    { key: 'te', label: 'తెలుగు' },
    { key: 'mr', label: 'मराठी' },
    { key: 'ta', label: 'தமிழ்' },
    { key: 'gu', label: 'ગુજરાતી' },
    { key: 'kn', label: 'ಕನ್ನಡ' },
    { key: 'ml', label: 'മലയാളം' },
    { key: 'pa', label: 'ਪੰਜਾਬੀ' },
    { key: 'or', label: 'ଓଡ଼ିଆ' },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }, [loadFeed]);

  const filteredPosts = React.useMemo(() => {
    if (selectedFilter === 'all') return posts;
    if (selectedFilter === 'doctor' || selectedFilter === 'caregiver' || selectedFilter === 'patient') {
      return posts.filter((p) => p.author.role === selectedFilter);
    }
    if (selectedFilter === 'milestone') {
      return posts.filter((p) => p.post_type === 'milestone' || p.post_type === 'recovery_story');
    }
    return posts;
  }, [selectedFilter, posts]);

  const filterChips = [
    { key: 'all' as const, label: t('filter_all') },
    { key: 'doctor' as const, label: t('filter_doctors') },
    { key: 'caregiver' as const, label: t('filter_caregivers') },
    { key: 'patient' as const, label: t('filter_patients') },
    { key: 'milestone' as const, label: t('filter_milestones') },
  ];

  const storyStripData = React.useMemo(() => {
    const storyUserIds = new Set(userStories.map((us) => us.user.id));
    const items: (
      | { type: 'story'; id: string; user: Profile; stories: any[] }
      | { type: 'profile'; id: string; user: Profile }
    )[] = userStories.map((us) => ({
      type: 'story',
      id: us.user.id,
      user: us.user,
      stories: us.stories,
    }));

    // Add other people who do not have active stories
    people.forEach((p) => {
      if (!storyUserIds.has(p.id)) {
        items.push({
          type: 'profile',
          id: p.id,
          user: p,
        });
      }
    });

    return items;
  }, [userStories, people]);

  const renderStoryItem = ({ item }: { item: any }) => {
    const hasStories = item.type === 'story';
    const profile = item.user;
    const userStoriesIdx = userStories.findIndex((us) => us.user.id === profile.id);

    return (
      <TouchableOpacity
        style={styles.storyItem}
        onPress={() => {
          if (hasStories && userStoriesIdx !== -1) {
            setSelectedStoryUserIdx(userStoriesIdx);
            setIsStoryViewerVisible(true);
          } else {
            router.push(`/user/${profile.id}` as any);
          }
        }}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.storyRing,
            {
              borderColor: hasStories ? colors.primary : 'transparent',
              borderWidth: hasStories ? 2 : 0,
              padding: hasStories ? 2 : 0,
            },
          ]}
        >
          <Avatar
            uri={profile.avatar_url}
            name={profile.full_name}
            size={hasStories ? 56 : 60} // Keep sizing aligned
            showOnline={!hasStories}
            isOnline={profile.is_online}
            lastSeenAt={profile.last_seen_at}
          />
        </View>
        <Text style={[styles.storyName, { color: colors.textSecondary }]} numberOfLines={1}>
          {profile.full_name.split(' ')[0]}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDashboard = () => {
    if (!user) return null;
    switch (user.role) {
      case 'doctor':
        return <DoctorDashboard />;
      case 'caregiver':
        return <CaregiverDashboard />;
      case 'patient':
      default:
        return <PatientDashboard />;
    }
  };

  const ListHeader = () => (
    <View>
      {/* Stories / Online Users */}
      <View style={[styles.storiesSection, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <FlatList
          horizontal
          data={storyStripData}
          renderItem={renderStoryItem}
          keyExtractor={(item) => `${item.type}_${item.id}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesList}
          ListHeaderComponent={
            <TouchableOpacity style={styles.storyItem} onPress={() => setShowCreateOptions(true)}>
              <View style={[styles.addStoryContainer, { backgroundColor: colors.primaryFaded, borderColor: colors.primary }]}>
                <Ionicons name="add" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.storyName, { color: colors.primary }]}>{t('new_post')}</Text>
            </TouchableOpacity>
          }
        />
      </View>

      {/* Feed Filter Chips */}
      <View style={styles.filterChips}>
        {filterChips.map((chip) => {
          const isActive = selectedFilter === chip.key;
          return (
            <TouchableOpacity
              key={chip.key}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? colors.primary : colors.surfaceSecondary,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedFilter(chip.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? '#FFF' : colors.textSecondary },
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* App Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/images/logo_icon.png')}
            style={styles.logoMiniImage}
            resizeMode="contain"
          />
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('app_name')}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.surfaceSecondary, marginRight: Spacing.sm }]}
            onPress={() => setShowLanguageModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="language" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            <View style={[styles.notifDot, { backgroundColor: '#EF4444' }]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented Control Tab Toggle */}
      <View style={[styles.toggleContainer, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <View style={[styles.toggleBg, { backgroundColor: colors.surfaceSecondary }]}>
          <TouchableOpacity
            style={[styles.toggleTab, activeTab === 'feed' && { backgroundColor: colors.surface }]}
            onPress={() => setActiveTab('feed')}
            activeOpacity={0.8}
          >
            <Ionicons name="apps-outline" size={15} color={activeTab === 'feed' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.toggleTabText, { color: activeTab === 'feed' ? colors.text : colors.textSecondary }]}>
              {t('feed_tab')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleTab, activeTab === 'dashboard' && { backgroundColor: colors.surface }]}
            onPress={() => setActiveTab('dashboard')}
            activeOpacity={0.8}
          >
            <Ionicons name="speedometer-outline" size={15} color={activeTab === 'dashboard' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.toggleTabText, { color: activeTab === 'dashboard' ? colors.text : colors.textSecondary }]}>
              {t('dashboard_tab')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Rendering */}
      {activeTab === 'feed' ? (
        <FlatList
          data={filteredPosts}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onReact={(postId, reaction) => {
                if (user) PostsService.setReaction(postId, user.id, reaction).catch(() => {});
              }}
              onBookmark={(postId, bookmarked) => {
                if (user) PostsService.toggleBookmark(postId, user.id, bookmarked).catch(() => {});
              }}
              onComment={(postId) => router.push({ pathname: '/post/[id]', params: { id: postId } } as any)}
            />
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      ) : (
        renderDashboard()
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowCreateOptions(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="create-outline" size={26} color="#FFF" />
      </TouchableOpacity>

      {/* Story Slideshow Viewer */}
      <StoryViewer
        userStoriesList={userStories}
        initialUserIndex={selectedStoryUserIdx}
        visible={isStoryViewerVisible}
        onClose={() => setIsStoryViewerVisible(false)}
      />

      {/* Create Options Modal Sheet */}
      {showCreateOptions && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCreateOptions(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create / जोड़ें</Text>
            
            <View style={styles.createOptionsRow}>
              <TouchableOpacity
                style={[styles.createOptionBtn, { borderColor: colors.borderLight, backgroundColor: colors.surfaceSecondary }]}
                onPress={() => {
                  setShowCreateOptions(false);
                  router.push('/post/create' as any);
                }}
              >
                <View style={[styles.createOptionIconBg, { backgroundColor: colors.primaryFaded }]}>
                  <Ionicons name="document-text" size={32} color={colors.primary} />
                </View>
                <Text style={[styles.createOptionLabel, { color: colors.text }]}>New Post</Text>
                <Text style={[styles.createOptionSub, { color: colors.textTertiary }]}>Share health advice or ask queries</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.createOptionBtn, { borderColor: colors.borderLight, backgroundColor: colors.surfaceSecondary }]}
                onPress={() => {
                  setShowCreateOptions(false);
                  router.push('/story/create' as any);
                }}
              >
                <View style={[styles.createOptionIconBg, { backgroundColor: '#F59E0B20' }]}>
                  <Ionicons name="images" size={32} color="#D97706" />
                </View>
                <Text style={[styles.createOptionLabel, { color: colors.text }]}>Add Story</Text>
                <Text style={[styles.createOptionSub, { color: colors.textTertiary }]}>Share photo or text for 24 hours</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setShowCreateOptions(false)}
            >
              <Text style={[styles.closeBtnText, { color: colors.text }]}>Cancel / रद्द करें</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Language Selection Modal Sheet */}
      {showLanguageModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowLanguageModal(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Language / भाषा चुनें</Text>

            <ScrollView contentContainerStyle={styles.modalGrid} showsVerticalScrollIndicator={false}>
              {languageOptions.map((opt) => {
                const isActive = language === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.langBtn,
                      { borderColor: colors.borderLight },
                      isActive && { backgroundColor: colors.primaryFaded, borderColor: colors.primary }
                    ]}
                    onPress={() => {
                      setLanguage(opt.key);
                      setShowLanguageModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.langLabel, { color: colors.text }]}>{opt.label}</Text>
                    {isActive && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={[styles.closeBtnText, { color: colors.text }]}>Close / बंद करें</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMiniImage: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toggleContainer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  toggleBg: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: Radius.md,
    gap: 2,
  },
  toggleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radius.sm,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
      },
    }),
  },
  toggleTabText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  storiesSection: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  storiesList: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.base,
  },
  storyItem: {
    alignItems: 'center',
    width: 72,
  },
  storyRing: {
    borderWidth: 2,
    borderRadius: 32,
    padding: 2,
  },
  storyName: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  addStoryContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  feedList: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 900,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2000,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    maxHeight: '75%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 16,
      },
      web: {
        boxShadow: '0px -4px 16px rgba(0,0,0,0.1)',
      },
    }),
  },
  modalIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'space-between',
    paddingBottom: Spacing.base,
  },
  langBtn: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 2,
  },
  langLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  closeBtn: {
    marginTop: Spacing.md,
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  createOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
  createOptionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 8,
  },
  createOptionIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createOptionLabel: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  createOptionSub: {
    fontSize: 10,
    textAlign: 'center',
  },
});
