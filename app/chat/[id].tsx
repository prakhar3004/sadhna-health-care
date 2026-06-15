// Sadhna Health Care — Chat Conversation Screen
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/src/components/ui/Avatar';
import { RoleBadge } from '@/src/components/ui/RoleBadge';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { ChatService } from '@/src/services/chatService';
import { Conversation, Message } from '@/src/types';
import { formatTime, formatActiveTime } from '@/src/utils/helpers';
import { FontSize, Spacing, Radius } from '@/src/utils/constants';

export default function ChatScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const otherUser =
    conversation?.participants.find((p) => p.id !== user?.id) || conversation?.participants[0];

  // Load the conversation + history, mark it read, and stream live messages.
  useEffect(() => {
    if (!id || !user) return;
    let active = true;

    (async () => {
      try {
        const [conv, history] = await Promise.all([
          ChatService.fetchConversation(id, user.id),
          ChatService.fetchMessages(id, user.id),
        ]);
        if (!active) return;
        setConversation(conv);
        setMessages(history);
        ChatService.markRead(id, user.id).catch(() => {});
      } catch (e) {
        console.warn('Failed to load conversation:', e);
      }
    })();

    const sub = ChatService.subscribeToMessages(id, (msg) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    });

    return () => {
      active = false;
      sub.unsubscribe();
    };
  }, [id, user?.id]);

  const sendMessage = useCallback(async () => {
    const text = messageText.trim();
    if (!text || !user || !id) return;
    setMessageText('');
    try {
      const sent = await ChatService.sendMessage(id, user, text);
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.warn('Failed to send message:', e);
      setMessageText(text); // restore the draft on failure
    }
  }, [messageText, user, id]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === user?.id;

    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        {!isMe && (
          <Avatar uri={item.sender.avatar_url} name={item.sender.full_name} size={32} />
        )}
        <View
          style={[
            styles.messageBubble,
            isMe
              ? [styles.bubbleMe, { backgroundColor: colors.primary }]
              : [styles.bubbleOther, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }],
          ]}
        >
          <Text style={[styles.messageText, { color: isMe ? '#FFF' : colors.text }]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textTertiary }]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  if (!otherUser) return null;

  // Compute active status
  const otherUserOnline = otherUser.is_online;
  const isOnlineResolved = otherUserOnline || (otherUser.last_seen_at && (Date.now() - new Date(otherUser.last_seen_at).getTime() < 5 * 60 * 1000));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Chat Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerUser} onPress={() => router.push(`/user/${otherUser.id}` as any)}>
          <Avatar uri={otherUser.avatar_url} name={otherUser.full_name} size={40} showOnline isOnline={otherUser.is_online} lastSeenAt={otherUser.last_seen_at} />
          <View style={styles.headerUserInfo}>
            <View style={styles.headerNameRow}>
              <Text style={[styles.headerName, { color: colors.text }]}>{otherUser.full_name}</Text>
              <RoleBadge role={otherUser.role} size="sm" showLabel={false} />
            </View>
            <Text style={[styles.headerStatus, { color: isOnlineResolved ? colors.success : colors.textTertiary }]}>
              {formatActiveTime(otherUser.is_online, otherUser.last_seen_at)}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callBtn} onPress={() => Alert.alert('Video Call', 'Video calling is coming soon.')}>
          <Ionicons name="videocam-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.callBtn} onPress={() => Alert.alert('Voice Call', 'Voice calling is coming soon.')}>
          <Ionicons name="call-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <TouchableOpacity style={styles.attachButton} onPress={() => Alert.alert('Attachments', 'Photo & file sharing is coming soon.')}>
            <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
          </TouchableOpacity>
          <View style={[styles.inputContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Type a message..."
              placeholderTextColor={colors.textTertiary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.emojiButton} onPress={() => setMessageText((prev) => prev + '😊')}>
              <Ionicons name="happy-outline" size={22} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: messageText.trim() ? colors.primary : colors.surfaceSecondary }]}
            onPress={sendMessage}
            disabled={!messageText.trim()}
          >
            <Ionicons name="send" size={18} color={messageText.trim() ? '#FFF' : colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerUser: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 4 },
  headerUserInfo: { marginLeft: Spacing.sm },
  headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerName: { fontSize: FontSize.base, fontWeight: '700' },
  headerStatus: { fontSize: FontSize.xs },
  callBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  messagesList: {
    padding: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
    gap: 8,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: FontSize.base,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    maxHeight: 100,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    paddingVertical: 6,
  },
  emojiButton: {
    padding: 4,
    marginLeft: 4,
    marginBottom: 2,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
