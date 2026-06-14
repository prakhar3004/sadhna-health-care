// Sadhna Health Care — Stories Service (dual-mode: demo + live Supabase)
import { supabase } from '@/src/lib/supabase';
import { isDemoMode } from '@/src/lib/config';
import { Story, Profile } from '@/src/types';
import { mockProfiles } from '@/src/data/mockData';

// In-memory stories for demo mode
let demoStories: Story[] = [
  {
    id: 's_demo_1',
    user_id: 'd0c70410-0000-0000-0000-000000000001', // Dr. Priya
    media_url: 'linear-gradient:from=#14B8A6&to=#0D9488',
    caption: 'Morning rounds completed! Remember to drink at least 3 liters of water today. 💧',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 's_demo_2',
    user_id: 'ca7e0410-0000-0000-0000-000000000002', // Anita
    media_url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=80',
    caption: 'Healthy breakfast prepared for our patient. Nutritious food is the best medicine! 🍎',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 's_demo_3',
    user_id: 'a71e0410-0000-0000-0000-000000000003', // Rahul
    media_url: 'linear-gradient:from=#F59E0B&to=#D97706',
    caption: 'Completed my 10k steps goal for today! Feel amazing and energetic! 🏃‍♂️💪',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
];

export interface UserStories {
  user: Profile;
  stories: Story[];
}

export const StoriesService = {
  /** Fetch all active (unexpired) stories from the database, sorted oldest to newest */
  async fetchActiveStories(): Promise<Story[]> {
    if (isDemoMode()) {
      // Filter out expired demo stories
      const now = new Date().toISOString();
      return demoStories
        .filter((s) => s.expires_at > now)
        .map((s) => ({
          ...s,
          user: mockProfiles.find((p) => p.id === s.user_id),
        }));
    }

    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('stories')
        .select('*, user:profiles!stories_user_id_fkey(*)')
        .gt('expires_at', now)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        user: row.user as Profile,
        media_url: row.media_url,
        caption: row.caption,
        created_at: row.created_at,
        expires_at: row.expires_at,
      }));
    } catch (e) {
      console.error('Failed to fetch active stories:', e);
      return [];
    }
  },

  /** Fetch active stories and group them by user */
  async fetchStoriesGroupedByUser(): Promise<UserStories[]> {
    const active = await this.fetchActiveStories();
    const groups: Record<string, { user: Profile; stories: Story[] }> = {};

    active.forEach((story) => {
      const userId = story.user_id;
      const userProfile = story.user;
      if (!userProfile) return;

      if (!groups[userId]) {
        groups[userId] = {
          user: userProfile,
          stories: [],
        };
      }
      groups[userId].stories.push(story);
    });

    return Object.values(groups);
  },

  /** Create a new story */
  async createStory(
    userId: string,
    mediaUrl: string | null,
    caption: string | null,
    durationHours = 24
  ): Promise<Story> {
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

    if (isDemoMode()) {
      const mockUser = mockProfiles.find((p) => p.id === userId);
      const newStory: Story = {
        id: `s_demo_${Date.now()}`,
        user_id: userId,
        user: mockUser,
        media_url: mediaUrl,
        caption: caption,
        created_at: createdAt,
        expires_at: expiresAt,
      };
      demoStories.push(newStory);
      return newStory;
    }

    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: userId,
        media_url: mediaUrl,
        caption: caption,
        expires_at: expiresAt,
      })
      .select('*, user:profiles!stories_user_id_fkey(*)')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id,
      user: data.user as Profile,
      media_url: data.media_url,
      caption: data.caption,
      created_at: data.created_at,
      expires_at: data.expires_at,
    };
  },
};
