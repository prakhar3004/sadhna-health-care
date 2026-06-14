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
 * placeholders.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    !!rawUrl &&
    !!rawAnonKey &&
    !rawUrl.includes('your-project') &&
    !rawAnonKey.includes('your-anon-key')
  );
};

let activeUserId: string | null = null;
let activeUserEmail: string | null = null;

export const setActiveUserForDemo = (id: string | null, email: string | null) => {
  activeUserId = id;
  activeUserEmail = email;
};

/**
 * Returns true if Supabase is not configured, or if the active user is a demo user.
 * This ensures demo logins work seamlessly even in live production builds.
 */
export const isDemoMode = (): boolean => {
  if (!isSupabaseConfigured()) return true;
  if (activeUserId === '1' || activeUserId === '2' || activeUserId === '3') return true;
  if (activeUserEmail?.toLowerCase().endsWith('@test.com')) return true;
  return false;
};
