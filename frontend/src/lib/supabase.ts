import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://gqtqlmqdpqnqdlyjbpis.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdHFsbXFkcHFucWRseWpicGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTIzNDgsImV4cCI6MjA4NzIyODM0OH0.QFynd-7TN0yeO0WPVgL8xTx_svlY2l3nwA91jHRoGUU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
