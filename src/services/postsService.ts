// Sadhna Health Care — Posts / Feed Service (dual-mode: demo + live Supabase)
import { supabase } from '@/src/lib/supabase';
import { isDemoMode } from '@/src/lib/config';
import { Post, Comment, Profile } from '@/src/types';
import { ReactionType, PostType } from '@/src/utils/constants';
import { mockPosts } from '@/src/data/mockData';

const ZERO_REACTIONS: Record<ReactionType, number> = {
  himmat: 0, support: 0, celebrate: 0, helpful: 0, love: 0,
};

const normalizeReactions = (raw: any): Record<ReactionType, number> => ({
  ...ZERO_REACTIONS,
  ...(raw && typeof raw === 'object' ? raw : {}),
});

/** Map a joined DB row → app Post, layering in the current user's flags. */
const mapPostRow = (
  row: any,
  userReaction: ReactionType | null,
  isBookmarked: boolean
): Post => ({
  id: row.id,
  author_id: row.author_id,
  author: row.author as Profile,
  content: row.content,
  media_urls: row.media_urls || [],
  post_type: row.post_type,
  visibility: row.visibility,
  likes_count: row.likes_count ?? 0,
  reactions: normalizeReactions(row.reactions),
  user_reaction: userReaction,
  comments_count: row.comments_count ?? 0,
  is_liked: !!userReaction,
  is_bookmarked: isBookmarked,
  created_at: row.created_at,
});

// ─── Demo (on-device) in-memory feed ────────────────────────────
let demoFeed: Post[] | null = null;
const getDemoFeed = (): Post[] => {
  if (!demoFeed) demoFeed = mockPosts.map((p) => ({ ...p, reactions: { ...p.reactions } }));
  return demoFeed;
};

export interface CreatePostInput {
  content: string;
  post_type: PostType;
  visibility: Post['visibility'];
  media_urls?: string[];
}

