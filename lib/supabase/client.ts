/**
 * ADR-023 Phase 2: Supabase Client (Simplified)
 *
 * Single-user setup - no authentication required.
 * All data saved under hardcoded user_id.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Environment variables (Vite exposes VITE_ prefixed vars)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Hardcoded user ID - single user setup
export const USER_ID = 'anezka'

// Check if Supabase is configured
export function isConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

// Singleton client
let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (!isConfigured()) {
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseClient
}
