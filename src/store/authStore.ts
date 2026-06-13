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

// Mock users for fallback/demo mode
const MOCK_USERS: Record<string, Profile> = {
  'doctor@test.com': {
    id: '1',
    role: 'doctor',
    full_name: 'Dr. Priya Sharma',
    username: 'dr.priya',
    avatar_url: null,
    bio: 'Senior Cardiologist with 15+ years of experience. Passionate about preventive healthcare and patient education.',
    specialization: 'Cardiology',
    license_number: 'MCI-12345',
    experience_years: 15,
    location: 'Mumbai, Maharashtra',
    phone: '+91 98765 43210',
    is_verified: true,
    is_online: true,
    followers_count: 1240,
    following_count: 89,
    posts_count: 156,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  'caregiver@test.com': {
    id: '2',
    role: 'caregiver',
    full_name: 'Anita Desai',
    username: 'anita.care',
    avatar_url: null,
    bio: 'Dedicated caregiver for elderly patients. Specializing in post-operative care and rehabilitation support.',
    specialization: null,
    license_number: null,
    experience_years: 8,
    location: 'Delhi, NCR',
    phone: '+91 87654 32109',
    is_verified: true,
    is_online: true,
    followers_count: 340,
    following_count: 156,
    posts_count: 78,
    created_at: '2024-03-10T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  'patient@test.com': {
    id: '3',
    role: 'patient',
    full_name: 'Rahul Verma',
    username: 'rahul.v',
    avatar_url: null,
    bio: 'Managing diabetes and staying active. Sharing my health journey to inspire others.',
    specialization: null,
    license_number: null,
    experience_years: null,
    location: 'Bangalore, Karnataka',
    phone: '+91 76543 21098',
    is_verified: false,
    is_online: false,
    followers_count: 56,
    following_count: 200,
    posts_count: 23,
    created_at: '2024-05-20T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start in loading state for checking initial session on mount

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    // Check if we are running with placeholder credentials (fallback to mock flow)
    const isPlaceholder = supabase.auth.getSession === undefined || 
      process.env.EXPO_PUBLIC_SUPABASE_URL === undefined || 
      process.env.EXPO_PUBLIC_SUPABASE_URL.includes('your-project');

    if (isPlaceholder) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUser = MOCK_USERS[email.toLowerCase()];
      if (mockUser) {
        set({ user: mockUser, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: MOCK_USERS['doctor@test.com'], isAuthenticated: true, isLoading: false });
      }
      return;
    }

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

    const isPlaceholder = supabase.auth.getSession === undefined || 
      process.env.EXPO_PUBLIC_SUPABASE_URL === undefined || 
      process.env.EXPO_PUBLIC_SUPABASE_URL.includes('your-project');

    if (isPlaceholder) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const newUser: Profile = {
        id: Date.now().toString(),
        role,
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set({ user: newUser, isAuthenticated: true, isLoading: false });
      return;
    }

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

    // Check placeholder state to skip listener if config is not present
    const isPlaceholder = supabase.auth.getSession === undefined || 
      process.env.EXPO_PUBLIC_SUPABASE_URL === undefined || 
      process.env.EXPO_PUBLIC_SUPABASE_URL.includes('your-project');

    if (isPlaceholder) {
      // Set loading false so index page does not block redirects
      set({ isLoading: false });
      return () => {};
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile && !error) {
            set({ user: profile as Profile, isAuthenticated: true, isLoading: false });
          } else {
            // Read from Auth Metadata if DB profiles row doesn't exist yet
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
            };
            set({ user: fallbackProfile, isAuthenticated: true, isLoading: false });
          }
        } catch (err) {
          console.error('Auth initialization profile fetch error:', err);
          set({ isLoading: false });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
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

    const isPlaceholder = supabase.auth.getSession === undefined || 
      process.env.EXPO_PUBLIC_SUPABASE_URL === undefined || 
      process.env.EXPO_PUBLIC_SUPABASE_URL.includes('your-project');

    if (isPlaceholder) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set({ user: updatedUser, isAuthenticated: true, isLoading: false });
      return;
    }

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
