// Sadhna Health Care — Create Post Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/src/components/ui/Avatar';
import { RoleBadge } from '@/src/components/ui/RoleBadge';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { PostsService } from '@/src/services/postsService';
import { PostType, PostTypeConfig, FontSize, Spacing, Radius } from '@/src/utils/constants';

export default function CreatePostScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ prefilledContent?: string; prefilledType?: PostType }>();
  const user = useAuthStore((s) => s.user);
  const [content, setContent] = useState(params.prefilledContent || '');
  
  // Filter post types based on user role
  const allowedPostTypes = React.useMemo(() => {
    if (!user) return [];
    return (Object.entries(PostTypeConfig) as [PostType, typeof PostTypeConfig[PostType]][])
      .filter(([_, config]) => config.allowedRoles.includes(user.role as any));
  }, [user]);

  const [postType, setPostType] = useState<PostType>(() => {
    if (params.prefilledType && Object.keys(PostTypeConfig).includes(params.prefilledType)) {
      return params.prefilledType;
    }
    if (user) {
      const allowed = (Object.entries(PostTypeConfig) as [PostType, typeof PostTypeConfig[PostType]][])
        .filter(([_, config]) => config.allowedRoles.includes(user.role as any));
      if (allowed.length > 0) return allowed[0][0];
    }
    return 'question';
  });

  const [visibility, setVisibility] = useState<'public' | 'doctors_only' | 'care_team'>('public');
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Post', 'Please write something to share.');
      return;
    }
    if (!user || posting) return;

    setPosting(true);
    try {
      await PostsService.createPost(user, {
        content: content.trim(),
        post_type: postType,
        visibility,
      });
      Alert.alert('Post Created! ✅', 'Your post has been shared with the community.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not create the post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Post</Text>
        <TouchableOpacity
          style={[
            styles.postBtn,
            { backgroundColor: content.trim() ? colors.primary : colors.surfaceSecondary },
          ]}
          onPress={handlePost}
          disabled={!content.trim() || posting}
        >
          <Text style={[styles.postBtnText, { color: content.trim() ? '#FFF' : colors.textTertiary }]}>
            {posting ? 'Posting…' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* User Info */}
        <View style={styles.userRow}>
          <Avatar uri={user.avatar_url} name={user.full_name} size={44} />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{user.full_name}</Text>
            <RoleBadge role={user.role} size="sm" />
          </View>
        </View>

        {/* Post Type Selector */}
        <Text style={[styles.sectionLabel, { color: colors.text, marginBottom: 8 }]}>Post Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
          {allowedPostTypes.map(([type, config]) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeChip,
                {
                  backgroundColor: postType === type ? config.color + '20' : colors.surfaceSecondary,
                  borderColor: postType === type ? config.color : colors.border,
                },
              ]}
              onPress={() => setPostType(type)}
            >
              <Text style={{ fontSize: 14 }}>{config.emoji}</Text>
              <Ionicons name={config.icon as any} size={14} color={postType === type ? config.color : colors.textTertiary} />
              <Text
                style={[
                  styles.typeChipText,
                  { color: postType === type ? config.color : colors.textTertiary },
                ]}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected Post Type Description */}
        {PostTypeConfig[postType] && (
          <View style={[styles.descriptionCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
              {PostTypeConfig[postType].emoji} <Text style={{ fontWeight: '700' }}>{PostTypeConfig[postType].label}:</Text> {PostTypeConfig[postType].description}
            </Text>
          </View>
        )}

        {/* Content Input */}
        <TextInput
          style={[styles.contentInput, { color: colors.text }]}
          placeholder="Share your thoughts, health tips, or medical insights..."
          placeholderTextColor={colors.textTertiary}
          multiline
          value={content}
          onChangeText={setContent}
          autoFocus
          textAlignVertical="top"
        />

        {/* Character Count */}
        <Text style={[styles.charCount, { color: colors.textTertiary }]}>
          {content.length}/2000
        </Text>

        {/* Visibility */}
        <View style={[styles.visibilitySection, { borderColor: colors.divider }]}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Visibility</Text>
          <View style={styles.visibilityOptions}>
            {[
              { key: 'public' as const, label: 'Everyone', icon: 'globe-outline' },
              { key: 'doctors_only' as const, label: 'Doctors Only', icon: 'medical' },
              { key: 'care_team' as const, label: 'Care Team', icon: 'people' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.visibilityOption,
                  {
                    backgroundColor: visibility === option.key ? colors.primaryFaded : colors.surfaceSecondary,
                    borderColor: visibility === option.key ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setVisibility(option.key)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={18}
                  color={visibility === option.key ? colors.primary : colors.textTertiary}
                />
                <Text
                  style={[
                    styles.visibilityLabel,
                    { color: visibility === option.key ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Attachments */}
        <View style={styles.attachments}>
          <TouchableOpacity style={[styles.attachBtn, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="image-outline" size={22} color={colors.primary} />
            <Text style={[styles.attachLabel, { color: colors.textSecondary }]}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.attachBtn, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="document-outline" size={22} color={colors.primary} />
            <Text style={[styles.attachLabel, { color: colors.textSecondary }]}>Document</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.attachBtn, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="location-outline" size={22} color={colors.primary} />
            <Text style={[styles.attachLabel, { color: colors.textSecondary }]}>Location</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  postBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: Radius.md,
  },
  postBtnText: { fontSize: FontSize.base, fontWeight: '700' },
  scroll: { padding: Spacing.base },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.base },
  userInfo: { marginLeft: Spacing.md, gap: 4 },
  userName: { fontSize: FontSize.base, fontWeight: '700' },
  typeSelector: { marginBottom: Spacing.base },
  descriptionCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.base,
  },
  descriptionText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: Spacing.sm,
    gap: 5,
  },
  typeChipText: { fontSize: FontSize.xs, fontWeight: '600' },
  contentInput: {
    fontSize: FontSize.md,
    lineHeight: 24,
    minHeight: 180,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: FontSize.xs, textAlign: 'right', marginTop: Spacing.sm },
  visibilitySection: { borderTopWidth: 1, paddingTop: Spacing.base, marginTop: Spacing.base },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.md },
  visibilityOptions: { flexDirection: 'row', gap: Spacing.sm },
  visibilityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 6,
  },
  visibilityLabel: { fontSize: FontSize.xs, fontWeight: '600' },
  attachments: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  attachBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.base,
    borderRadius: Radius.md,
    gap: 6,
  },
  attachLabel: { fontSize: FontSize.xs, fontWeight: '500' },
});
