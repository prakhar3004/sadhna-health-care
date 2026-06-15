-- Sadhna Health Care — Database Setup & Security Schema
-- Execute this SQL script in the Supabase SQL Editor to configure your database.
--
-- This script is IDEMPOTENT: it can be safely re-run on an existing database.
-- New columns are added via "ADD COLUMN IF NOT EXISTS" and every policy is
-- dropped before being (re)created.

-- ════════════════════════════════════════════════════════════════
-- 1. PROFILES TABLE
-- ════════════════════════════════════════════════════════════════
-- Public profile linked 1:1 to a Supabase auth.users row.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'caregiver', 'patient')),
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  specialization TEXT,
  license_number TEXT,
  experience_years INTEGER,
  location TEXT,
  phone TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  -- Onboarding / role-specific fields (consumed by the app)
  is_profile_complete BOOLEAN NOT NULL DEFAULT FALSE,
  caregiver_type TEXT CHECK (caregiver_type IN ('professional', 'family')),
  relation_to_patient TEXT,
  associated_patient_username TEXT,
  patient_id_card_number TEXT,
  chronic_condition TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration for databases created before the role-specific columns existed.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS caregiver_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS relation_to_patient TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS associated_patient_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS patient_id_card_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chronic_condition TEXT;
-- last_seen_at was missing on older live databases; the signup trigger and the
-- presence/heartbeat code both depend on it, so ensure it always exists.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- ════════════════════════════════════════════════════════════════
-- 2. PROFILES — ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles"
ON public.profiles FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
CREATE POLICY "Allow users to insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ════════════════════════════════════════════════════════════════
-- 3. AUTOMATIC PROFILE CREATION TRIGGER
-- ════════════════════════════════════════════════════════════════
-- Inserts a public.profiles row whenever a user registers via Supabase Auth,
-- copying the metadata (full_name, role) supplied during signup. Runs as
-- SECURITY DEFINER so it bypasses RLS for the initial insert.
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
  new_username := lower(regexp_replace(raw_fullname, '\s+', '.', 'g')) || '.' || substring(md5(random()::text) from 1 for 4);

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
    FALSE,  -- presence is set by the client on connect, not at signup
    FALSE,  -- user still needs to complete the profile-setup flow
    COALESCE(new.created_at, NOW()),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ════════════════════════════════════════════════════════════════
