import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cermoxufgnuhgdexkbfp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlcm1veHVmZ251aGdkZXhrYmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NzA2MTAsImV4cCI6MjA5NTQ0NjYxMH0.IVWFw-_fqJWM_m0VgSuIAUfgG8hTogjmOJwPe3eywNw';

export const supabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
