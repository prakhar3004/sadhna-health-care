const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
const envPath = path.join(__dirname, '..', '.env');
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key === 'EXPO_PUBLIC_SUPABASE_URL') {
        SUPABASE_URL = val;
      } else if (key === 'EXPO_PUBLIC_SUPABASE_ANON_KEY') {
        SUPABASE_ANON_KEY = val;
      }
    }
  }
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: URL or ANON_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log('Fetching profiles...');
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Error fetching profiles:', error.message);
  } else {
    console.log(`Found ${data.length} profiles:`);
    data.forEach(p => {
      console.log(`- ID: ${p.id}, Name: ${p.full_name}, Email/Username: ${p.username}, Role: ${p.role}`);
    });
  }
}

run();
