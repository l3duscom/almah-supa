#!/usr/bin/env tsx

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env file
config();

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('💡 Make sure to copy .env.example to .env and fill in your values');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Get current directory
const __dirname = process.cwd();

async function validateEnvironment() {
  console.log('🔍 Validating environment variables...');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    return false;
  }
  
  if (supabaseUrl.includes('your-supabase-url') || supabaseServiceKey.includes('your-supabase-service-role-key')) {
    console.error('❌ Please update your .env file with real Supabase credentials');
    return false;
  }
  
  console.log('✅ Environment variables look good!');
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...`);
  return true;
}

async function displayInstructions() {
  console.log('\n📋 MANUAL SETUP REQUIRED');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('Please execute the following SQL scripts in your Supabase SQL Editor:');
  console.log('(Go to: Supabase Dashboard → SQL Editor → New query)');
  console.log('');
  
  // Display migrations
  const migrationsDir = join(__dirname, 'lib/db/migrations');
  if (existsSync(migrationsDir)) {
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
      
    console.log('1️⃣ MIGRATIONS (Execute in order):');
    console.log('─────────────────────────────────────');
    
    for (const filename of migrationFiles) {
      console.log(`\n📄 ${filename}:`);
      const filepath = join(migrationsDir, filename);
      const sql = readFileSync(filepath, 'utf-8');
      console.log('```sql');
      console.log(sql);
      console.log('```');
      console.log('');
    }
  }
  
  // Display seeders
  const seedersDir = join(__dirname, 'lib/db/seeders');
  if (existsSync(seedersDir)) {
    const seederFiles = readdirSync(seedersDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
      
    console.log('\n2️⃣ SEEDERS (Execute after migrations):');
    console.log('─────────────────────────────────────────');
    
    for (const filename of seederFiles) {
      console.log(`\n📄 ${filename}:`);
      const filepath = join(seedersDir, filename);
      const sql = readFileSync(filepath, 'utf-8');
      console.log('```sql');
      console.log(sql);
      console.log('```');
      console.log('');
    }
  }
  
  console.log('\n3️⃣ CREATE SUPER ADMIN USER:');
  console.log('───────────────────────────────────');
  console.log('1. Go to: Supabase Dashboard → Authentication → Users');
  console.log('2. Click "Add user" → "Create new user"');
  console.log('3. Use email: admin@almah-supa.com');
  console.log('4. Set a password or send magic link');
  console.log('5. After user creation, run this SQL:');
  console.log('');
  console.log('```sql');
  console.log('UPDATE public.users SET role = \'super_admin\' WHERE email = \'admin@almah-supa.com\';');
  console.log('```');
  console.log('');
  console.log('✅ After completing these steps, your database will be ready!');
}

async function main() {
  try {
    console.log('🔧 Almah Supa - Database Setup Tool\n');
    
    // Validate environment
    const valid = await validateEnvironment();
    if (!valid) {
      process.exit(1);
    }
    
    await displayInstructions();
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
main();