// Sadhna Health Care — Seed ONLY the 3 role test users (no sample content).
// Pre-confirmed accounts so they can log in immediately without email confirmation.
// Usage: SUPABASE_DB_PASSWORD=<db-password> node scripts/seed-test-users.mjs
import pg from 'pg';

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error('❌ Set SUPABASE_DB_PASSWORD in the environment first.');
  process.exit(1);
}

const connectionString =
  `postgresql://postgres.dawxutkvxdnprypjmuhm:${encodeURIComponent(password)}` +
  `@aws-1-ap-south-1.pooler.supabase.com:5432/postgres`;

const sql = `
-- 1. Remove any prior copies of these test accounts (cascades their data).
DELETE FROM auth.users WHERE email IN ('doctor@test.com', 'caregiver@test.com', 'patient@test.com');

-- 2. Create the 3 confirmed accounts (the on_auth_user_created trigger creates
--    the matching public.profiles rows automatically).
INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES
('d0c70410-0000-0000-0000-000000000001','authenticated','authenticated','doctor@test.com',
  crypt('TestPassword123!', gen_salt('bf')), now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "Dr. Priya Sharma", "role": "doctor"}'::jsonb, now(), now()),
('ca7e0410-0000-0000-0000-000000000002','authenticated','authenticated','caregiver@test.com',
  crypt('TestPassword123!', gen_salt('bf')), now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "Anita Desai", "role": "caregiver"}'::jsonb, now(), now()),
('a71e0410-0000-0000-0000-000000000003','authenticated','authenticated','patient@test.com',
  crypt('TestPassword123!', gen_salt('bf')), now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "Rahul Verma", "role": "patient"}'::jsonb, now(), now());

-- 3. Finalise each profile (verified + complete so they skip onboarding).
UPDATE public.profiles SET username='dr.priya', bio='Senior Cardiologist with 15+ years of experience.',
  specialization='Cardiology', license_number='MCI-12345', experience_years=15,
  location='Mumbai, Maharashtra', phone='+91 98765 43210', is_verified=TRUE, is_profile_complete=TRUE
  WHERE id='d0c70410-0000-0000-0000-000000000001';

UPDATE public.profiles SET username='anita.care', bio='Dedicated caregiver for elderly patients.',
  experience_years=8, location='Delhi, NCR', phone='+91 87654 32109',
  is_verified=TRUE, is_profile_complete=TRUE, caregiver_type='professional'
  WHERE id='ca7e0410-0000-0000-0000-000000000002';

UPDATE public.profiles SET username='rahul.v', bio='Managing diabetes and staying active.',
  location='Bangalore, Karnataka', phone='+91 76543 21098',
  is_profile_complete=TRUE, chronic_condition='Diabetes'
  WHERE id='a71e0410-0000-0000-0000-000000000003';

-- 4. GoTrue requires these token columns to be '' (not NULL) for SQL-seeded
--    users, else sign-in fails with "Invalid login credentials".
UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000',
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, '')
WHERE email IN ('doctor@test.com', 'caregiver@test.com', 'patient@test.com');
`;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    `SELECT full_name, role, username, is_profile_complete FROM public.profiles
      WHERE id IN ('d0c70410-0000-0000-0000-000000000001','ca7e0410-0000-0000-0000-000000000002','a71e0410-0000-0000-0000-000000000003')
      ORDER BY role`
  );
  console.log('✅ Seeded 3 test users (no sample content):');
  rows.forEach((r) => console.log('   ', JSON.stringify(r)));
} catch (err) {
  console.error('❌ Failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
