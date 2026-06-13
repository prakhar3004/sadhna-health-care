// Sadhna Health Care — Apply schema directly over a pooled Postgres connection.
// Pure Node (node-postgres) — no subprocess, so it works where the CLI's
// db-push cannot spawn its helper in this sandbox.
//
// Usage (password is read from the env, never the command line):
//   SUPABASE_DB_PASSWORD=<your-db-password> node scripts/apply-schema.mjs
import { readFileSync } from 'node:fs';
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

const sql = readFileSync(new URL('../supabase_setup.sql', import.meta.url), 'utf8');

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('🔌 Connected. Applying schema (idempotent) ...');
  await client.query(sql); // whole script runs as one simple-protocol batch
  console.log('✅ Schema applied successfully.');
} catch (err) {
  console.error('❌ Failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