export const PostsService = {
  /** Reverse-chronological feed with the current user's reaction/bookmark flags. */
  async fetchFeed(currentUserId: string): Promise<Post[]> {
    if (isDemoMode()) {
      const feed = getDemoFeed().map((p) => ({ ...p, reactions: { ...p.reactions } }));
      // Hydrate reposts in demo feed
      feed.forEach(p => {
        if (p.post_type === 'repost') {
          try {
            const parsed = JSON.parse(p.content);
            p.reposted_post = feed.find(x => x.id === parsed.repost_of_id);
            p.content = parsed.comment || '';
          } catch (e) {}
        }
      });
      return feed;
    }

    const { data: posts, error } = await supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;

    const ids = (posts || []).map((p) => p.id);
    if (ids.length === 0) return [];

    const [reacts, bookmarks] = await Promise.all([
      supabase.from('post_reactions').select('post_id, reaction_type').eq('user_id', currentUserId).in('post_id', ids),
      supabase.from('bookmarks').select('post_id').eq('user_id', currentUserId).in('post_id', ids),
    ]);
    const reactMap = new Map<string, ReactionType>();
    (reacts.data || []).forEach((r: any) => reactMap.set(r.post_id, r.reaction_type));
    const bmSet = new Set((bookmarks.data || []).map((b: any) => b.post_id));

    const mapped = (posts || []).map((p) => mapPostRow(p, reactMap.get(p.id) || null, bmSet.has(p.id)));

    // Hydrate reposts
    const repostOfIds: string[] = [];
    mapped.forEach(p => {
      if (p.post_type === 'repost') {
        try {
          const parsed = JSON.parse(p.content);
          if (parsed && parsed.repost_of_id) {
            repostOfIds.push(parsed.repost_of_id);
          }
        } catch (e) {}
      }
    });

    if (repostOfIds.length > 0) {
      // Fetch all referenced posts
      const { data: originalPostsData, error: origError } = await supabase
        .from('posts')
        .select('*, author:profiles!posts_author_id_fkey(*)')
        .in('id', repostOfIds);

      if (!origError && originalPostsData) {
        // Fetch reactions and bookmarks for these original posts to set correct flags
        const [origReacts, origBookmarks] = await Promise.all([
          supabase.from('post_reactions').select('post_id, reaction_type').eq('user_id', currentUserId).in('post_id', repostOfIds),
          supabase.from('bookmarks').select('post_id').eq('user_id', currentUserId).in('post_id', repostOfIds),
        ]);
        const origReactMap = new Map<string, ReactionType>();
        (origReacts.data || []).forEach((r: any) => origReactMap.set(r.post_id, r.reaction_type));
        const origBmSet = new Set((origBookmarks.data || []).map((b: any) => b.post_id));

        const originalPostsMap = new Map<string, Post>();
        originalPostsData.forEach(row => {
          originalPostsMap.set(row.id, mapPostRow(row, origReactMap.get(row.id) || null, origBmSet.has(row.id)));
        });

        // Hydrate each reposted post in the mapped feed
        mapped.forEach(p => {
          if (p.post_type === 'repost') {
            try {
              const parsed = JSON.parse(p.content);
              p.reposted_post = originalPostsMap.get(parsed.repost_of_id);
              p.content = parsed.comment || '';
            } catch (e) {}
          }
        });
      }
    }

    return mapped;
  },

  async fetchPost(postId: string, currentUserId: string): Promise<Post | null> {
    if (isDemoMode()) {
      const found = getDemoFeed().find((p) => p.id === postId);
      if (!found) return null;
      const post = { ...found, reactions: { ...found.reactions } };
      if (post.post_type === 'repost') {
        try {
          const parsed = JSON.parse(post.content);
          const orig = getDemoFeed().find(x => x.id === parsed.repost_of_id);
          if (orig) {
            post.reposted_post = { ...orig, reactions: { ...orig.reactions } };
            post.content = parsed.comment || '';
          }
        } catch (e) {}
      }
      return post;
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey(*)')
      .eq('id', postId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const [reaction, bookmark] = await Promise.all([
      supabase.from('post_reactions').select('reaction_type').eq('post_id', postId).eq('user_id', currentUserId).maybeSingle(),
      supabase.from('bookmarks').select('post_id').eq('post_id', postId).eq('user_id', currentUserId).maybeSingle(),
    ]);
    const post = mapPostRow(data, (reaction.data?.reaction_type as ReactionType) || null, !!bookmark.data);

    // Hydrate repost in single fetch
    if (post.post_type === 'repost') {
      try {
        const parsed = JSON.parse(post.content);
        if (parsed && parsed.repost_of_id) {
          const origPost = await this.fetchPost(parsed.repost_of_id, currentUserId);
          if (origPost) {
            post.reposted_post = origPost;
            post.content = parsed.comment || '';
          }
        }
      } catch (e) {}
    }

    return post;
  },

  async createPost(author: Profile, input: CreatePostInput): Promise<Post> {
    if (isDemoMode()) {
      const post: Post = {
        id: `p_${Date.now()}`,
        author_id: author.id,
        author,
        content: input.content,
        media_urls: input.media_urls || [],
        post_type: input.post_type,
        visibility: input.visibility,
        likes_count: 0,
        reactions: { ...ZERO_REACTIONS },
        user_reaction: null,
        comments_count: 0,
        is_liked: false,
        is_bookmarked: false,
        created_at: new Date().toISOString(),
      };
      if (post.post_type === 'repost') {
        try {
          const parsed = JSON.parse(post.content);
          const orig = getDemoFeed().find(x => x.id === parsed.repost_of_id);
          if (orig) {
            post.reposted_post = { ...orig, reactions: { ...orig.reactions } };
            post.content = parsed.comment || '';
          }
        } catch (e) {}
      }
      getDemoFeed().unshift(post);
      return post;
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: author.id,
        content: input.content,
        post_type: input.post_type,
        visibility: input.visibility,
        media_urls: input.media_urls || [],
      })
      .select('*, author:profiles!posts_author_id_fkey(*)')
      .single();
    if (error) throw error;
    
    const post = mapPostRow(data, null, false);
    if (post.post_type === 'repost') {
      try {
        const parsed = JSON.parse(post.content);
        const orig = await this.fetchPost(parsed.repost_of_id, author.id);
        if (orig) {
          post.reposted_post = orig;
          post.content = parsed.comment || '';
        }
      } catch (e) {}
    }
    return post;
  },

  /** Set or clear the current user's reaction on a post (null = remove). */
  async setReaction(postId: string, userId: string, reaction: ReactionType | null): Promise<void> {
    if (isDemoMode()) {
      const post = getDemoFeed().find((p) => p.id === postId);
      if (post) {
        if (post.user_reaction) post.reactions[post.user_reaction] = Math.max(0, post.reactions[post.user_reaction] - 1);
        if (reaction) post.reactions[reaction] = (post.reactions[reaction] || 0) + 1;
        post.user_reaction = reaction;
        post.is_liked = !!reaction;
        post.likes_count = Object.values(post.reactions).reduce((s, n) => s + n, 0);
      }
      return;
    }

    if (reaction === null) {
      const { error } = await supabase.from('post_reactions').delete().eq('post_id', postId).eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('post_reactions')
        .upsert({ post_id: postId, user_id: userId, reaction_type: reaction }, { onConflict: 'post_id,user_id' });
      if (error) throw error;
    }
  },

  async toggleBookmark(postId: string, userId: string, bookmarked: boolean): Promise<void> {
    if (isDemoMode()) {
      const post = getDemoFeed().find((p) => p.id === postId);
      if (post) post.is_bookmarked = bookmarked;
      return;
    }

    if (bookmarked) {
      const { error } = await supabase.from('bookmarks').upsert({ user_id: userId, post_id: postId });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('bookmarks').delete().eq('user_id', userId).eq('post_id', postId);
      if (error) throw error;
    }
  },

  async fetchComments(postId: string): Promise<Comment[]> {
    if (isDemoMode()) return demoComments[postId] ? [...demoComments[postId]] : [];

    const { data, error } = await supabase
      .from('comments')
      .select('*, author:profiles!comments_author_id_fkey(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map((c: any) => ({
      id: c.id,
      post_id: c.post_id,
      author_id: c.author_id,
      author: c.author as Profile,
      content: c.content,
      parent_id: c.parent_id,
      created_at: c.created_at,
    }));
  },

  async addComment(postId: string, author: Profile, content: string, parentId: string | null = null): Promise<Comment> {
    if (isDemoMode()) {
      const comment: Comment = {
        id: `cm_${Date.now()}`,
        post_id: postId,
        author_id: author.id,
        author,
        content,
        parent_id: parentId,
        created_at: new Date().toISOString(),
      };
      demoComments[postId] = [...(demoComments[postId] || []), comment];
      const post = getDemoFeed().find((p) => p.id === postId);
      if (post) post.comments_count += 1;
      return comment;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, author_id: author.id, content, parent_id: parentId })
      .select('*, author:profiles!comments_author_id_fkey(*)')
      .single();
    if (error) throw error;
    return {
      id: data.id,
      post_id: data.post_id,
      author_id: data.author_id,
      author: data.author as Profile,
      content: data.content,
      parent_id: data.parent_id,
      created_at: data.created_at,
    };
  },

  /** Delete a post (author via RLS, or admin). Also drops it from the demo feed. */
  async deletePost(postId: string): Promise<void> {
    if (isDemoMode()) {
      const feed = getDemoFeed();
      const i = feed.findIndex((p) => p.id === postId);
      if (i >= 0) feed.splice(i, 1);
      return;
    }
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) throw error;
  },
};

// Demo comment store keyed by post id.
const demoComments: Record<string, Comment[]> = {};
