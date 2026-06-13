// Sadhna Health Care — Notifications Service (dual-mode)
import { supabase } from '@/src/lib/supabase';
import { isDemoMode } from '@/src/lib/config';
import { AppNotification, Profile } from '@/src/types';
import { mockNotifications } from '@/src/data/mockData';

let demoNotifications: AppNotification[] | null = null;
const getDemoNotifications = (): AppNotification[] => {
  if (!demoNotifications) demoNotifications = mockNotifications.map((n) => ({ ...n }));
  return demoNotifications;
};

export const NotificationsService = {
  async fetchNotifications(currentUserId: string): Promise<AppNotification[]> {
    if (isDemoMode()) {
      return getDemoNotifications().filter((n) => n.recipient_id === currentUserId);
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*, actor:profiles!notifications_actor_id_fkey(*)')
      .eq('recipient_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      recipient_id: row.recipient_id,
      actor_id: row.actor_id,
      actor: row.actor as Profile,
      type: row.type,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      title: row.title,
      body: row.body,
      is_read: row.is_read,
      created_at: row.created_at,
    }));
  },

  async unreadCount(currentUserId: string): Promise<number> {
    if (isDemoMode()) {
      return getDemoNotifications().filter((n) => n.recipient_id === currentUserId && !n.is_read).length;
    }
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', currentUserId)
      .eq('is_read', false);
    if (error) throw error;
    return count || 0;
  },

  async markRead(notificationId: string): Promise<void> {
    if (isDemoMode()) {
      const n = getDemoNotifications().find((x) => x.id === notificationId);
      if (n) n.is_read = true;
      return;
    }
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    if (error) throw error;
  },

  async markAllRead(currentUserId: string): Promise<void> {
    if (isDemoMode()) {
      getDemoNotifications().forEach((n) => {
        if (n.recipient_id === currentUserId) n.is_read = true;
      });
      return;
    }
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', currentUserId)
      .eq('is_read', false);
    if (error) throw error;
  },
};
