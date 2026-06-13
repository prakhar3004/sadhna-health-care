// Sadhna Health Care — Chat Service: conversations, messages, realtime (dual-mode)
import { supabase } from '@/src/lib/supabase';
import { isDemoMode } from '@/src/lib/config';
import { Conversation, Message, Profile } from '@/src/types';
import { mockConversations, mockProfiles } from '@/src/data/mockData';

// ─── Demo in-memory message store ───────────────────────────────
const demoMessages: Record<string, Message[]> = {};

const seedDemoThread = (conversationId: string, currentUserId: string): Message[] => {
  const conv = mockConversations.find((c) => c.id === conversationId);
  if (!conv) return [];
  const me = conv.participants.find((p) => p.id === currentUserId) || conv.participants[0];
  const other = conv.participants.find((p) => p.id !== currentUserId) || conv.participants[0];
  const thread: Message[] = [
    { id: `${conversationId}_s1`, conversation_id: conversationId, sender_id: other.id, sender: other, content: 'Hello! How are you feeling today?', media_url: null, message_type: 'text', created_at: '2024-06-13T09:00:00Z' },
    { id: `${conversationId}_s2`, conversation_id: conversationId, sender_id: me.id, sender: me, content: "Hi! I'm doing much better, thank you for checking in 😊", media_url: null, message_type: 'text', created_at: '2024-06-13T09:05:00Z' },
    { id: `${conversationId}_s3`, conversation_id: conversationId, sender_id: other.id, sender: other, content: 'That\'s great to hear! Keep following the plan and reach out anytime.', media_url: null, message_type: 'text', created_at: '2024-06-13T09:10:00Z' },
    ...(conv.last_message ? [conv.last_message] : []),
  ];
  return thread;
};

const getDemoThread = (conversationId: string, currentUserId: string): Message[] => {
  if (!demoMessages[conversationId]) demoMessages[conversationId] = seedDemoThread(conversationId, currentUserId);
  return demoMessages[conversationId];
};

/** A live subscription handle the caller unsubscribes when the screen unmounts. */
export interface Subscription {
  unsubscribe: () => void;
}

export const ChatService = {
  /** Conversations the current user participates in, newest activity first. */
  async fetchConversations(currentUserId: string): Promise<Conversation[]> {
    if (isDemoMode()) {
      return mockConversations.filter((c) => c.participants.some((p) => p.id === currentUserId));
    }

    // Conversations the user is a member of.
    const { data: memberships, error: mErr } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', currentUserId);
    if (mErr) throw mErr;

    const convIds = (memberships || []).map((m: any) => m.conversation_id);
    if (convIds.length === 0) return [];
    const lastReadMap = new Map<string, string>();
    (memberships || []).forEach((m: any) => lastReadMap.set(m.conversation_id, m.last_read_at));

    const { data: convs, error: cErr } = await supabase
      .from('conversations')
      .select('*, participants:conversation_participants(profile:profiles(*))')
      .in('id', convIds)
      .order('updated_at', { ascending: false });
    if (cErr) throw cErr;

    // Latest message + unread count per conversation.
    const result: Conversation[] = [];
    for (const c of convs || []) {
      const { data: lastMsgs } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(*)')
        .eq('conversation_id', c.id)
        .order('created_at', { ascending: false })
        .limit(1);
      const lastMessage = lastMsgs && lastMsgs[0] ? mapMessage(lastMsgs[0]) : null;

      const lastRead = lastReadMap.get(c.id);
      let unread = 0;
      if (lastRead) {
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', c.id)
          .gt('created_at', lastRead)
          .neq('sender_id', currentUserId);
        unread = count || 0;
      }

      result.push({
        id: c.id,
        type: c.type,
        name: c.name,
        participants: (c.participants || []).map((p: any) => p.profile as Profile),
        last_message: lastMessage,
        unread_count: unread,
        updated_at: c.updated_at,
      });
    }
    return result;
  },

  async fetchConversation(conversationId: string, currentUserId: string): Promise<Conversation | null> {
    if (isDemoMode()) return mockConversations.find((c) => c.id === conversationId) || null;
    const all = await this.fetchConversations(currentUserId);
    return all.find((c) => c.id === conversationId) || null;
  },

  async fetchMessages(conversationId: string, currentUserId: string): Promise<Message[]> {
    if (isDemoMode()) return [...getDemoThread(conversationId, currentUserId)];

    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapMessage);
  },

  async sendMessage(conversationId: string, sender: Profile, content: string): Promise<Message> {
    if (isDemoMode()) {
      const msg: Message = {
        id: `m_${Date.now()}`,
        conversation_id: conversationId,
        sender_id: sender.id,
        sender,
        content,
        media_url: null,
        message_type: 'text',
        created_at: new Date().toISOString(),
      };
      getDemoThread(conversationId, sender.id).push(msg);
      return msg;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: sender.id, content, message_type: 'text' })
      .select('*, sender:profiles!messages_sender_id_fkey(*)')
      .single();
    if (error) throw error;
    return mapMessage(data);
  },

  /** Mark a conversation read up to now (clears its unread badge). */
  async markRead(conversationId: string, currentUserId: string): Promise<void> {
    if (isDemoMode()) return;
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId);
  },

  /** Find an existing 1:1 conversation with `otherUserId`, or create one. */
  async getOrCreateDirectConversation(currentUserId: string, otherUserId: string): Promise<string> {
    if (isDemoMode()) {
      const existing = mockConversations.find(
        (c) => c.type === 'direct' && c.participants.some((p) => p.id === currentUserId) && c.participants.some((p) => p.id === otherUserId)
      );
      return existing ? existing.id : `c_demo_${otherUserId}`;
    }

    const { data: existing } = await supabase.rpc('find_direct_conversation', {
      p_user_a: currentUserId,
      p_user_b: otherUserId,
    });
    if (existing) return existing as string;

    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({ type: 'direct', created_by: currentUserId })
      .select('id')
      .single();
    if (error) throw error;

    const { error: pErr } = await supabase.from('conversation_participants').insert([
      { conversation_id: conv.id, user_id: currentUserId },
      { conversation_id: conv.id, user_id: otherUserId },
    ]);
    if (pErr) throw pErr;
    return conv.id;
  },

  /**
   * Subscribe to new messages in a conversation (live chat). In demo mode this
   * is a no-op handle. In live mode it streams Postgres INSERTs over Realtime,
   * hydrating the sender profile before invoking `onMessage`.
   */
  subscribeToMessages(
    conversationId: string,
    onMessage: (message: Message) => void
  ): Subscription {
    if (isDemoMode()) return { unsubscribe: () => {} };

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          const row: any = payload.new;
          const { data: sender } = await supabase.from('profiles').select('*').eq('id', row.sender_id).maybeSingle();
          onMessage({
            id: row.id,
            conversation_id: row.conversation_id,
            sender_id: row.sender_id,
            sender: (sender as Profile) || ({ id: row.sender_id } as Profile),
            content: row.content,
            media_url: row.media_url,
            message_type: row.message_type,
            created_at: row.created_at,
          });
        }
      )
      .subscribe();

    return { unsubscribe: () => { supabase.removeChannel(channel); } };
  },
};

const mapMessage = (row: any): Message => ({
  id: row.id,
  conversation_id: row.conversation_id,
  sender_id: row.sender_id,
  sender: row.sender as Profile,
  content: row.content,
  media_url: row.media_url,
  message_type: row.message_type,
  created_at: row.created_at,
});
