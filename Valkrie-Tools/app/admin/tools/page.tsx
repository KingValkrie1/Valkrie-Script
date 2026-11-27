import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ToolManager, type AdminTool } from '@/components/admin/ToolManager';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminToolsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="admin-page"><header className="request-top"><Link href="/admin">← PANEL ADMIN</Link><span>KATALOG TOOLS</span></header><div className="request-empty"><span>CRUD katalog belum aktif</span><p>Contoh katalog publik tetap tersedia. Hubungkan Supabase untuk mengelola tools dari database.</p></div></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') redirect('/');
  const { data, error } = await supabase.from('tools').select('id,slug,name,category,description,website_url,icon_url,is_premium,is_published').order('name');
  const tools = (data || []) as AdminTool[];
  return <main className="admin-page"><header className="request-top"><Link href="/admin">← PANEL ADMIN</Link><span>KATALOG TOOLS</span></header><section className="admin-header"><span className="request-kicker">ADMIN · KATALOG</span><h1>Kelola tools</h1><p>Tambahkan layanan legal ke katalog, perbarui detail, atau simpan sebagai draft.</p><div className="admin-tools-links"><Link className="admin-vip-link" href="/tools">Lihat katalog publik →</Link></div></section>{error ? <p className="request-empty">Data katalog belum bisa dimuat. Periksa migration Supabase.</p> : <ToolManager initialTools={tools} />}</main>;
}
