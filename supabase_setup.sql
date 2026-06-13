-- Sadhna Health Care — Database Setup & Security Schema
-- Execute this SQL script in the Supabase SQL Editor to configure your database.

-- 1. PROFILES TABLE
-- Create a public profiles table linked to Supabase auth.users
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
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable Row Level Security (RLS) on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read profiles
CREATE POLICY "Allow public read access to profiles" 
ON public.profiles FOR SELECT 
TO public 
USING (true);

-- Policy: Users can only update their own profile details
CREATE POLICY "Allow users to update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 3. AUTOMATIC PROFILE CREATION TRIGGER
-- This database trigger automatically inserts a row in public.profiles when a new user 
-- registers via Supabase Auth, copying metadata fields (full_name, role) specified during signup.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  new_username TEXT;
  raw_role TEXT;
  raw_fullname TEXT;
BEGIN
  -- Extract user metadata sent from the application register flow
  raw_fullname := COALESCE(new.raw_user_meta_data->>'full_name', 'New User');
  raw_role := COALESCE(new.raw_user_meta_data->>'role', 'patient');
  
  -- Create a unique username from full_name (e.g. rahul.verma)
  new_username := lower(regexp_replace(raw_fullname, '\s+', '.', 'g')) || '.' || substring(md5(random()::text) from 1 for 4);

  INSERT INTO public.profiles (
    id,
    role,
    full_name,
    username,
    avatar_url,
    is_verified,
    is_online,
    created_at,
    updated_at
  ) VALUES (
    new.id,
    raw_role,
    raw_fullname,
    new_username,
    new.raw_user_meta_data->>'avatar_url',
    FALSE,
    TRUE,
    COALESCE(new.created_at, NOW()),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Execute the function whenever a new user is created in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. VITALS LOGS TABLE
CREATE TABLE IF NOT EXISTS public.vitals_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sugar INTEGER NOT NULL,
  bp INTEGER NOT NULL,
  heart_rate INTEGER NOT NULL,
  log_date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LIFE GOALS TABLE
CREATE TABLE IF NOT EXISTS public.life_goals (
  id TEXT PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CARE ALERTS TABLE
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

-- 7. TREATMENT HISTORY TABLE
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

-- 8. SOS CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.sos_contacts (
  id TEXT PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. EMERGENCY REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id TEXT PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  hospital TEXT NOT NULL,
  reason TEXT NOT NULL,
  required_amount INTEGER NOT NULL,
  raised_amount INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('verified', 'pending', 'rejected')),
  partner_ngo TEXT NOT NULL,
  document_name TEXT,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SEVA POOL TABLE
CREATE TABLE IF NOT EXISTS public.seva_pool (
  id TEXT PRIMARY KEY,
  amount INTEGER DEFAULT 485200,
  contributors INTEGER DEFAULT 1240,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Seva Pool Record
INSERT INTO public.seva_pool (id, amount, contributors)
VALUES ('main_pool', 485200, 1240)
ON CONFLICT (id) DO NOTHING;


-- ─── ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────
-- Enable RLS
ALTER TABLE public.vitals_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seva_pool ENABLE ROW LEVEL SECURITY;

-- Vitals policies
CREATE POLICY "Allow users to manage their own vitals" 
ON public.vitals_logs FOR ALL TO authenticated 
USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- Life Goals policies
CREATE POLICY "Allow users to manage their own life goals" 
ON public.life_goals FOR ALL TO authenticated 
USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- Care Alerts policies
CREATE POLICY "Allow users to manage their own care alerts" 
ON public.care_alerts FOR ALL TO authenticated 
USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- Treatment History policies
CREATE POLICY "Allow users to manage their own treatment history" 
ON public.treatment_history FOR ALL TO authenticated 
USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- SOS Contacts policies
CREATE POLICY "Allow users to manage their own sos contacts" 
ON public.sos_contacts FOR ALL TO authenticated 
USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- Emergency Requests policies
CREATE POLICY "Allow public read access to emergency requests" 
ON public.emergency_requests FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to create emergency requests" 
ON public.emergency_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Allow authenticated users to update emergency requests (donations)" 
ON public.emergency_requests FOR UPDATE TO authenticated USING (true);

-- Seva Pool policies
CREATE POLICY "Allow public read access to seva pool" 
ON public.seva_pool FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to update seva pool" 
ON public.seva_pool FOR UPDATE TO authenticated USING (true);


-- ─── PERFORMANCE INDEXING STRATEGY (100K+ USERS) ───────────────
-- Indexes on patient_id for fast patient-specific retrieval
CREATE INDEX IF NOT EXISTS idx_vitals_patient_date ON public.vitals_logs (patient_id, log_date);
CREATE INDEX IF NOT EXISTS idx_life_goals_patient ON public.life_goals (patient_id);
CREATE INDEX IF NOT EXISTS idx_care_alerts_patient ON public.care_alerts (patient_id, completed);
CREATE INDEX IF NOT EXISTS idx_treatment_history_patient ON public.treatment_history (patient_id);
CREATE INDEX IF NOT EXISTS idx_sos_contacts_patient ON public.sos_contacts (patient_id);

-- Index on emergency requests status for active requests filtering
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON public.emergency_requests (status);

