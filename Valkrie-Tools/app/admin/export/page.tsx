import Link from 'next/link';
import { redirect } from 'next/navigation';
import { RequestExport } from '@/components/admin/RequestExport';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminExportPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="admin-page"><header className="request-top"><Link href="/admin">← PANEL ADMIN</Link><span>EXPORT REQUEST</span></header><div className="request-empty"><span>Export belum aktif</span><p>Hubungkan database untuk mengekspor data request.</p></div></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') redirect('/');

  const { data: logs } = await supabase.from('admin_activity').select('id,admin_id,details,created_at').eq('action', 'requests.export').order('created_at', { ascending: false }).limit(30);
  const adminIds = Array.from(new Set((logs || []).map((log) => log.admin_id)));
  const { data: admins } = adminIds.length ? await supabase.from('public_profiles').select('id,display_name').in('id', adminIds) : { data: [] };
  const names = new Map((admins || []).map((admin) => [admin.id, admin.display_name]));
  const history = (logs || []).map((log) => ({ id: log.id, details: log.details as Record<string, unknown>, created_at: log.created_at, admin_name: names.get(log.admin_id) || 'Admin' }));
  return <main className="admin-page"><header className="request-top"><Link href="/admin">← PANEL ADMIN</Link><span>EXPORT DATA</span></header><section className="admin-header"><span className="request-kicker">ADMIN · DATA</span><h1>Export request</h1><p>Unduh data papan request sebagai CSV, dengan filter dan kolom pilihan.</p></section><RequestExport history={history} /></main>;
}
