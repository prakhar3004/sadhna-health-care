// Sadhna Health Care — Runtime Configuration (single source of truth)
//
// All Supabase credentials and the demo/live mode decision live here so the
// rest of the app never re-implements (and never disagrees about) what counts
// as a configured backend. Read these instead of touching process.env directly.

const PLACEHOLDER_URL = 'https://your-project.supabase.co';
const PLACEHOLDER_ANON_KEY = 'your-anon-key';

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const rawAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

/** Resolved Supabase URL (falls back to a harmless placeholder in demo mode). */
export const SUPABASE_URL = rawUrl || PLACEHOLDER_URL;

/** Resolved Supabase anon key (falls back to a harmless placeholder in demo mode). */
export const SUPABASE_ANON_KEY = rawAnonKey || PLACEHOLDER_ANON_KEY;

/**
 * True only when BOTH credentials are present and are not the shipped
 * placeholders. When false the app runs fully on-device (mock auth +
 * AsyncStorage persistence) so it stays usable without a backend.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    !!rawUrl &&
    !!rawAnonKey &&
    !rawUrl.includes('your-project') &&
    !rawAnonKey.includes('your-anon-key')
  );
};

/** Inverse of {@link isSupabaseConfigured}: local/demo mode with no live backend. */
export const isDemoMode = (): boolean => !isSupabaseConfigured();
