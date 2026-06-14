// Sadhna Health Care — Seed Live Supabase Database with Test Users & Sample Data
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
-- 1. Clean up existing test users if they exist
DELETE FROM auth.users WHERE email IN ('doctor@test.com', 'caregiver@test.com', 'patient@test.com');

-- 2. Insert Test Users into auth.users (with confirmed email and encrypted password)
INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES 
(
  'd0c70410-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'doctor@test.com',
  crypt('TestPassword123!', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "Dr. Priya Sharma", "role": "doctor"}'::jsonb,
  now(),
  now()
),
(
  'ca7e0410-0000-0000-0000-000000000002',
  'authenticated',
  'authenticated',
  'caregiver@test.com',
  crypt('TestPassword123!', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "Anita Desai", "role": "caregiver"}'::jsonb,
  now(),
  now()
),
(
  'a71e0410-0000-0000-0000-000000000003',
  'authenticated',
  'authenticated',
  'patient@test.com',
  crypt('TestPassword123!', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "Rahul Verma", "role": "patient"}'::jsonb,
  now(),
  now()
);

-- Note: The database trigger 'on_auth_user_created' automatically created corresponding rows in public.profiles.
-- Now we update public.profiles with completed role-specific details.

-- 3. Update Doctor Profile
UPDATE public.profiles
SET 
  username = 'dr.priya',
  bio = 'Senior Cardiologist with 15+ years of experience. Passionate about preventive healthcare and patient education.',
  specialization = 'Cardiology',
  license_number = 'MCI-12345',
  experience_years = 15,
  location = 'Mumbai, Maharashtra',
  phone = '+91 98765 43210',
  is_verified = TRUE,
  is_profile_complete = TRUE
WHERE id = 'd0c70410-0000-0000-0000-000000000001';

-- 4. Update Caregiver Profile
UPDATE public.profiles
SET 
  username = 'anita.care',
  bio = 'Dedicated caregiver for elderly patients. Specializing in post-operative care and rehabilitation support.',
  experience_years = 8,
  location = 'Delhi, NCR',
  phone = '+91 87654 32109',
  is_verified = TRUE,
  is_profile_complete = TRUE,
  caregiver_type = 'professional'
WHERE id = 'ca7e0410-0000-0000-0000-000000000002';

-- 5. Update Patient Profile
UPDATE public.profiles
SET 
  username = 'rahul.v',
  bio = 'Managing diabetes and staying active. Sharing my health journey to inspire others.',
  location = 'Bangalore, Karnataka',
  phone = '+91 76543 21098',
  is_profile_complete = TRUE,
  chronic_condition = 'Diabetes'
WHERE id = 'a71e0410-0000-0000-0000-000000000003';

-- 6. Seed Vitals Logs (including some abnormal values to trigger alerts for the doctor)
INSERT INTO public.vitals_logs (
  patient_id, sugar, bp, heart_rate, log_date
) VALUES 
(
  'a71e0410-0000-0000-0000-000000000003',
  245, -- Abnormal sugar (>180, >240 critical)
  145, -- Abnormal bp (>140)
  105, -- Abnormal heart rate (>100)
  '2026-06-14'
);

-- 7. Seed Appointments (between Doctor and Patient/Caregiver)
INSERT INTO public.appointments (
  id, doctor_id, patient_id, caregiver_id, scheduled_at, duration_minutes, status, type, notes
) VALUES 
(
  'f0c70410-0000-0000-0000-000000000001',
  'd0c70410-0000-0000-0000-000000000001',
  'a71e0410-0000-0000-0000-000000000003',
  'ca7e0410-0000-0000-0000-000000000002',
  now() + interval '2 hours',
  30,
  'pending',
  'video_call',
  'Initial consultation for diabetes management and blood pressure checks.'
),
(
  'f0c70410-0000-0000-0000-000000000002',
  'd0c70410-0000-0000-0000-000000000001',
  'a71e0410-0000-0000-0000-000000000003',
  NULL,
  now() + interval '1 day',
  30,
  'confirmed',
  'in_person',
  'Routine checkup.'
);

-- 8. Seed Emergency Medical Funding Request (Seva verification queue)
INSERT INTO public.emergency_requests (
  id, patient_id, patient_name, hospital, reason, required_amount, raised_amount, status, partner_ngo, document_name, date
) VALUES 
(
  'req-001',
  'a71e0410-0000-0000-0000-000000000003',
  'Rahul Verma',
  'City Heart Hospital',
  'Urgent angioplasty and cardiac care. Need financial support for surgery and medicines.',
  150000,
  0,
  'pending',
  'Sadhna Health Foundation',
  'medical_certificate.pdf',
  '2026-06-14'
);

-- 9. Seed Posts (feed)
INSERT INTO public.posts (
  id, author_id, content, media_urls, post_type, visibility, likes_count, comments_count
) VALUES 
(
  'e0c70410-0000-0000-0000-000000000001',
  'd0c70410-0000-0000-0000-000000000001',
  'Preventive Care Tip: Regular monitoring of blood pressure and moderate exercise (like 30 mins brisk walking) can reduce cardiovascular risk by 30%. Stay healthy!',
  '{}',
  'post',
  'public',
  0,
  0
),
(
  'e0c70410-0000-0000-0000-000000000002',
  'a71e0410-0000-0000-0000-000000000003',
  'Hello everyone, I was diagnosed with Type-2 Diabetes last month. Any tips on managing blood sugar levels during morning walks?',
  '{}',
  'post',
  'public',
  0,
  0
),
(
  'e0c70410-0000-0000-0000-000000000003',
  'ca7e0410-0000-0000-0000-000000000002',
  'Caring for elder patients with chronic pain requires a structured routine. Sticking to scheduled medicines and keeping logs of daily vitals has helped us immensely.',
  '{}',
  'post',
  'public',
  0,
  0
);
`;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('🔌 Connected to Supabase Postgres. Seeding database...');
  await client.query(sql);
  console.log('✅ Database seeded successfully with confirmed test users and sample data.');
} catch (err) {
  console.error('❌ Database seeding failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
