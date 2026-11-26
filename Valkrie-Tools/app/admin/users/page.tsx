import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserDirectory, type AdminDirectoryUser } from '@/components/admin/UserDirectory';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="admin-page"><header className="request-top"><Link href="/admin">← PANEL ADMIN</Link><span>BUKU USER</span></header><div className="request-empty"><span>Daftar user belum aktif</span><p>Hubungkan database untuk mengelola pengguna.</p></div></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') redirect('/');
  const { data } = await supabase.from('public_profiles').select('id,user_id,username,display_name,avatar_url,role,membership_tier,vip_expires_at,vip_permanent,joined_at').order('joined_at', { ascending: false }).limit(500);
  const users = (data || []).map((person) => ({ ...person, vip_active: person.membership_tier === 'vip' && (person.vip_permanent || Boolean(person.vip_expires_at && new Date(person.vip_expires_at).getTime() > Date.now())) })) as AdminDirectoryUser[];
  return <main className="admin-page"><header className="request-top"><Link href="/admin">← PANEL ADMIN</Link><span>BUKU USER</span></header><section className="admin-header"><span className="request-kicker">ADMIN · AKUN</span><h1>Daftar pengguna</h1><p>Cari berdasarkan nama, username, atau User ID. Email pengguna tidak ditampilkan.</p><div className="admin-tools-links"><Link className="admin-vip-link" href="/admin/vip">Kelola VIP →</Link></div></section><UserDirectory users={users} /></main>;
}
