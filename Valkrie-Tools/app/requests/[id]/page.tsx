import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RequestDetail, type PublicComment } from '@/components/requests/RequestDetail';
import type { BoardRequest } from '@/components/requests/RequestBoard';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="request-page"><header className="request-top"><Link href="/requests" className="request-brand">← REQUEST BOARD</Link><span>VALKRIE X969</span></header><div className="request-empty"><span>Database belum tersambung</span><p>Detail request akan tampil setelah database disiapkan.</p></div></main>;

  const supabase = await createSupabaseServerClient();
  const [{ data: row }, { data: commentRows }, { data: { user } }] = await Promise.all([
    supabase.from('public_request_board').select('*').eq('id', params.id).maybeSingle(),
    supabase.from('request_comments').select('id,user_id,body,created_at').eq('request_id', params.id).order('created_at', { ascending: true }),
    supabase.auth.getUser(),
  ]);
  if (!row) notFound();

  const ids = (commentRows || []).map((comment) => comment.user_id).filter((id, index, allIds) => allIds.indexOf(id) === index);
  const { data: authors } = ids.length ? await supabase.from('public_profiles').select('id,user_id,display_name,role,membership_tier').in('id', ids) : { data: [] };
  const authorMap = new Map((authors || []).map((author) => [author.id, author]));
  const comments: PublicComment[] = (commentRows || []).map((comment) => {
    const author = authorMap.get(comment.user_id);
    return { ...comment, author_name: author?.display_name || 'Pengguna', author_user_id: author?.user_id || '', author_role: author?.role || 'member', author_membership_tier: author?.membership_tier || 'ordinary' };
  });
  let isBookmarked = false;
  if (user) {
    const { data: bookmark } = await supabase.from('request_bookmarks').select('request_id').eq('request_id', params.id).eq('user_id', user.id).maybeSingle();
    isBookmarked = Boolean(bookmark);
  }

  return <RequestDetail request={{ ...row, is_bookmarked: isBookmarked } as BoardRequest} comments={comments} loggedIn={Boolean(user)} viewerId={user?.id || null} />;
}
