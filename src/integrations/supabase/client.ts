import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ukjzonmwprapooqjfjdw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVranpvbm13cHJhcG9vcWpmamR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MDc1MjUsImV4cCI6MjA4NjE4MzUyNX0.eRljeKET2yz3msFo4ISCX6m-JIAqBgn-JIv50997soE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
