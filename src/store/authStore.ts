// Sadhna Health Care — Auth Store (Zustand)
import { create } from 'zustand';
import { Profile } from '@/src/types';
import { UserRole } from '@/src/utils/constants';
import { supabase } from '@/src/lib/supabase';

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: Profile | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => () => void;
  completeProfile: (profileData: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start in loading state for checking initial session on mount

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email: string, password: string) => {
    set({ isLoading: true });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Fetch public profile details
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!profileError && profile) {
          set({ user: profile as Profile, isAuthenticated: true, isLoading: false });
        } else {
          // Fallback to metadata if profile row isn't created yet
          const metadata = data.user.user_metadata || {};
          const fallbackProfile: Profile = {
            id: data.user.id,
            role: metadata.role || 'patient',
            full_name: metadata.full_name || 'User',
            username: data.user.email?.split('@')[0] || 'user',
            avatar_url: metadata.avatar_url || null,
            bio: null,
            specialization: metadata.specialization || null,
            license_number: metadata.license_number || null,
            experience_years: null,
            location: null,
            phone: null,
            is_verified: false,
            is_online: true,
            followers_count: 0,
            following_count: 0,
            posts_count: 0,
            created_at: data.user.created_at,
            updated_at: new Date().toISOString(),
            is_profile_complete: false,
          };
          set({ user: fallbackProfile, isAuthenticated: true, isLoading: false });
        }
      }
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email: string, password: string, fullName: string, role: UserRole) => {
    set({ isLoading: true });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Build local Profile state based on sign up metadata
        const newUserProfile: Profile = {
          id: data.user.id,
          role: role,
          full_name: fullName,
          username: fullName.toLowerCase().replace(/\s+/g, '.'),
          avatar_url: null,
          bio: null,
          specialization: null,
          license_number: null,
          experience_years: null,
          location: null,
          phone: null,
          is_verified: false,
          is_online: true,
          followers_count: 0,
          following_count: 0,
          posts_count: 0,
          created_at: data.user.created_at,
          updated_at: new Date().toISOString(),
        };
        set({ user: newUserProfile, isAuthenticated: true, isLoading: false });
      }
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error during Supabase signout, clearing local state anyway:', err);
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  initialize: () => {
    set({ isLoading: true });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Signed out OR token refresh failed / session expired → clear state.
      if (!session) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Token silently refreshed and we already have the profile → nothing to reload.
      if (event === 'TOKEN_REFRESHED' && useAuthStore.getState().user) {
        set({ isLoading: false });
        return;
      }

      // SIGNED_IN / INITIAL_SESSION / USER_UPDATED → (re)load the profile.
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile && !error) {
          set({ user: profile as Profile, isAuthenticated: true, isLoading: false });
        } else {
          // Read from Auth metadata if the profiles row doesn't exist yet.
          const metadata = session.user.user_metadata || {};
          const fallbackProfile: Profile = {
            id: session.user.id,
            role: metadata.role || 'patient',
            full_name: metadata.full_name || 'User',
            username: session.user.email?.split('@')[0] || 'user',
            avatar_url: metadata.avatar_url || null,
            bio: null,
            specialization: metadata.specialization || null,
            license_number: metadata.license_number || null,
            experience_years: null,
            location: null,
            phone: null,
            is_verified: false,
            is_online: true,
            followers_count: 0,
            following_count: 0,
            posts_count: 0,
            created_at: session.user.created_at,
            updated_at: new Date().toISOString(),
            is_profile_complete: false,
          };
          set({ user: fallbackProfile, isAuthenticated: true, isLoading: false });
        }
      } catch (err) {
        console.error('Auth state profile fetch error:', err);
        set({ isLoading: false });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  completeProfile: async (profileData) => {
    set({ isLoading: true });
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ isLoading: false });
      throw new Error('No authenticated user found');
    }

    const updatedUser = {
      ...user,
      ...profileData,
      is_profile_complete: true,
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          is_profile_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      set({ user: updatedUser, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },
}));
