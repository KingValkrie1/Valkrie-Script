import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase belum dikonfigurasi. Isi variabel NEXT_PUBLIC_SUPABASE_* terlebih dahulu.');
  return createBrowserClient(url, key);
}
