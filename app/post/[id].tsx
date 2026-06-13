// Sadhna Health Care — Post Detail Screen
import React from 'react';
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
import { PostCard } from '@/src/components/feed/PostCard';
import { useThemeColors } from '@/src/hooks/useTheme';
import { mockPosts } from '@/src/data/mockData';
import { FontSize, Spacing } from '@/src/utils/constants';

export default function PostDetailScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const post = mockPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ color: colors.textTertiary }}>Post not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PostCard post={post} />
        
        {/* Comments placeholder */}
        <View style={styles.commentsSection}>
          <Text style={[styles.commentsTitle, { color: colors.text }]}>
            Comments ({post.comments_count})
          </Text>
          <View style={[styles.commentPlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="chatbubble-outline" size={32} color={colors.textTertiary} />
            <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
              Comments will appear here
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  scroll: { paddingVertical: Spacing.md, paddingBottom: 40 },
  commentsSection: { padding: Spacing.base },
  commentsTitle: { fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.md },
  commentPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 12,
    gap: 8,
  },
  placeholderText: { fontSize: FontSize.sm },
});
