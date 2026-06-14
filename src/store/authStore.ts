// Sadhna Health Care — Auth Store (Zustand)
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from '@/src/types';
import { UserRole } from '@/src/utils/constants';
import { supabase } from '@/src/lib/supabase';
import { isDemoMode, setActiveUserForDemo, isSupabaseConfigured } from '@/src/lib/config';

const SESSION_KEY = 'sadhna_user_session';

const getLocalSession = async (): Promise<Profile | null> => {
  try {
    const data = typeof window !== 'undefined'
      ? window.localStorage.getItem(SESSION_KEY)
      : await AsyncStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Error reading local session:', err);
    return null;
  }
};

const saveLocalSession = async (user: Profile | null): Promise<void> => {
  try {
    if (user) {
      const data = JSON.stringify(user);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SESSION_KEY, data);
      } else {
        await AsyncStorage.setItem(SESSION_KEY, data);
      }
    } else {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(SESSION_KEY);
      } else {
        await AsyncStorage.removeItem(SESSION_KEY);
      }
    }
  } catch (err) {
    console.error('Error saving local session:', err);
  }
};

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: Profile | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateActivityStatus: (isOnline?: boolean) => Promise<void>;
  setLoading: (loading: boolean) => void;
  initialize: () => () => void;
  completeProfile: (profileData: Partial<Profile>) => Promise<void>;
}

