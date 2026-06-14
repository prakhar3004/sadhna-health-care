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
  const email = 'doctor@test.com';
  const password = 'TestPassword123!';

  console.log(`Trying to sign in with ${email}...`);
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.log('SignIn failed:', error.message, error.status);
    console.log('Trying to sign up...');
    
    const signUpResult = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: 'Dr. Priya Sharma',
          role: 'doctor',
        }
      }
    });

    if (signUpResult.error) {
      console.log('SignUp failed:', signUpResult.error.message, signUpResult.error.status);
    } else {
      console.log('SignUp succeeded:', signUpResult.data);
    }
  } else {
    console.log('SignIn succeeded:', data);
  }
}

run();
