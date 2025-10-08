import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mmswrzfxocebcuzyfnwa.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tc3dyemZ4b2NlYmN1enlmbndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTY4MTgsImV4cCI6MjA3NTQ3MjgxOH0.JGa-NGGn-n3mtJ7mWJITDkGZoYBLPEHRVPqJCU9URC0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'woovb-videos'

