import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pivgpmghepwmuxozjfwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpdmdwbWdoZXB3bXV4b3pqZnd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODExOTQzMywiZXhwIjoyMDUzNjk1NDMzfQ.8PZYatz0i2xuIH3mpfSrkQrgZTS5nyLJ-o2mS_qpNkU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 