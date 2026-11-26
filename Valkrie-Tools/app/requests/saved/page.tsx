import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SavedRequestsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="request-page"><header className="request-top"><Link href="/requests">← REQUEST BOARD</Link></header><div className="request-empty"><span>Favorit belum aktif</span><p>Hubungkan database untuk menyimpan request.</p></div></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: bookmarks } = await supabase.from('request_bookmarks').select('request_id,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(200);
  const ids = (bookmarks || []).map((item) => item.request_id);
  const { data: requests } = ids.length ? await supabase.from('public_request_board').select('id,request_number,name,description,status,vote_count,created_at').in('id', ids) : { data: [] };
  const order = new Map(ids.map((id, index) => [id, index]));
  const sorted = (requests || []).sort((a, b) => (order.get(a.id) || 0) - (order.get(b.id) || 0));
  const labels: Record<string, string> = { pending: 'Menunggu', processing: 'Diproses', completed: 'Selesai', rejected: 'Ditolak', duplicate: 'Duplikat' };
  return <main className="request-page"><header className="request-top"><Link href="/requests">← REQUEST BOARD</Link><Link href="/profile">PROFIL</Link></header><section className="request-intro"><span className="request-kicker">AKUN KAMU</span><h1>Request tersimpan</h1><p>Daftar request publik yang kamu simpan untuk dilihat lagi.</p></section><section className="request-board"><div className="request-list">{sorted.length ? sorted.map((item) => <Link className="request-card saved-request-card" href={`/requests/${item.id}`} key={item.id}><div className="request-card-meta"><span className={`request-status status-${item.status}`}>{labels[item.status] || item.status}</span><span>REQ-{item.request_number}</span><span>{item.vote_count} vote</span></div><h3>{item.name}</h3><p className="request-description">{item.description}</p><small>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(item.created_at))}</small></Link>) : <div className="request-empty"><span>Belum ada request tersimpan</span><p>Buka request lalu tekan Simpan untuk menambahkannya ke daftar ini.</p><Link href="/requests">Lihat Request Board</Link></div>}</div></section></main>;
}
