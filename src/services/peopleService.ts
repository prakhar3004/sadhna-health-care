// Sadhna Health Care — People Service: search, profiles, follow (dual-mode)
import { supabase } from '@/src/lib/supabase';
import { isDemoMode } from '@/src/lib/config';
import { Post, Profile } from '@/src/types';
import { UserRole } from '@/src/utils/constants';
import { mockProfiles, mockPosts } from '@/src/data/mockData';

// Demo follow state: set of "follower>following" pairs for the session.
const demoFollows = new Set<string>();
const followKey = (a: string, b: string) => `${a}>${b}`;

export const PeopleService = {
  /**
   * Search profiles by name / username / specialization, optionally filtered by
   * role. An empty query returns suggested people (most-followed first).
   */
  async search(query: string, role: UserRole | 'all' = 'all', currentUserId?: string): Promise<Profile[]> {
    const q = query.trim();

    if (isDemoMode()) {
      const lower = q.toLowerCase();
      return mockProfiles
        .filter((p) => p.id !== currentUserId)
        .filter((p) => (role === 'all' ? true : p.role === role))
        .filter((p) =>
          !lower ||
          p.full_name.toLowerCase().includes(lower) ||
          p.username.toLowerCase().includes(lower) ||
          (p.specialization || '').toLowerCase().includes(lower)
        )
        .sort((a, b) => b.followers_count - a.followers_count);
    }

    let builder = supabase.from('profiles').select('*').limit(40);
    if (role !== 'all') builder = builder.eq('role', role);
    if (currentUserId) builder = builder.neq('id', currentUserId);
    if (q) builder = builder.or(`full_name.ilike.%${q}%,username.ilike.%${q}%,specialization.ilike.%${q}%`);
    else builder = builder.order('followers_count', { ascending: false });

    const { data, error } = await builder;
    if (error) throw error;
    return (data || []) as Profile[];
  },

  async fetchProfile(userId: string): Promise<Profile | null> {
    if (isDemoMode()) return mockProfiles.find((p) => p.id === userId) || null;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return (data as Profile) || null;
  },

  /** Posts authored by a given user (for their profile page). */
  async fetchUserPosts(userId: string): Promise<Post[]> {
    if (isDemoMode()) return mockPosts.filter((p) => p.author_id === userId).map((p) => ({ ...p }));

    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey(*)')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });
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

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    if (isDemoMode()) return demoFollows.has(followKey(followerId, followingId));

    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },

  /** Follow / unfollow. Returns the resulting follow state. */
  async setFollow(followerId: string, followingId: string, follow: boolean): Promise<boolean> {
    if (followerId === followingId) return false;

    if (isDemoMode()) {
      const key = followKey(followerId, followingId);
      if (follow) demoFollows.add(key);
      else demoFollows.delete(key);
      return follow;
    }

    if (follow) {
      const { error } = await supabase.from('follows').upsert({ follower_id: followerId, following_id: followingId });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
      if (error) throw error;
    }
    return follow;
  },
};
