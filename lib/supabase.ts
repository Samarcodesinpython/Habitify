import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the entire server-side application
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

// Create a singleton for client-side usage
let clientSupabaseInstance: ReturnType<typeof createClientSupabaseClient> | null = null

export const createClientSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

export const getClientSupabaseInstance = () => {
  if (!clientSupabaseInstance) {
    clientSupabaseInstance = createClientSupabaseClient()
  }
  return clientSupabaseInstance
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
