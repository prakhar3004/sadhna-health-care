// Sadhna Health Care — Fullscreen Instagram-Style Story Slideshow Viewer
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '@/src/components/ui/Avatar';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { ChatService } from '@/src/services/chatService';
import { UserStories } from '@/src/services/storiesService';
import { formatRelativeTime } from '@/src/utils/helpers';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story

interface StoryViewerProps {
  userStoriesList: UserStories[];
  initialUserIndex: number;
  visible: boolean;
  onClose: () => void;
}

export function StoryViewer({ userStoriesList, initialUserIndex, visible, onClose }: StoryViewerProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const progressTimer = useRef<any>(null);

  const activeUserGroup = userStoriesList[userIndex];
  const activeStory = activeUserGroup?.stories[storyIndex];

  // Reset indices when modal opens
  useEffect(() => {
    if (visible) {
      setUserIndex(initialUserIndex);
      setStoryIndex(0);
      setProgress(0);
      setIsPaused(false);
      setReplyText('');
    }
  }, [visible, initialUserIndex]);

  // Handle timer ticks
  useEffect(() => {
    if (!visible || !activeStory || isPaused) {
      if (progressTimer.current) clearInterval(progressTimer.current);
      return;
    }

    const tickRate = 50; // Update progress every 50ms
    const step = (tickRate / STORY_DURATION) * 100;

    progressTimer.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + step;
      });
    }, tickRate);

    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [visible, userIndex, storyIndex, isPaused, activeStory]);

  const handleNextStory = () => {
    setProgress(0);
    if (storyIndex < activeUserGroup.stories.length - 1) {
      setStoryIndex((prev) => prev + 1);
    } else if (userIndex < userStoriesList.length - 1) {
      setUserIndex((prev) => prev + 1);
      setStoryIndex(0);
    } else {
      onClose(); // Finished all stories
    }
  };

  const handlePrevStory = () => {
    setProgress(0);
    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
    } else if (userIndex > 0) {
      setUserIndex((prev) => prev - 1);
      // Set to last story of previous user
      setStoryIndex(userStoriesList[userIndex - 1].stories.length - 1);
    } else {
      // At the very beginning, restart active story
      setStoryIndex(0);
    }
  };

  const handleTapScreen = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    const thirdWidth = SCREEN_WIDTH / 3;
    if (x < thirdWidth) {
      handlePrevStory();
    } else {
      handleNextStory();
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !currentUser || !activeUserGroup?.user) return;

    setIsPaused(true);
    const targetUser = activeUserGroup.user;
    const textToSend = replyText.trim();
    setReplyText('');

    try {
      // Create message replying to the story
      const messageContent = `Replied to your story: "${activeStory.caption || 'Photo Story'}"\n\n${textToSend}`;
      
      const convId = await ChatService.getOrCreateDirectConversation(currentUser.id, targetUser.id);
      await ChatService.sendMessage(convId, currentUser, messageContent);
      
      Alert.alert('Reply Sent! 💬', 'Your message has been sent directly to chat.', [
        {
          text: 'Go to Chat',
          onPress: () => {
            onClose();
            router.push(`/chat/${convId}` as any);
          },
        },
        {
          text: 'OK',
          onPress: () => {
            setIsPaused(false);
          },
        },
      ]);
    } catch (e: any) {
      Alert.alert('Error', 'Could not send reply.');
      setIsPaused(false);
    }
  };

  // Helper to parse linear gradients
  const renderStoryContent = () => {
    if (!activeStory) return null;

    const mediaUrl = activeStory.media_url || '';
    if (mediaUrl.startsWith('linear-gradient:')) {
      // Parse gradient params (e.g., linear-gradient:from=#14B8A6&to=#0D9488)
      let fromColor = '#14B8A6';
      let toColor = '#0D9488';
      const colorsMatch = mediaUrl.match(/from=([^&]+)&to=(.+)/);
      if (colorsMatch) {
        fromColor = colorsMatch[1];
        toColor = colorsMatch[2];
      }

      return (
        <LinearGradient colors={[fromColor, toColor]} style={styles.fullscreenContent}>
          <Text style={styles.textStoryContent}>{activeStory.caption}</Text>
        </LinearGradient>
      );
    }

    return (
      <View style={styles.fullscreenContent}>
        <Image
          source={{ uri: mediaUrl }}
          style={styles.storyImage}
          resizeMode="cover"
        />
        {activeStory.caption && (
          <View style={styles.captionOverlay}>
            <Text style={styles.captionText}>{activeStory.caption}</Text>
          </View>
        )}
      </View>
    );
  };

  if (!visible || !activeUserGroup || !activeStory) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          {/* Status Bars at the top */}
          <View style={styles.progressBarsContainer}>
            {activeUserGroup.stories.map((s, idx) => {
              let widthVal = '0%';
              if (idx < storyIndex) widthVal = '100%';
              else if (idx === storyIndex) widthVal = `${progress}%`;

              return (
                <View key={s.id} style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: widthVal as any }]} />
                </View>
              );
            })}
          </View>

          {/* Profile Header */}
          <View style={styles.header}>
            <Avatar uri={activeUserGroup.user.avatar_url} name={activeUserGroup.user.full_name} size={36} />
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{activeUserGroup.user.full_name}</Text>
              <Text style={styles.headerTime}>{formatRelativeTime(activeStory.created_at)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Interaction Tap Layer & Content */}
          <TouchableWithoutFeedback
            onPress={handleTapScreen}
            onPressIn={() => setIsPaused(true)}
            onPressOut={() => setIsPaused(false)}
          >
            <View style={styles.contentContainer}>
              {renderStoryContent()}
            </View>
          </TouchableWithoutFeedback>

          {/* Bottom Chat input (if not viewing own story) */}
          {currentUser && currentUser.id !== activeUserGroup.user.id && (
            <View style={styles.bottomBar}>
              <TextInput
                style={[styles.replyInput, { color: '#FFF', borderColor: '#FFFFFF40' }]}
                placeholder="Send a reply..."
                placeholderTextColor="#CCCCCC"
                value={replyText}
                onChangeText={setReplyText}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
              />
              {replyText.trim().length > 0 && (
                <TouchableOpacity style={styles.sendButton} onPress={handleSendReply}>
                  <Ionicons name="send" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  flex: {
    flex: 1,
  },
  progressBarsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 8,
    gap: 4,
    height: 3,
    zIndex: 10,
  },
  progressBarBg: {
    flex: 1,
    backgroundColor: '#FFFFFF40',
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: '#FFF',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    zIndex: 10,
  },
  headerInfo: {
    marginLeft: 10,
    flex: 1,
  },
  headerName: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  headerTime: {
    color: '#CCC',
    fontSize: 11,
    marginTop: 1,
  },
  closeButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenContent: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStoryContent: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF15',
  },
  captionText: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
    paddingTop: 8,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 13,
    backgroundColor: '#FFFFFF15',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
