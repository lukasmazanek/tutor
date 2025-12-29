#!/usr/bin/env node
/**
 * Initialize Supabase tables for ADR-023
 *
 * Usage: node scripts/init-supabase.js <supabase_url> <service_role_key>
 *
 * Note: Requires service_role key (not anon key) to create tables.
 * Find it in: Supabase Dashboard → Settings → API → service_role (secret)
 */

const SUPABASE_URL = process.argv[2]
const SERVICE_ROLE_KEY = process.argv[3]

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Usage: node scripts/init-supabase.js <supabase_url> <service_role_key>')
  console.error('')
  console.error('Get service_role key from:')
  console.error('  Supabase Dashboard → Settings → API → service_role (secret)')
  process.exit(1)
}

const SCHEMA_SQL = `
-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  problems_count INTEGER DEFAULT 0
);

-- Attempts table
CREATE TABLE IF NOT EXISTS attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id UUID REFERENCES sessions(id),
  question_id TEXT NOT NULL,
  question_stem TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('numeric', 'type_recognition', 'lightning')),
  hints_used INTEGER DEFAULT 0,
  hints_shown JSONB DEFAULT '[]',
  time_spent_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (use IF NOT EXISTS pattern)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_attempts_user_id') THEN
    CREATE INDEX idx_attempts_user_id ON attempts(user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_attempts_topic') THEN
    CREATE INDEX idx_attempts_topic ON attempts(topic);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_attempts_created_at') THEN
    CREATE INDEX idx_attempts_created_at ON attempts(created_at DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sessions_user_id') THEN
    CREATE INDEX idx_sessions_user_id ON sessions(user_id);
  END IF;
END $$;

-- Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- Policies (drop if exist, then create)
DROP POLICY IF EXISTS "Allow all for sessions" ON sessions;
DROP POLICY IF EXISTS "Allow all for attempts" ON attempts;
CREATE POLICY "Allow all for sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for attempts" ON attempts FOR ALL USING (true) WITH CHECK (true);
`

async function main() {
  console.log('Initializing Supabase tables...')
  console.log('URL:', SUPABASE_URL)
  console.log('')

  try {
    // Use the SQL endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql: SCHEMA_SQL })
    })

    if (response.status === 404) {
      // exec_sql function doesn't exist, try pg endpoint
      console.log('Trying alternative method...')

      const pgResponse = await fetch(`${SUPABASE_URL}/pg/query`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: SCHEMA_SQL })
      })

      if (!pgResponse.ok) {
        // Last resort: try the sql endpoint used by Supabase Studio
        const sqlResponse = await fetch(`${SUPABASE_URL}/pg/sql`, {
          method: 'POST',
          headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: SCHEMA_SQL })
        })

        if (!sqlResponse.ok) {
          const text = await sqlResponse.text()
          throw new Error(`SQL endpoint failed: ${sqlResponse.status} - ${text}`)
        }

        console.log('✓ Tables created via SQL endpoint')
      } else {
        console.log('✓ Tables created via PG endpoint')
      }
    } else if (!response.ok) {
      const text = await response.text()
      throw new Error(`RPC failed: ${response.status} - ${text}`)
    } else {
      console.log('✓ Tables created via RPC')
    }

    // Verify by querying tables
    console.log('')
    console.log('Verifying tables...')

    const verifyAttempts = await fetch(`${SUPABASE_URL}/rest/v1/attempts?select=count&limit=0`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'count=exact'
      }
    })

    const verifySessions = await fetch(`${SUPABASE_URL}/rest/v1/sessions?select=count&limit=0`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'count=exact'
      }
    })

    if (verifyAttempts.ok && verifySessions.ok) {
      console.log('✓ attempts table exists')
      console.log('✓ sessions table exists')
      console.log('')
      console.log('🎉 Supabase initialization complete!')
    } else {
      throw new Error('Tables verification failed')
    }

  } catch (error) {
    console.error('')
    console.error('❌ Error:', error.message)
    console.error('')
    console.error('The API method failed. Please run the SQL manually:')
    console.error('1. Go to Supabase Dashboard → SQL Editor')
    console.error('2. Paste contents of: lib/supabase/schema.sql')
    console.error('3. Click Run')
    process.exit(1)
  }
}

main()