-- 4. PATIENT-CARE TABLES
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.vitals_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sugar INTEGER NOT NULL,
  bp INTEGER NOT NULL,
  heart_rate INTEGER NOT NULL,
  log_date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.life_goals (
  id TEXT PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.care_alerts (
  id TEXT PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  "desc" TEXT NOT NULL,
  details TEXT NOT NULL,
  cta_text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.treatment_history (
  id TEXT PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('prescription', 'vitals', 'report')),
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  file_name TEXT,
  hospital TEXT,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sos_contacts (
  id TEXT PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id TEXT PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  hospital TEXT NOT NULL,
  reason TEXT NOT NULL,
  required_amount INTEGER NOT NULL CHECK (required_amount > 0),
  raised_amount INTEGER DEFAULT 0 CHECK (raised_amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('verified', 'pending', 'rejected')),
  partner_ngo TEXT NOT NULL,
  document_name TEXT,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Single-row global donation pool.
CREATE TABLE IF NOT EXISTS public.seva_pool (
  id TEXT PRIMARY KEY,
  amount INTEGER DEFAULT 485200 CHECK (amount >= 0),
  contributors INTEGER DEFAULT 1240 CHECK (contributors >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.seva_pool (id, amount, contributors)
VALUES ('main_pool', 485200, 1240)
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════════
-- 5. ATOMIC DONATION FUNCTIONS (money is never client-authoritative)
-- ════════════════════════════════════════════════════════════════
-- Clients are NOT allowed to UPDATE seva_pool or emergency_requests.raised_amount
-- directly (see RLS below). All contributions flow through these SECURITY DEFINER
-- functions, which increment atomically under row locks and return the new totals.

CREATE OR REPLACE FUNCTION public.donate_to_pool(p_amount INTEGER)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pool public.seva_pool;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Donation amount must be positive';
  END IF;

  UPDATE public.seva_pool
     SET amount = amount + p_amount,
         contributors = contributors + 1,
         updated_at = NOW()
   WHERE id = 'main_pool'
  RETURNING * INTO v_pool;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seva pool not initialised';
  END IF;

  RETURN jsonb_build_object('amount', v_pool.amount, 'contributors', v_pool.contributors);
END;
$$;

CREATE OR REPLACE FUNCTION public.donate_to_request(p_request_id TEXT, p_amount INTEGER)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_raised INTEGER;
  v_pool public.seva_pool;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Donation amount must be positive';
  END IF;

  -- Lock the target request, then bump its raised amount (capped at required).
  UPDATE public.emergency_requests
     SET raised_amount = LEAST(required_amount, raised_amount + p_amount)
   WHERE id = p_request_id
  RETURNING raised_amount INTO v_raised;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Emergency request % not found', p_request_id;
  END IF;

  -- A request donation counts a contributor but does not grow the general pool.
  UPDATE public.seva_pool
     SET contributors = contributors + 1,
         updated_at = NOW()
   WHERE id = 'main_pool'
  RETURNING * INTO v_pool;

  RETURN jsonb_build_object(
    'raised_amount', v_raised,
    'pool_amount', v_pool.amount,
    'pool_contributors', v_pool.contributors
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.donate_to_pool(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.donate_to_request(TEXT, INTEGER) TO authenticated;

-- ════════════════════════════════════════════════════════════════
-- 6. PATIENT-CARE — ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════
ALTER TABLE public.vitals_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seva_pool ENABLE ROW LEVEL SECURITY;

-- Per-patient private data: owner-only full access.
DROP POLICY IF EXISTS "Allow users to manage their own vitals" ON public.vitals_logs;
CREATE POLICY "Allow users to manage their own vitals"
ON public.vitals_logs FOR ALL TO authenticated
USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Allow users to manage their own life goals" ON public.life_goals;
CREATE POLICY "Allow users to manage their own life goals"
ON public.life_goals FOR ALL TO authenticated
USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Allow users to manage their own care alerts" ON public.care_alerts;
CREATE POLICY "Allow users to manage their own care alerts"
ON public.care_alerts FOR ALL TO authenticated
USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Allow users to manage their own treatment history" ON public.treatment_history;
CREATE POLICY "Allow users to manage their own treatment history"
ON public.treatment_history FOR ALL TO authenticated
USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Allow users to manage their own sos contacts" ON public.sos_contacts;
CREATE POLICY "Allow users to manage their own sos contacts"
ON public.sos_contacts FOR ALL TO authenticated
USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- Emergency requests: public can read; owners create/edit their own request
-- metadata. raised_amount is changed ONLY through donate_to_request().
DROP POLICY IF EXISTS "Allow public read access to emergency requests" ON public.emergency_requests;
CREATE POLICY "Allow public read access to emergency requests"
ON public.emergency_requests FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create emergency requests" ON public.emergency_requests;
CREATE POLICY "Allow authenticated users to create emergency requests"
ON public.emergency_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_id);

-- Replaces the previous "anyone can update any request" policy.
DROP POLICY IF EXISTS "Allow authenticated users to update emergency requests (donations)" ON public.emergency_requests;
DROP POLICY IF EXISTS "Owners can update their own emergency requests" ON public.emergency_requests;
CREATE POLICY "Owners can update their own emergency requests"
ON public.emergency_requests FOR UPDATE TO authenticated
USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- Harden the donation column: block direct client writes to raised_amount.
-- (The SECURITY DEFINER donate_to_request function still updates it.)
REVOKE UPDATE (raised_amount) ON public.emergency_requests FROM authenticated, anon;

-- Seva pool: public can read; NO direct client UPDATE policy is granted, so the
-- pool can only ever change via donate_to_pool() / donate_to_request().
DROP POLICY IF EXISTS "Allow public read access to seva pool" ON public.seva_pool;
CREATE POLICY "Allow public read access to seva pool"
ON public.seva_pool FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to update seva pool" ON public.seva_pool;

-- ════════════════════════════════════════════════════════════════
-- 7. PERFORMANCE INDEXES
-- ════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_vitals_patient_date ON public.vitals_logs (patient_id, log_date);
CREATE INDEX IF NOT EXISTS idx_life_goals_patient ON public.life_goals (patient_id);
CREATE INDEX IF NOT EXISTS idx_care_alerts_patient ON public.care_alerts (patient_id, completed);
CREATE INDEX IF NOT EXISTS idx_treatment_history_patient ON public.treatment_history (patient_id);
CREATE INDEX IF NOT EXISTS idx_sos_contacts_patient ON public.sos_contacts (patient_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON public.emergency_requests (status);

-- ════════════════════════════════════════════════════════════════
-- 8. SOCIAL LAYER — TABLES
-- ════════════════════════════════════════════════════════════════

-- Posts (feed)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  post_type TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'doctors_only', 'care_team', 'private')),
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  reactions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One reaction per user per post (himmat / support / celebrate / helpful / love)
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL
    CHECK (reaction_type IN ('himmat', 'support', 'celebrate', 'helpful', 'love')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookmarks (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

-- Direct & group conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  name TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  message_type TEXT NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text', 'image', 'file', 'appointment_link')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  caregiver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  type TEXT NOT NULL DEFAULT 'in_person'
    CHECK (type IN ('in_person', 'video_call', 'phone')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  title TEXT,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════
-- 9. SOCIAL LAYER — DENORMALISED COUNT TRIGGERS
-- ════════════════════════════════════════════════════════════════

-- posts_count on profiles
CREATE OR REPLACE FUNCTION public.sync_posts_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET posts_count = posts_count + 1 WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET posts_count = GREATEST(0, posts_count - 1) WHERE id = OLD.author_id;
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS trg_posts_count ON public.posts;
CREATE TRIGGER trg_posts_count
  AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.sync_posts_count();

-- comments_count on posts
CREATE OR REPLACE FUNCTION public.sync_comments_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS trg_comments_count ON public.comments;
CREATE TRIGGER trg_comments_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_comments_count();

-- reactions breakdown (JSONB) + likes_count on posts
CREATE OR REPLACE FUNCTION public.recompute_post_reactions(p_post_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.posts SET
    reactions = COALESCE(
      (SELECT jsonb_object_agg(reaction_type, cnt)
         FROM (SELECT reaction_type, COUNT(*) AS cnt
                 FROM public.post_reactions
                WHERE post_id = p_post_id
                GROUP BY reaction_type) s),
      '{}'::jsonb),
    likes_count = (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = p_post_id)
  WHERE id = p_post_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_post_reactions()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recompute_post_reactions(OLD.post_id);
  ELSE
    PERFORM public.recompute_post_reactions(NEW.post_id);
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS trg_post_reactions ON public.post_reactions;
CREATE TRIGGER trg_post_reactions
  AFTER INSERT OR UPDATE OR DELETE ON public.post_reactions
  FOR EACH ROW EXECUTE FUNCTION public.sync_post_reactions();

-- follower / following counts on profiles
CREATE OR REPLACE FUNCTION public.sync_follow_counts()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
    UPDATE public.profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS trg_follow_counts ON public.follows;
CREATE TRIGGER trg_follow_counts
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.sync_follow_counts();

-- bump conversation.updated_at on each new message (drives chat-list ordering)
CREATE OR REPLACE FUNCTION public.touch_conversation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET updated_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS trg_touch_conversation ON public.messages;
CREATE TRIGGER trg_touch_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_conversation();

-- ════════════════════════════════════════════════════════════════
-- 10. SOCIAL LAYER — ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper used by messaging policies to avoid RLS self-recursion on
-- conversation_participants (SECURITY DEFINER bypasses RLS for the lookup).
CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conversation_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
     WHERE conversation_id = p_conversation_id AND user_id = p_user_id
  );
$$;

-- Returns the id of an existing direct (1:1) conversation between two users, if any.
CREATE OR REPLACE FUNCTION public.find_direct_conversation(p_user_a UUID, p_user_b UUID)
RETURNS UUID LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT c.id
    FROM public.conversations c
    JOIN public.conversation_participants pa ON pa.conversation_id = c.id AND pa.user_id = p_user_a
    JOIN public.conversation_participants pb ON pb.conversation_id = c.id AND pb.user_id = p_user_b
   WHERE c.type = 'direct'
   LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.find_direct_conversation(UUID, UUID) TO authenticated;

-- Posts: visible per visibility rule; authored only by the author.
DROP POLICY IF EXISTS "Read posts by visibility" ON public.posts;
CREATE POLICY "Read posts by visibility"
ON public.posts FOR SELECT TO authenticated
USING (
  visibility = 'public'
  OR author_id = auth.uid()
  OR (visibility = 'doctors_only'
      AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'doctor'))
);

DROP POLICY IF EXISTS "Authors insert their own posts" ON public.posts;
CREATE POLICY "Authors insert their own posts"
ON public.posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors update their own posts" ON public.posts;
CREATE POLICY "Authors update their own posts"
ON public.posts FOR UPDATE TO authenticated
USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors delete their own posts" ON public.posts;
CREATE POLICY "Authors delete their own posts"
ON public.posts FOR DELETE TO authenticated USING (author_id = auth.uid());

-- likes_count / comments_count / reactions are maintained only by triggers.
REVOKE UPDATE (likes_count, comments_count, reactions) ON public.posts FROM authenticated, anon;

-- Reactions: anyone can read; users manage only their own reaction row.
DROP POLICY IF EXISTS "Read reactions" ON public.post_reactions;
CREATE POLICY "Read reactions"
ON public.post_reactions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Manage own reactions" ON public.post_reactions;
CREATE POLICY "Manage own reactions"
ON public.post_reactions FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Comments: readable by all; authored only by the author.
DROP POLICY IF EXISTS "Read comments" ON public.comments;
CREATE POLICY "Read comments"
ON public.comments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Manage own comments" ON public.comments;
CREATE POLICY "Manage own comments"
ON public.comments FOR ALL TO authenticated
USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

-- Bookmarks & follows: users manage only their own rows.
DROP POLICY IF EXISTS "Manage own bookmarks" ON public.bookmarks;
CREATE POLICY "Manage own bookmarks"
ON public.bookmarks FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Read follows" ON public.follows;
CREATE POLICY "Read follows"
ON public.follows FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Manage own follows" ON public.follows;
CREATE POLICY "Manage own follows"
ON public.follows FOR ALL TO authenticated
USING (follower_id = auth.uid()) WITH CHECK (follower_id = auth.uid());

-- Conversations & messaging: participant-scoped.
DROP POLICY IF EXISTS "Participants read conversations" ON public.conversations;
CREATE POLICY "Participants read conversations"
ON public.conversations FOR SELECT TO authenticated
USING (
  -- The creator can always read (needed for INSERT ... RETURNING right after
  -- creating a conversation, before participant rows exist), plus participants.
  created_by = auth.uid()
  OR public.is_conversation_participant(id, auth.uid())
);

DROP POLICY IF EXISTS "Users create conversations" ON public.conversations;
CREATE POLICY "Users create conversations"
ON public.conversations FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Participants read membership" ON public.conversation_participants;
CREATE POLICY "Participants read membership"
ON public.conversation_participants FOR SELECT TO authenticated
USING (public.is_conversation_participant(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Users add participants to own conversations" ON public.conversation_participants;
CREATE POLICY "Users add participants to own conversations"
ON public.conversation_participants FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.conversations c
              WHERE c.id = conversation_id AND c.created_by = auth.uid())
);

DROP POLICY IF EXISTS "Participants update their own membership" ON public.conversation_participants;
CREATE POLICY "Participants update their own membership"
ON public.conversation_participants FOR UPDATE TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Participants read messages" ON public.messages;
CREATE POLICY "Participants read messages"
ON public.messages FOR SELECT TO authenticated
USING (public.is_conversation_participant(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Participants send messages" ON public.messages;
CREATE POLICY "Participants send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid() AND public.is_conversation_participant(conversation_id, auth.uid()));

-- Appointments: the doctor, patient or assigned caregiver can see & manage.
DROP POLICY IF EXISTS "Parties read appointments" ON public.appointments;
CREATE POLICY "Parties read appointments"
ON public.appointments FOR SELECT TO authenticated
USING (auth.uid() IN (doctor_id, patient_id, caregiver_id));

DROP POLICY IF EXISTS "Parties create appointments" ON public.appointments;
CREATE POLICY "Parties create appointments"
ON public.appointments FOR INSERT TO authenticated
WITH CHECK (auth.uid() IN (doctor_id, patient_id, caregiver_id));

DROP POLICY IF EXISTS "Parties update appointments" ON public.appointments;
CREATE POLICY "Parties update appointments"
ON public.appointments FOR UPDATE TO authenticated
USING (auth.uid() IN (doctor_id, patient_id, caregiver_id))
WITH CHECK (auth.uid() IN (doctor_id, patient_id, caregiver_id));

-- Notifications: recipients read / update (mark-read) their own.
DROP POLICY IF EXISTS "Recipients read notifications" ON public.notifications;
CREATE POLICY "Recipients read notifications"
ON public.notifications FOR SELECT TO authenticated USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Recipients update notifications" ON public.notifications;
CREATE POLICY "Recipients update notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());

-- Follow → notification. Runs SECURITY DEFINER so the follower can create a
-- notification row for the followed user without a client-side INSERT policy.
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  actor_name TEXT;
BEGIN
  IF NEW.follower_id = NEW.following_id THEN
    RETURN NEW; -- never notify yourself
  END IF;
  SELECT full_name INTO actor_name FROM public.profiles WHERE id = NEW.follower_id;
  INSERT INTO public.notifications (recipient_id, actor_id, type, entity_type, entity_id, title, body)
  VALUES (
    NEW.following_id,
    NEW.follower_id,
    'follow',
    'profile',
    NEW.follower_id::text,
    COALESCE(actor_name, 'Someone') || ' started following you',
    'Tap to view their profile'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_follow_created ON public.follows;
CREATE TRIGGER on_follow_created
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();

-- ════════════════════════════════════════════════════════════════
-- 11. SOCIAL LAYER — INDEXES & REALTIME
-- ════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts (author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON public.post_reactions (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows (following_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON public.conversation_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments (doctor_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments (patient_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications (recipient_id, is_read, created_at DESC);
-- username search (case-insensitive prefix / substring)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (lower(username));
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles (lower(full_name));

-- Enable Realtime for live chat (and live message delivery).
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════════════
-- 12. STORIES TABLE & SECURITY POLICIES
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Point the FK at public.profiles (not auth.users) so PostgREST can embed the
-- author via `profiles!stories_user_id_fkey`. profiles.id already references
-- auth.users(id), so referential integrity is preserved.
ALTER TABLE public.stories DROP CONSTRAINT IF EXISTS stories_user_id_fkey;
ALTER TABLE public.stories
  ADD CONSTRAINT stories_user_id_fkey FOREIGN KEY (user_id)
  REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to stories" ON public.stories;
CREATE POLICY "Allow public read access to stories"
ON public.stories FOR SELECT
TO public
USING (expires_at > NOW());

DROP POLICY IF EXISTS "Allow users to insert their own stories" ON public.stories;
CREATE POLICY "Allow users to insert their own stories"
ON public.stories FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own stories" ON public.stories;
CREATE POLICY "Allow users to delete their own stories"
ON public.stories FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_stories_user_expires ON public.stories (user_id, expires_at);

-- ════════════════════════════════════════════════════════════════
-- 13. ADMIN ROLE, RBAC & CONTROL PANEL
-- ════════════════════════════════════════════════════════════════

-- 13.1 Allow the 'admin' role + a suspension flag on profiles.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('doctor', 'caregiver', 'patient', 'admin'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE;

-- 13.2 Admin check helper. SECURITY DEFINER so RLS policies referencing it
-- never recurse (same pattern as is_conversation_participant).
CREATE OR REPLACE FUNCTION public.is_admin(p_uid UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_uid AND role = 'admin');
$$;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- 13.3 Admin override policies (additive — OR'd with the existing per-user ones).
DROP POLICY IF EXISTS "Admins manage all profiles" ON public.profiles;
CREATE POLICY "Admins manage all profiles" ON public.profiles FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage all posts" ON public.posts;
CREATE POLICY "Admins manage all posts" ON public.posts FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage all comments" ON public.comments;
CREATE POLICY "Admins manage all comments" ON public.comments FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 13.4 Dashboard widget visibility config (role defaults + per-user overrides).
CREATE TABLE IF NOT EXISTS public.dashboard_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scope TEXT NOT NULL CHECK (scope IN ('role', 'user')),
  scope_id TEXT NOT NULL,            -- a role name, or a user uuid (as text)
  widget_key TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (scope, scope_id, widget_key)
);
ALTER TABLE public.dashboard_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads dashboard config" ON public.dashboard_config;
CREATE POLICY "Anyone reads dashboard config" ON public.dashboard_config FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins write dashboard config" ON public.dashboard_config;
CREATE POLICY "Admins write dashboard config" ON public.dashboard_config FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_dashboard_config_lookup ON public.dashboard_config (scope, scope_id);

-- 13.5 Announcements + broadcast (fan-out to every user's notifications).
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads announcements" ON public.announcements;
CREATE POLICY "Anyone reads announcements" ON public.announcements FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.broadcast_announcement(p_title TEXT, p_body TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  a_id UUID;
  me UUID := auth.uid();
BEGIN
  IF NOT public.is_admin(me) THEN
    RAISE EXCEPTION 'Only admins can broadcast announcements';
  END IF;
  INSERT INTO public.announcements (author_id, title, body)
    VALUES (me, p_title, p_body) RETURNING id INTO a_id;
  INSERT INTO public.notifications (recipient_id, actor_id, type, entity_type, entity_id, title, body)
    SELECT p.id, me, 'announcement', 'announcement', a_id::text, p_title, p_body
      FROM public.profiles p WHERE p.id <> me;
  RETURN a_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.broadcast_announcement(TEXT, TEXT) TO authenticated;
