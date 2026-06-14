// Sadhna Health Care — Update Database Schema (adds last_seen_at and stories table)
import pg from 'pg';

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error('❌ Set SUPABASE_DB_PASSWORD in the environment first.');
  process.exit(1);
}

// Session-mode pooler (port 5432) supports DDL + multi-statement scripts.
const connectionString =
  `postgresql://postgres.dawxutkvxdnprypjmuhm:${encodeURIComponent(password)}` +
  `@aws-1-ap-south-1.pooler.supabase.com:5432/postgres`;

const sql = `
-- 1. Add last_seen_at to public.profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Create public.stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 3. Enable RLS on public.stories
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- 4. Create SELECT policy (anyone can view active stories)
DROP POLICY IF EXISTS "Allow public read access to stories" ON public.stories;
CREATE POLICY "Allow public read access to stories"
ON public.stories FOR SELECT
TO public
USING (expires_at > NOW());

-- 5. Create INSERT policy (authenticated users can post their own stories)
DROP POLICY IF EXISTS "Allow users to insert their own stories" ON public.stories;
CREATE POLICY "Allow users to insert their own stories"
ON public.stories FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 6. Create DELETE policy (users can delete their own stories)
DROP POLICY IF EXISTS "Allow users to delete their own stories" ON public.stories;
CREATE POLICY "Allow users to delete their own stories"
ON public.stories FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 7. Update handle_new_user function to include last_seen_at
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_username TEXT;
  raw_role TEXT;
  raw_fullname TEXT;
END;
$$;

-- Actually let's redefine handle_new_user properly:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_username TEXT;
  raw_role TEXT;
  raw_fullname TEXT;
BEGIN
  raw_fullname := COALESCE(new.raw_user_meta_data->>'full_name', 'New User');
  raw_role := COALESCE(new.raw_user_meta_data->>'role', 'patient');

  -- Unique username from full_name (e.g. rahul.verma.3f9a)
  new_username := lower(regexp_replace(raw_fullname, '\\s+', '.', 'g')) || '.' || substring(md5(random()::text) from 1 for 4);

  INSERT INTO public.profiles (
    id, role, full_name, username, avatar_url,
    is_verified, is_online, is_profile_complete, created_at, updated_at, last_seen_at
  ) VALUES (
    new.id,
    raw_role,
    raw_fullname,
    new_username,
    new.raw_user_meta_data->>'avatar_url',
    FALSE,
    FALSE,
    FALSE,
    COALESCE(new.created_at, NOW()),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;
`;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await client.connect();
    console.log('🔌 Connected to Supabase Postgres. Updating database schema...');
    await client.query(sql);
    console.log('✅ Database schema updated successfully.');
  } catch (err) {
    console.error('❌ Database schema update failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
