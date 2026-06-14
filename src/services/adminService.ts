// Sadhna Health Care — Admin Service (dual-mode).
// Backed by the admin RLS policies + broadcast RPC. Only an admin session can
// actually mutate; the UI is only reachable by admins.
import { supabase } from '@/src/lib/supabase';
import { isDemoMode } from '@/src/lib/config';
import { Profile, Post } from '@/src/types';
import { UserRole } from '@/src/utils/constants';
import { mockProfiles, mockPosts } from '@/src/data/mockData';

export interface AdminStats {
  total_users: number;
  doctors: number;
  caregivers: number;
  patients: number;
  admins: number;
  posts: number;
  suspended: number;
}

export const AdminService = {
  async getStats(): Promise<AdminStats> {
    if (isDemoMode()) {
      return {
        total_users: mockProfiles.length,
        doctors: mockProfiles.filter((p) => p.role === 'doctor').length,
        caregivers: mockProfiles.filter((p) => p.role === 'caregiver').length,
        patients: mockProfiles.filter((p) => p.role === 'patient').length,
        admins: 0,
        posts: mockPosts.length,
        suspended: 0,
      };
    }

    const countOf = async (col: string, val: string) =>
      (await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq(col, val)).count || 0;

    const [total, doctors, caregivers, patients, admins, suspended, posts] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      countOf('role', 'doctor'),
      countOf('role', 'caregiver'),
      countOf('role', 'patient'),
      countOf('role', 'admin'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_suspended', true),
      supabase.from('posts').select('id', { count: 'exact', head: true }),
    ]);

    return {
      total_users: total.count || 0,
      doctors,
      caregivers,
      patients,
      admins,
      posts: posts.count || 0,
      suspended: suspended.count || 0,
    };
  },

  async listUsers(query = '', role: UserRole | 'all' = 'all'): Promise<Profile[]> {
    const q = query.trim();
    if (isDemoMode()) {
      const lower = q.toLowerCase();
      return mockProfiles
        .filter((p) => (role === 'all' ? true : p.role === role))
        .filter((p) => !lower || p.full_name.toLowerCase().includes(lower) || p.username.toLowerCase().includes(lower));
    }

    let builder = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
    if (role !== 'all') builder = builder.eq('role', role);
    if (q) builder = builder.or(`full_name.ilike.%${q}%,username.ilike.%${q}%`);
    const { data, error } = await builder;
    if (error) throw error;
    return (data || []) as Profile[];
  },

  async setVerified(userId: string, isVerified: boolean): Promise<void> {
    if (isDemoMode()) return;
    const { error } = await supabase.from('profiles').update({ is_verified: isVerified }).eq('id', userId);
    if (error) throw error;
  },

  async setSuspended(userId: string, isSuspended: boolean): Promise<void> {
    if (isDemoMode()) return;
    const { error } = await supabase.from('profiles').update({ is_suspended: isSuspended }).eq('id', userId);
    if (error) throw error;
  },

  async setRole(userId: string, role: UserRole): Promise<void> {
    if (isDemoMode()) return;
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (error) throw error;
  },

  async deleteUser(userId: string): Promise<void> {
    if (isDemoMode()) return;
    // Removes the public profile (and cascades their content). The auth row is
    // left untouched — without a profile it cannot use the app.
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
  },

  // ─── Content moderation ─────────────────────────────────────────
  async listRecentPosts(limit = 50): Promise<Post[]> {
    if (isDemoMode()) return mockPosts.slice(0, limit).map((p) => ({ ...p }));

    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      author_id: row.author_id,
      author: row.author as Profile,
      content: row.content,
      media_urls: row.media_urls || [],
      post_type: row.post_type,
      visibility: row.visibility,
      likes_count: row.likes_count ?? 0,
      reactions: row.reactions || { himmat: 0, support: 0, celebrate: 0, helpful: 0, love: 0 },
      user_reaction: null,
      comments_count: row.comments_count ?? 0,
      is_liked: false,
      is_bookmarked: false,
      created_at: row.created_at,
    }));
  },

  async deletePost(postId: string): Promise<void> {
    if (isDemoMode()) return;
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) throw error;
  },

  // ─── Broadcast ──────────────────────────────────────────────────
  async broadcast(title: string, body: string): Promise<void> {
    if (isDemoMode()) return;
    const { error } = await supabase.rpc('broadcast_announcement', { p_title: title, p_body: body });
    if (error) throw error;
  },
};
