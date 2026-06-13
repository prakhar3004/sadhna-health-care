// Sadhna Health Care — Live backend verification
// Usage: node scripts/verify-supabase.mjs
// Reads EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY from .env and
// checks the connection + that the schema migration has been applied.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const env = {};
  try {
    for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].trim();
    }
  } catch {}
  return env;
}

const env = loadEnv();
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const key = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key || url.includes('your-project') || key.includes('your-anon-key')) {
  console.error('❌ .env still has placeholder credentials — fill in real values first.');
  process.exit(1);
}

console.log(`🔌 Connecting to ${url} ...`);
const supabase = createClient(url, key, { auth: { persistSession: false } });

const tables = [
  'profiles', 'posts', 'post_reactions', 'comments', 'bookmarks', 'follows',
  'conversations', 'conversation_participants', 'messages',
  'appointments', 'notifications', 'seva_pool',
];

let ok = 0;
let missing = 0;
for (const t of tables) {
  // Plain GET (not head/count) so a missing table reliably surfaces as an error.
  const { error } = await supabase.from(t).select('*').limit(1);
  if (error) {
    // 42P01 = undefined_table; PGRST205 = not in PostgREST schema cache → not live
    const notThere = error.code === '42P01' || error.code === 'PGRST205' || /does not exist|could not find the table/i.test(error.message);
    console.log(`  ${notThere ? '❌ MISSING' : '⚠️  ' + error.message.slice(0, 60)}  ${t}`);
    if (notThere) missing++;
  } else {
    console.log(`  ✅ ${t}`);
    ok++;
  }
}

console.log('');
if (missing > 0) {
  console.error(`❌ ${missing} table(s) missing — run supabase_setup.sql in the SQL Editor (or "supabase db push").`);
  process.exit(1);
} else {
  console.log(`✅ Live backend reachable and schema present (${ok}/${tables.length} tables). You're live!`);
}
