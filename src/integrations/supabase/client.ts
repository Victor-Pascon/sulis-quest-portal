import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase env vars missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Functionality requiring a database will not work.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

