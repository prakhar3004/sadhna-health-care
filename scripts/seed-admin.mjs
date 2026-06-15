// Sadhna Health Care — Seed the default super-admin account.
// Usage: SUPABASE_DB_PASSWORD=<db-password> node scripts/seed-admin.mjs
// Optionally override: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
import pg from 'pg';

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error('❌ Set SUPABASE_DB_PASSWORD in the environment first.');
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sadhna.health';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@Sadhna2026';
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Administrator';

const connectionString =
  `postgresql://postgres.dawxutkvxdnprypjmuhm:${encodeURIComponent(password)}` +
  `@aws-1-ap-south-1.pooler.supabase.com:5432/postgres`;

const sql = `
DELETE FROM auth.users WHERE email = '${ADMIN_EMAIL}';

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'authenticated', 'authenticated',
  '${ADMIN_EMAIL}',
  crypt('${ADMIN_PASSWORD}', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "${ADMIN_NAME}", "role": "admin"}'::jsonb,
  now(), now()
);

-- The on_auth_user_created trigger inserts the profile row; finalise it as a
-- verified, completed admin profile.
UPDATE public.profiles p
   SET role = 'admin',
       full_name = '${ADMIN_NAME}',
       is_verified = TRUE,
       is_profile_complete = TRUE,
       is_suspended = FALSE,
       updated_at = now()
  FROM auth.users u
 WHERE p.id = u.id AND u.email = '${ADMIN_EMAIL}';

-- GoTrue requires these token columns to be '' (not NULL) for SQL-seeded users,
-- otherwise sign-in fails with "Invalid login credentials".
UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000',
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, '')
WHERE email = '${ADMIN_EMAIL}';
`;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    `SELECT p.id, p.role, p.is_verified, p.is_profile_complete
       FROM public.profiles p JOIN auth.users u ON u.id = p.id
      WHERE u.email = $1`,
    [ADMIN_EMAIL]
  );
  console.log('✅ Admin seeded:', ADMIN_EMAIL);
  console.log('   profile:', JSON.stringify(rows[0]));
} catch (err) {
  console.error('❌ Failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
