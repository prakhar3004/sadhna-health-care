// Sadhna Health Care — PostCard Component
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/src/hooks/useTheme';
import { Avatar } from '@/src/components/ui/Avatar';
import { RoleBadge } from '@/src/components/ui/RoleBadge';
import { Post } from '@/src/types';
import { useLanguageStore } from '@/src/store/languageStore';
import { translatePost, getLanguageName } from '@/src/utils/postTranslator';
import { PostTypeConfig, ReactionType, ReactionConfig } from '@/src/utils/constants';
import { formatRelativeTime, formatCount } from '@/src/utils/helpers';
import { Radius, FontSize, Spacing } from '@/src/utils/constants';

interface PostCardProps {
  post: Post;
  onReact?: (postId: string, reaction: ReactionType | null) => void;
  onComment?: (postId: string) => void;
  onBookmark?: (postId: string, bookmarked: boolean) => void;
  onShare?: (postId: string) => void;
}

export function PostCard({ post, onReact, onComment, onBookmark, onShare }: PostCardProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(post.user_reaction || null);
  const [reactions, setReactions] = useState<Record<ReactionType, number>>(
    post.reactions || { himmat: 0, support: 0, celebrate: 0, helpful: 0, love: 0 }
  );
  const [showReactions, setShowReactions] = useState(false);
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked);

  // Post translation states
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const postTypeConfig = PostTypeConfig[post.post_type];

  const handleReactionSelect = (type: ReactionType) => {
    setReactions((prev) => {
      const updated = { ...prev };
      // Remove previous reaction from count if it existed
      if (userReaction) {
        updated[userReaction] = Math.max(0, (updated[userReaction] || 0) - 1);
      }
      // Add new reaction to count
      updated[type] = (updated[type] || 0) + 1;
      return updated;
    });
    setUserReaction(type);
    setShowReactions(false);
    onReact?.(post.id, type);
  };

  const handleToggleReact = () => {
    if (userReaction) {
      // Deselect existing reaction
      setReactions((prev) => {
        const updated = { ...prev };
        updated[userReaction] = Math.max(0, (updated[userReaction] || 0) - 1);
        return updated;
      });
      setUserReaction(null);
      onReact?.(post.id, null);
    } else {
      // Open reactions popup immediately so they can choose
      setShowReactions(!showReactions);
    }
  };

  const handleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    onBookmark?.(post.id, next);
  };

  const handleTranslateToggle = () => {
    if (isTranslated) {
      setIsTranslated(false);
    } else {
      setIsTranslating(true);
      setTimeout(() => {
        const result = translatePost(post.id, post.content, language);
        setTranslatedText(result.translatedText);
        setSourceLanguage(result.sourceLanguage);
        setIsTranslated(true);
        setIsTranslating(false);
      }, 600); // Simulated delay
    }
  };

  const totalReactionsCount = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  // Get top 3 reactions with count > 0, sorted by frequency
  const activeReactions = (Object.keys(ReactionConfig) as ReactionType[])
    .filter((type) => (reactions[type] || 0) > 0)
    .sort((a, b) => (reactions[b] || 0) - (reactions[a] || 0))
    .slice(0, 3);

  const showTranslateButton = language !== 'en';

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.authorInfo}
          onPress={() => router.push(`/user/${post.author_id}` as any)}
          activeOpacity={0.7}
        >
          <Avatar
            uri={post.author.avatar_url}
            name={post.author.full_name}
            size={46}
            showOnline
            isOnline={post.author.is_online}
          />
          <View style={styles.authorText}>
            <View style={styles.nameRow}>
              <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
                {post.author.full_name}
              </Text>
              {post.author.is_verified && (
                <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={{ marginLeft: 4 }} />
              )}
            </View>
            <View style={styles.metaRow}>
              <RoleBadge role={post.author.role} size="sm" showLabel={false} />
              <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                {post.author.role === 'doctor' && post.author.specialization
                  ? `${post.author.specialization} · `
                  : ''}
                {formatRelativeTime(post.created_at)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Post Type Badge */}
      {postTypeConfig && (
        <View style={[styles.postTypeBadge, { backgroundColor: postTypeConfig.color + '15' }]}>
          <Text style={styles.postTypeEmoji}>{postTypeConfig.emoji}</Text>
          <Ionicons name={postTypeConfig.icon as any} size={13} color={postTypeConfig.color} />
          <Text style={[styles.postTypeLabel, { color: postTypeConfig.color }]}>
            {postTypeConfig.label}
          </Text>
        </View>
      )}

      {/* Visibility indicator */}
      {post.visibility !== 'public' && (
        <View style={[styles.visibilityBadge, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons
            name={post.visibility === 'doctors_only' ? 'medical' : 'people'}
            size={12}
            color={colors.textTertiary}
          />
          <Text style={[styles.visibilityText, { color: colors.textTertiary }]}>
            {post.visibility === 'doctors_only' ? 'Doctors Only' : 'Care Team'}
          </Text>
        </View>
      )}

      {/* Content */}
      <Text style={[styles.content, { color: colors.text }]}>
        {isTranslating ? '...' : isTranslated ? translatedText : post.content}
      </Text>

      {/* Translation Button */}
      {showTranslateButton && (
        <TouchableOpacity
          style={styles.translateButton}
          onPress={handleTranslateToggle}
          disabled={isTranslating}
          activeOpacity={0.7}
        >
          {isTranslating ? (
            <Text style={[styles.translateText, { color: colors.textTertiary }]}>अनुवाद हो रहा है / Translating...</Text>
          ) : (
            <View style={styles.translationInfoRow}>
              <Text style={[styles.translateText, { color: colors.primary }]}>
                {isTranslated
                  ? language === 'hi' ? 'मूल देखें' : 'See Original'
                  : language === 'hi' ? 'अनुवाद देखें' : 'See Translation'}
              </Text>
              {isTranslated && (
                <Text style={[styles.translatedBadge, { color: colors.textTertiary }]}>
                  (Translated from {sourceLanguage})
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Media (if any) */}
      {post.media_urls && post.media_urls.length > 0 && (
        <View style={styles.mediaContainer}>
          {post.media_urls.map((url, index) => (
            <Image
              key={index}
              source={{ uri: url }}
              style={styles.media}
              resizeMode="cover"
            />
          ))}
        </View>
      )}

      {/* Stats */}
      <View style={[styles.stats, { borderColor: colors.divider }]}>
        <View style={styles.statsRow}>
          {activeReactions.length > 0 ? (
            <View style={styles.reactionsStatContainer}>
              <View style={styles.reactionEmojisRow}>
                {activeReactions.map((type, idx) => (
                  <Text
                    key={type}
                    style={[
                      styles.reactionStatEmoji,
                      {
                        zIndex: 10 - idx,
                        marginLeft: idx > 0 ? -6 : 0,
                      },
                    ]}
                  >
                    {ReactionConfig[type].emoji}
                  </Text>
                ))}
              </View>
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {formatCount(totalReactionsCount)} reactions
              </Text>
            </View>
          ) : (
            <Text style={[styles.statText, { color: colors.textTertiary }]}>
              Be the first to react
            </Text>
          )}

          <TouchableOpacity onPress={() => onComment?.(post.id)}>
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {formatCount(post.comments_count)} comments
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleToggleReact}
          onLongPress={() => setShowReactions(true)}
          activeOpacity={0.6}
        >
          {userReaction ? (
            <Text style={styles.activeEmojiIcon}>{ReactionConfig[userReaction].emoji}</Text>
          ) : (
            <Ionicons
              name="heart-outline"
              size={22}
              color={colors.textTertiary}
            />
          )}
          <Text
            style={[
              styles.actionText,
              {
                color: userReaction
                  ? ReactionConfig[userReaction].color
                  : colors.textSecondary,
                fontWeight: userReaction ? '700' : '500',
              },
            ]}
          >
            {userReaction ? ReactionConfig[userReaction].label : 'React'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment?.(post.id)}
          activeOpacity={0.6}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.textTertiary} />
          <Text style={[styles.actionText, { color: colors.textTertiary }]}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => onShare?.(post.id)} activeOpacity={0.6}>
          <Ionicons name="share-social-outline" size={20} color={colors.textTertiary} />
          <Text style={[styles.actionText, { color: colors.textTertiary }]}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleBookmark} activeOpacity={0.6}>
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={bookmarked ? colors.primary : colors.textTertiary}
          />
        </TouchableOpacity>
      </View>

      {/* Reactions Popover */}
      {showReactions && (
        <View
          style={[
            styles.reactionsPopup,
            {
              backgroundColor: colors.surfaceElevated || colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {(Object.keys(ReactionConfig) as ReactionType[]).map((type) => {
            const config = ReactionConfig[type];
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.reactionOption,
                  userReaction === type && { backgroundColor: colors.surfaceSecondary },
                ]}
                onPress={() => handleReactionSelect(type)}
                activeOpacity={0.7}
              >
                <Text style={styles.reactionEmoji}>{config.emoji}</Text>
                <Text style={[styles.reactionLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    position: 'relative', // Necessary for absolute reactions popup positioning
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
  },
  timestamp: {
    fontSize: FontSize.xs,
  },
  moreButton: {
    padding: 4,
  },
  postTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    gap: 5,
  },
  postTypeEmoji: {
    fontSize: 13,
  },
  postTypeLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    gap: 4,
  },
  visibilityText: {
    fontSize: 10,
    fontWeight: '500',
  },
  content: {
    fontSize: FontSize.base,
    lineHeight: 22,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  translateButton: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },
  translateText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  translationInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  translatedBadge: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  mediaContainer: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: Radius.md,
  },
  stats: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reactionsStatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reactionEmojisRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionStatEmoji: {
    fontSize: 13,
  },
  statText: {
    fontSize: FontSize.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 5,
  },
  activeEmojiIcon: {
    fontSize: 18,
  },
  actionText: {
    fontSize: FontSize.sm,
  },
  reactionsPopup: {
    position: 'absolute',
    bottom: 50,
    left: Spacing.base,
    flexDirection: 'row',
    borderRadius: Radius.xl,
    padding: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    gap: 4,
    zIndex: 999,
  },
  reactionOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.md,
    width: 50,
  },
  reactionEmoji: {
    fontSize: 20,
  },
  reactionLabel: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
});
