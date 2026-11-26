'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowUp, Search, Send, SlidersHorizontal } from 'lucide-react';

export type BoardRequest = {
  id: string;
  request_number: number;
  author_user_id: string;
  author_username: string;
  author_name: string;
  author_role: 'member' | 'admin';
  author_membership_tier: 'ordinary' | 'vip';
  author_city: string | null;
  name: string;
  category: string;
  description: string;
  reference_url: string | null;
  tags: string[];
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'duplicate';
  admin_reply: string | null;
  rejection_reason: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  vote_count: number;
  comment_count: number;
};

const categoryNames: Record<string, string> = {
  utility: 'Utility', web_tools: 'Web Tools', design_tools: 'Design Tools',
  developer_tools: 'Developer Tools', productivity: 'Productivity', other: 'Lainnya',
};
const statusNames: Record<string, string> = {
  pending: 'Menunggu', processing: 'Diproses', completed: 'Selesai', rejected: 'Ditolak', duplicate: 'Duplikat',
};

export function RequestBoard({ initialRequests, loggedIn }: { initialRequests: BoardRequest[]; loggedIn: boolean }) {
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const filtered = useMemo(() => requests.filter((item) => {
    const matchesText = `${item.name} ${item.description} ${item.author_name} ${item.author_user_id} ${item.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase());
    return matchesText && (category === 'all' || item.category === category) && (status === 'all' || item.status === status);
  }).sort((a, b) => sort === 'popular' ? b.vote_count - a.vote_count : sort === 'updated' ? Date.parse(b.updated_at) - Date.parse(a.updated_at) : Date.parse(b.created_at) - Date.parse(a.created_at)), [requests, search, category, status, sort]);

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice('');
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Request belum berhasil.');
      setNotice(result.message); setFormOpen(false); window.location.reload();
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Request belum bisa dikirim.'); }
    finally { setBusy(false); }
  }

  async function vote(id: string) {
    if (!loggedIn) { window.location.assign('/login'); return; }
    setNotice('');
    try {
      const response = await fetch(`/api/requests/${id}/vote`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Vote belum berhasil.');
      setRequests((items) => items.map((item) => item.id === id ? { ...item, vote_count: item.vote_count + 1 } : item));
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Vote belum berhasil.'); }
  }

  return <main className="request-page">
    <header className="request-top"><Link href="/" className="request-brand">← <span>VALKRIE<span>X969</span></span></Link><span>REQUEST BOARD</span></header>
    <section className="request-intro"><span className="request-kicker">PAPAN REQUEST PUBLIK</span><h1>Bangun tools <em>bareng.</em></h1><p>Ajukan ide, dukung request yang kamu butuhkan, dan pantau statusnya.</p><button className="request-submit-open" onClick={() => loggedIn ? setFormOpen(!formOpen) : window.location.assign('/login')}><Send size={16} /> Ajukan Tool</button></section>
    {formOpen && <form className="request-form" onSubmit={submitRequest}>
      <div className="request-form-head"><h2>Request tool baru</h2><button type="button" onClick={() => setFormOpen(false)}>Tutup</button></div>
      <label>Nama tool<input name="name" minLength={2} maxLength={120} placeholder="Contoh: PDF merge online" required /></label>
      <label>Kategori<select name="category" defaultValue="utility" required>{Object.entries(categoryNames).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      <label>Deskripsi<textarea name="description" minLength={10} maxLength={5000} rows={4} placeholder="Jelaskan fungsi dan siapa yang akan terbantu…" required /></label>
      <label>Link referensi <small>opsional</small><input name="referenceUrl" type="url" placeholder="https://…" /></label>
      <label>Tag <small>pisahkan dengan koma</small><input name="tags" placeholder="fitur baru, produktivitas" /></label>
      <p className="request-disclaimer">Pastikan request mengikuti aturan dan ketentuan layanan pihak ketiga yang dicantumkan. Request yang melanggar kebijakan bisa ditolak.</p>
      {notice && <p className="request-notice" role="status">{notice}</p>}
      <button className="request-submit-open" disabled={busy}>{busy ? 'Mengirim…' : 'Kirim request'}</button>
    </form>}

    <section className="request-board" aria-label="Daftar request">
      <div className="request-board-heading"><div><span className="request-kicker">IDE KOMUNITAS</span><h2>Request Board</h2></div><span>{filtered.length} request</span></div>
      <div className="request-filters"><label className="request-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, deskripsi, atau ID…" /></label><label className="request-filter-select"><SlidersHorizontal size={15} /><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">Semua kategori</option>{Object.entries(categoryNames).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="request-filter-select"><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Semua status</option>{Object.entries(statusNames).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="request-filter-select"><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Terbaru</option><option value="popular">Terpopuler</option><option value="updated">Terakhir diupdate</option></select></label></div>
      {notice && !formOpen && <p className="request-notice" role="status">{notice}</p>}
      {filtered.length ? <div className="request-list">{filtered.map((item) => <article className={`request-card ${item.pinned ? 'is-pinned' : ''}`} key={item.id}>
        <div className="request-card-meta"><span className={`request-status status-${item.status}`}>{statusNames[item.status]}</span><span>{categoryNames[item.category] || item.category}</span>{item.pinned && <span className="request-pin">PINNED</span>}</div>
        <h3>{item.name}</h3><p className="request-description">{item.description}</p>
        {item.admin_reply && <div className="request-admin-reply"><b>Balasan admin</b><p>{item.admin_reply}</p></div>}
        {item.rejection_reason && <div className="request-rejection"><b>Alasan</b><p>{item.rejection_reason}</p></div>}
        <div className="request-card-footer"><div className="request-author"><span>{item.author_name}</span><b className={item.author_role === 'admin' ? 'author-admin' : item.author_membership_tier === 'vip' ? 'author-vip' : ''}>{item.author_role === 'admin' ? 'ADMIN' : item.author_membership_tier === 'vip' ? 'RAKYAT VIP' : 'RAKYAT BIASA'}</b><small>{item.author_user_id}{item.author_city ? ` · ${item.author_city}` : ''}</small><time>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(item.created_at))}</time></div><button className="request-vote" aria-label={`Vote ${item.name}`} onClick={() => vote(item.id)}><ArrowUp size={17} /><span>{item.vote_count}</span><small>Vote</small></button></div>
      </article>)}</div> : <div className="request-empty"><span>Belum ada request</span><p>{initialRequests.length ? 'Coba ubah filter atau kata pencarian.' : 'Request publik akan muncul di sini setelah database disambungkan dan pengguna mulai mengajukan ide.'}</p></div>}
    </section>
    <nav className="request-bottom-nav"><Link href="/">Beranda</Link><Link href="/tools">Tools</Link><span className="active">Request</span><Link href="/profile">Akun</Link></nav>
  </main>;
}
