import Link from 'next/link';
import { redirect } from 'next/navigation';
import { VipManager } from '@/components/admin/VipManager';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminVipPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="admin-page"><header className="request-top"><Link href="/admin">← PANEL ADMIN</Link><span>KELOLA VIP</span></header><div className="request-empty"><span>Kelola VIP belum aktif</span><p>Hubungkan database dan tandai akunmu sebagai admin untuk menggunakan fitur ini.</p></div></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') redirect('/');

  const { data: rows } = await supabase.from('vip_history').select('id,user_id,changed_by,action,duration_days,permanent,note,created_at').order('created_at', { ascending: false }).limit(100);
  const ids = (rows || []).flatMap((row) => [row.user_id, row.changed_by].filter(Boolean) as string[]).filter((id, index, all) => all.indexOf(id) === index);
  const { data: people } = ids.length ? await supabase.from('public_profiles').select('id,user_id,display_name').in('id', ids) : { data: [] };
  const peopleById = new Map((people || []).map((person) => [person.id, person]));
  const history = (rows || []).map((row) => ({ ...row, target_name: peopleById.get(row.user_id)?.display_name || 'Pengguna', target_user_id: peopleById.get(row.user_id)?.user_id || '', admin_name: row.changed_by ? peopleById.get(row.changed_by)?.display_name || 'Admin' : 'Admin sistem' }));

  return <main className="admin-page"><header className="request-top"><Link href="/admin">← PANEL ADMIN</Link><span>KELOLA VIP</span></header><section className="admin-header"><span className="request-kicker">ADMIN · MEMBER</span><h1>Kelola VIP</h1><p>Cari user berdasarkan ID, atur masa VIP, dan lihat riwayat perubahannya.</p></section><VipManager history={history} /></main>;
}