// Seed mock users for login bypass
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
    is_profile_complete: true,
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
    is_profile_complete: true,
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
    is_profile_complete: true,
  },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start in loading state for checking initial session on mount

  setUser: (user) => {
    setActiveUserForDemo(user ? user.id : null, null);
    saveLocalSession(user);
    set({ user, isAuthenticated: !!user });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });

    const emailLower = email.toLowerCase();
    const isTestEmail = emailLower.endsWith('@test.com');

    if (isSupabaseConfigured() && isTestEmail) {
      try {
        const mockUser = MOCK_USERS[emailLower] || MOCK_USERS['doctor@test.com'];
        const defaultPassword = 'TestPassword123!';

        // Try signing in
        let { data, error } = await supabase.auth.signInWithPassword({
          email: emailLower,
          password: defaultPassword,
        });

        // If sign in fails, try signing them up
        if (error) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: emailLower,
            password: defaultPassword,
            options: {
              data: {
                full_name: mockUser.full_name,
                role: mockUser.role,
              }
            }
          });

          if (signUpError) throw signUpError;

          if (signUpData.user) {
            // Update profile with completed details immediately
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                specialization: mockUser.specialization || null,
                license_number: mockUser.license_number || null,
                experience_years: mockUser.experience_years || null,
                location: mockUser.location || null,
                phone: mockUser.phone || null,
                is_verified: mockUser.is_verified,
                is_profile_complete: true,
                bio: mockUser.bio || null,
              })
              .eq('id', signUpData.user.id);

            if (updateError) console.warn('Failed to pre-fill profile fields:', updateError);

            // Now sign in
            const signInRes = await supabase.auth.signInWithPassword({
              email: emailLower,
              password: defaultPassword,
            });
            if (signInRes.error) throw signInRes.error;
            data = signInRes.data;
          }
        }

        if (data && data.session) {
          // Fetch public profile details
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (!profileError && profile) {
            const userProfile = profile as Profile;
            saveLocalSession(userProfile);
            set({ user: userProfile, isAuthenticated: true, isLoading: false });
          } else {
            // Fallback metadata
            const metadata = data.user.user_metadata || {};
            const fallbackProfile: Profile = {
              id: data.user.id,
              role: mockUser.role,
              full_name: mockUser.full_name,
              username: emailLower.split('@')[0],
              avatar_url: null,
              bio: mockUser.bio,
              specialization: mockUser.specialization,
              license_number: mockUser.license_number,
              experience_years: mockUser.experience_years,
              location: mockUser.location,
              phone: mockUser.phone,
              is_verified: mockUser.is_verified,
              is_online: true,
              followers_count: 0,
              following_count: 0,
              posts_count: 0,
              created_at: data.user.created_at,
              updated_at: new Date().toISOString(),
              is_profile_complete: true,
            };
            saveLocalSession(fallbackProfile);
            set({ user: fallbackProfile, isAuthenticated: true, isLoading: false });
          }
          return;
        }
      } catch (err: any) {
        console.error('Test email auto-login/signup error:', err);
        // Fallback to client-only demo state if database action fails
        const mockUser = MOCK_USERS[emailLower] || MOCK_USERS['doctor@test.com'];
        saveLocalSession(mockUser);
        set({ user: mockUser, isAuthenticated: true, isLoading: false });
        return;
      }
    }

    if (isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUser = MOCK_USERS[emailLower];
      if (mockUser) {
        setActiveUserForDemo(mockUser.id, emailLower);
        saveLocalSession(mockUser);
        set({ user: mockUser, isAuthenticated: true, isLoading: false });
      } else {
        setActiveUserForDemo(MOCK_USERS['doctor@test.com'].id, 'doctor@test.com');
        saveLocalSession(MOCK_USERS['doctor@test.com']);
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
          const userProfile = profile as Profile;
          saveLocalSession(userProfile);
          set({ user: userProfile, isAuthenticated: true, isLoading: false });
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
          saveLocalSession(fallbackProfile);
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

    const emailLower = email.toLowerCase();

    if (isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const newUser: Profile = {
        id: (role === 'doctor' ? '1' : role === 'caregiver' ? '2' : '3'),
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
      setActiveUserForDemo(newUser.id, emailLower);
      saveLocalSession(newUser);
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

      if (error) {
        // Friendlier message for the most common signup failure.
        if (/already registered|already exists|user already/i.test(error.message)) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        throw error;
      }

      // When "Confirm email" is enabled in Supabase, signUp returns a user but
      // NO session — every later insert would run as anon and silently fail RLS.
      // Try an immediate sign-in; if that still yields no session, the account
      // exists but must be email-confirmed before it can be used.
      let session = data.session;
      if (!session && data.user) {
        const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
        session = signInData.session ?? null;
      }

      if (!session) {
        set({ isLoading: false });
        throw new Error(
          'Account created. Please confirm your email to continue — or ask the admin to disable email confirmation.'
        );
      }

      const authUser = session.user;
      // Build local Profile state based on sign up metadata. The DB trigger
      // (handle_new_user) creates the real row; profile-setup completes it.
      const newUserProfile: Profile = {
        id: authUser.id,
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
        created_at: authUser.created_at,
        updated_at: new Date().toISOString(),
        is_profile_complete: false,
      };
      saveLocalSession(newUserProfile);
      set({ user: newUserProfile, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    const user = get().user;
    if (user && !isDemoMode()) {
      try {
        await supabase
          .from('profiles')
          .update({
            is_online: false,
            last_seen_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      } catch (err) {
        console.warn('Failed to set offline status on logout:', err);
      }
    }
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error during Supabase signout, clearing local state anyway:', err);
    }
    setActiveUserForDemo(null, null);
    saveLocalSession(null);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  updateActivityStatus: async (isOnline?: boolean) => {
    const user = get().user;
    if (!user || isDemoMode()) return;
    try {
      const updateData: any = {
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (isOnline !== undefined) {
        updateData.is_online = isOnline;
      }
      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
    } catch (err) {
      console.warn('Error updating activity status:', err);
    }
  },

  setLoading: (isLoading) => set({ isLoading }),

  initialize: () => {
    set({ isLoading: true });

    let isSubscribed = true;
    let subscription: any = null;

    const isMockUserId = (id: string) => id === '1' || id === '2' || id === '3';

    // Helper to fetch and load profile from session
    const loadProfileFromSession = async (session: any) => {
      if (!session) {
        saveLocalSession(null);
        if (isSubscribed) {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!isSubscribed) return;

        if (profile && !error) {
          saveLocalSession(profile as Profile);
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
          saveLocalSession(fallbackProfile);
          set({ user: fallbackProfile, isAuthenticated: true, isLoading: false });
        }
      } catch (err) {
        console.error('Auth state profile fetch error:', err);
        if (isSubscribed) {
          set({ isLoading: false });
        }
      }
    };

    // Main initialization flow
    const runInit = async () => {
      // 1. Restore the local user session immediately to prevent flash of login screen
      const localUser = await getLocalSession();
      if (!isSubscribed) return;

      if (localUser) {
        setActiveUserForDemo(localUser.id, localUser.username + '@test.com');
        set({ user: localUser, isAuthenticated: true, isLoading: false });
      }

      // 2. If we are in demo mode or if the local session is a mock user, we are done
      if (isDemoMode() || (localUser && isMockUserId(localUser.id))) {
        if (!localUser) {
          set({ isLoading: false });
        }
        return;
      }

      // 3. Otherwise, check the actual Supabase session state
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isSubscribed) return;

        if (session) {
          await loadProfileFromSession(session);
        } else {
          // If Supabase has no session, clear the local session and set loading to false
          saveLocalSession(null);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch (err) {
        console.error('Failed to get initial Supabase session:', err);
        if (!localUser) {
          set({ isLoading: false });
        }
      }

      if (!isSubscribed) return;

      // 4. Subscribe to subsequent auth state changes
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isSubscribed) return;

        // Signed out OR session expired → clear state.
        if (!session) {
          saveLocalSession(null);
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        // Token silently refreshed and we already have the profile → nothing to reload.
        if (event === 'TOKEN_REFRESHED' && useAuthStore.getState().user) {
          set({ isLoading: false });
          return;
        }

        // Handle SIGNED_IN / USER_UPDATED / TOKEN_REFRESHED
        await loadProfileFromSession(session);
      });

      subscription = sub;
    };

    runInit();

    return () => {
      isSubscribed = false;
      if (subscription) {
        subscription.unsubscribe();
      }
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

    if (isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      saveLocalSession(updatedUser);
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

      saveLocalSession(updatedUser);
      set({ user: updatedUser, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },
}));

// Subscribe to sync activeUserId with config.ts automatically
useAuthStore.subscribe((state) => {
  setActiveUserForDemo(state.user ? state.user.id : null, null);
});
