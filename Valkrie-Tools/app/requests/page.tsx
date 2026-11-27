import { RequestBoard, type BoardRequest } from '@/components/requests/RequestBoard';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { previewRequests } from '@/data/request-preview';

export const dynamic = 'force-dynamic';

export default async function RequestsPage() {
  let initialRequests: BoardRequest[] = [];
  let loggedIn = false;
  const previewMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (previewMode) initialRequests = previewRequests;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createSupabaseServerClient();
      const [{ data }, { data: { user } }] = await Promise.all([
        supabase.from('public_request_board').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(100),
        supabase.auth.getUser(),
      ]);
      initialRequests = (data || []) as BoardRequest[];
      loggedIn = Boolean(user);
    } catch { /* Show the setup-aware empty state until Supabase is connected. */ }
  }
  return <RequestBoard initialRequests={initialRequests} loggedIn={loggedIn} previewMode={previewMode} />;
}
