import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AdminRequests, type AdminRequestItem } from '@/components/admin/AdminRequests';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="request-page"><header className="request-top">PANEL ADMIN · VALKRIE TOOLS</header><div className="request-empty"><span>Panel admin belum aktif</span><p>Hubungkan Supabase dan jadikan akunmu admin untuk membuka panel.</p></div></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') redirect('/');

  const { data: rows } = await supabase.from('tool_requests').select('id,request_number,user_id,name,category,description,status,admin_reply,rejection_reason,pinned,hidden,created_at').order('created_at', { ascending: false }).limit(500);
  const ids = (rows || []).map((row) => row.user_id).filter((id, index, all) => all.indexOf(id) === index);
  const { data: authors } = ids.length ? await supabase.from('public_profiles').select('id,user_id,display_name').in('id', ids) : { data: [] };
  const authorMap = new Map((authors || []).map((author) => [author.id, author]));
  const requests: AdminRequestItem[] = (rows || []).map((row) => ({ ...row, author_user_id: authorMap.get(row.user_id)?.user_id || '', author_name: authorMap.get(row.user_id)?.display_name || 'Pengguna' })) as AdminRequestItem[];
  return <main className="admin-page"><header className="request-top"><span>VALKRIE TOOLS · ADMIN</span><span>{user.email}</span></header><section className="admin-header"><span className="request-kicker">DASHBOARD</span><h1>Request masuk</h1><p>Balas, ubah status, pin, atau sembunyikan pengajuan.</p><Link className="admin-vip-link" href="/admin/vip">Kelola VIP via User ID →</Link></section><AdminRequests initialRequests={requests} /></main>;
}
