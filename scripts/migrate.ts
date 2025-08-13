#!/usr/bin/env tsx

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
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

async function createMigrationsTable() {
  const { error } = await supabase
    .from('_migrations')
    .select('id')
    .limit(1);
    
  // Table doesn't exist, create it
  if (error && error.code === 'PGRST116') {
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS public._migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Enable RLS
      ALTER TABLE public._migrations ENABLE ROW LEVEL SECURITY;
      
      -- Allow service role to access
      CREATE POLICY "Service role can manage migrations" ON public._migrations
        FOR ALL USING (true);
    `;
    
    const { error: createError } = await supabase.rpc('exec', { 
      sql: createTableSql 
    });
    
    if (createError) {
      console.error('❌ Error creating migrations table:', createError);
      throw createError;
    }
  }
}

async function getExecutedMigrations(): Promise<string[]> {
  const { data, error } = await supabase
    .from('_migrations')
    .select('filename')
    .order('id');
    
  if (error && error.code !== 'PGRST116') { // Table doesn't exist
    console.error('❌ Error fetching executed migrations:', error);
    throw error;
  }
  
  return data?.map(row => row.filename) || [];
}

async function executeSqlFile(filepath: string, filename: string): Promise<void> {
  const sql = readFileSync(filepath, 'utf-8');
  
  console.log(`📝 Executing ${filename}...`);
  
  const { error } = await supabase.rpc('exec', { sql });
  
  if (error) {
    console.error(`❌ Error executing ${filename}:`, error);
    throw error;
  }
  
  // Record migration as executed
  await supabase
    .from('_migrations')
    .insert({ filename });
    
  console.log(`✅ ${filename} executed successfully`);
}

async function runMigrations() {
  console.log('🚀 Starting migrations...\n');
  
  // Create migrations tracking table
  await createMigrationsTable();
  
  // Get list of executed migrations
  const executedMigrations = await getExecutedMigrations();
  
  // Get all migration files
  const migrationsDir = join(__dirname, 'lib/db/migrations');
  const migrationFiles = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
    
  if (migrationFiles.length === 0) {
    console.log('📄 No migration files found');
    return;
  }
  
  // Execute pending migrations
  let executedCount = 0;
  for (const filename of migrationFiles) {
    if (!executedMigrations.includes(filename)) {
      const filepath = join(migrationsDir, filename);
      await executeSqlFile(filepath, filename);
      executedCount++;
    } else {
      console.log(`⏭️  ${filename} already executed, skipping`);
    }
  }
  
  if (executedCount === 0) {
    console.log('✨ All migrations are up to date!');
  } else {
    console.log(`\n✅ Executed ${executedCount} migrations successfully!`);
  }
}

async function runSeeders() {
  console.log('\n🌱 Starting seeders...\n');
  
  const seedersDir = join(__dirname, 'lib/db/seeders');
  
  try {
    const seederFiles = readdirSync(seedersDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
      
    if (seederFiles.length === 0) {
      console.log('📄 No seeder files found');
      return;
    }
    
    for (const filename of seederFiles) {
      const filepath = join(seedersDir, filename);
      const sql = readFileSync(filepath, 'utf-8');
      
      console.log(`🌱 Running seeder ${filename}...`);
      
      const { error } = await supabase.rpc('exec', { sql });
      
      if (error) {
        console.error(`❌ Error running seeder ${filename}:`, error);
        throw error;
      }
      
      console.log(`✅ ${filename} completed successfully`);
    }
    
    console.log('\n✅ All seeders completed successfully!');
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      console.log('📄 No seeders directory found, skipping seeders');
    } else {
      throw error;
    }
  }
}

async function main() {
  try {
    console.log('🔧 Almah Supa - Database Migration Tool\n');
    
    // Test connection
    const { error: connectionError } = await supabase.from('_migrations').select('count').limit(1);
    if (connectionError && connectionError.code !== 'PGRST116') {
      console.error('❌ Failed to connect to Supabase:', connectionError);
      process.exit(1);
    }
    
    await runMigrations();
    await runSeeders();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Create a super admin user in Supabase Auth dashboard');
    console.log('2. Use email: admin@almah-supa.com');
    console.log('3. The user will automatically get super_admin role');
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runMigrations, runSeeders };