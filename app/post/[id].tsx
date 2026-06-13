// Sadhna Health Care — Post Detail Screen
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PostCard } from '@/src/components/feed/PostCard';
import { Avatar } from '@/src/components/ui/Avatar';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { PostsService } from '@/src/services/postsService';
import { Post, Comment } from '@/src/types';
import { formatRelativeTime } from '@/src/utils/helpers';
import { FontSize, Spacing, Radius } from '@/src/utils/constants';

export default function PostDetailScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const scrollRef = useRef<ScrollView>(null);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    let active = true;
    (async () => {
      try {
        const [p, c] = await Promise.all([
          PostsService.fetchPost(id, user.id),
          PostsService.fetchComments(id),
        ]);
        if (!active) return;
        setPost(p);
        setComments(c);
      } catch (e) {
        console.warn('Failed to load post:', e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, user?.id]);

  const handleAddComment = useCallback(async () => {
    const text = commentText.trim();
    if (!text || !user || !id || sending) return;
    setSending(true);
    setCommentText('');
    try {
      const comment = await PostsService.addComment(id, user, text);
      setComments((prev) => [...prev, comment]);
      setPost((prev) => (prev ? { ...prev, comments_count: prev.comments_count + 1 } : prev));
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.warn('Failed to add comment:', e);
      setCommentText(text);
    } finally {
      setSending(false);
    }
  }, [commentText, user, id, sending]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <PostCard
            post={post}
            onReact={(postId, reaction) => {
              if (user) PostsService.setReaction(postId, user.id, reaction).catch(() => {});
            }}
            onBookmark={(postId, bookmarked) => {
              if (user) PostsService.toggleBookmark(postId, user.id, bookmarked).catch(() => {});
            }}
          />

          {/* Comments */}
          <View style={styles.commentsSection}>
            <Text style={[styles.commentsTitle, { color: colors.text }]}>
              Comments ({post.comments_count})
            </Text>

            {comments.length === 0 ? (
              <View style={[styles.commentPlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
                <Ionicons name="chatbubble-outline" size={32} color={colors.textTertiary} />
                <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                  Be the first to comment
                </Text>
              </View>
            ) : (
              comments.map((c) => (
                <View key={c.id} style={styles.commentRow}>
                  <Avatar uri={c.author.avatar_url} name={c.author.full_name} size={36} />
                  <View style={[styles.commentBubble, { backgroundColor: colors.surfaceSecondary }]}>
                    <View style={styles.commentHeader}>
                      <Text style={[styles.commentAuthor, { color: colors.text }]} numberOfLines={1}>
                        {c.author.full_name}
                      </Text>
                      <Text style={[styles.commentTime, { color: colors.textTertiary }]}>
                        {formatRelativeTime(c.created_at)}
                      </Text>
                    </View>
                    <Text style={[styles.commentContent, { color: colors.textSecondary }]}>{c.content}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Comment input */}
        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={[styles.inputContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Write a comment..."
              placeholderTextColor={colors.textTertiary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: commentText.trim() ? colors.primary : colors.surfaceSecondary }]}
            onPress={handleAddComment}
            disabled={!commentText.trim() || sending}
          >
            <Ionicons name="send" size={18} color={commentText.trim() ? '#FFF' : colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
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
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  commentBubble: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  commentAuthor: { fontSize: FontSize.sm, fontWeight: '700', flex: 1 },
  commentTime: { fontSize: 10, marginLeft: 6 },
  commentContent: { fontSize: FontSize.sm, lineHeight: 19 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    maxHeight: 100,
  },
  input: {
    fontSize: FontSize.base,
    paddingVertical: 6,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
