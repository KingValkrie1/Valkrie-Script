'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ArrowUp, Copy, Send } from 'lucide-react';
import type { BoardRequest } from '@/components/requests/RequestBoard';

export type PublicComment = { id: string; user_id: string; body: string; created_at: string; author_name: string; author_user_id: string; author_role: 'member' | 'admin'; author_membership_tier: 'ordinary' | 'vip' };
const categories: Record<string, string> = { utility: 'Utility', web_tools: 'Web Tools', design_tools: 'Design Tools', developer_tools: 'Developer Tools', productivity: 'Productivity', other: 'Lainnya' };
const statuses: Record<string, string> = { pending: 'Menunggu', processing: 'Diproses', completed: 'Selesai', rejected: 'Ditolak', duplicate: 'Duplikat' };

export function RequestDetail({ request, comments, loggedIn, viewerId }: { request: BoardRequest; comments: PublicComment[]; loggedIn: boolean; viewerId: string | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const canEdit = loggedIn && viewerId === request.author_uuid && !request.admin_reply;

  async function sendComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice('');
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch(`/api/requests/${request.id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Komentar belum terkirim.');
      form.reset(); router.refresh(); setNotice('Komentar terkirim.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Komentar belum terkirim.'); }
    finally { setBusy(false); }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice('');
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch(`/api/requests/${request.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Perubahan belum tersimpan.');
      setEditing(false); router.refresh(); setNotice(result.message);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Perubahan belum tersimpan.'); }
    finally { setBusy(false); }
  }

  async function deleteRequest() {
    if (!window.confirm('Hapus request ini?')) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/requests/${request.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Request belum bisa dihapus.');
      router.push('/requests'); router.refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Request belum bisa dihapus.'); setBusy(false); }
  }

  async function vote() {
    if (!loggedIn) { window.location.assign('/login'); return; }
    try {
      const response = await fetch(`/api/requests/${request.id}/vote`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Vote belum berhasil.');
      router.refresh(); setNotice('Vote tersimpan.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Vote belum berhasil.'); }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setNotice('Link request disalin.');
  }

  return <main className="request-page">
    <header className="request-top"><Link href="/requests" className="request-brand">← <span>REQUEST BOARD</span></Link><Link href="/" className="request-brand"><span>VALKRIE<span>X969</span></span></Link></header>
    <article className="request-detail-card">
      <div className="request-card-meta"><span className={`request-status status-${request.status}`}>{statuses[request.status]}</span><span>{categories[request.category] || request.category}</span>{request.pinned && <span className="request-pin">PINNED</span>}<span className="request-number">REQ-{request.request_number}</span></div>
      <h1>{request.name}</h1>
      <div className="request-detail-author"><b>{request.author_name}</b><span className={request.author_role === 'admin' ? 'author-admin' : request.author_membership_tier === 'vip' ? 'author-vip' : ''}>{request.author_role === 'admin' ? 'ADMIN' : request.author_membership_tier === 'vip' ? 'RAKYAT VIP' : 'RAKYAT BIASA'}</span><small>{request.author_user_id}{request.author_city ? ` · ${request.author_city}` : ''} · {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(request.created_at))}</small></div>
      <p className="request-detail-description">{request.description}</p>
      {request.tags?.length > 0 && <div className="request-tags">{request.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}
      {request.reference_url && <a className="request-reference" href={request.reference_url} target="_blank" rel="noreferrer">Buka link referensi ↗</a>}
      {request.admin_reply && <div className="request-admin-reply"><b>Balasan admin</b><p>{request.admin_reply}</p></div>}
      {request.rejection_reason && <div className="request-rejection"><b>Alasan penolakan</b><p>{request.rejection_reason}</p></div>}
      <div className="request-detail-actions"><button className="request-vote" onClick={vote}><ArrowUp size={17} /><span>{request.vote_count}</span><small>Vote</small></button><button className="request-share" onClick={copyLink}><Copy size={15} /> Salin link</button>{canEdit && <><button className="request-share" onClick={() => setEditing(!editing)}>{editing ? 'Tutup edit' : 'Edit request'}</button><button className="request-delete" disabled={busy} onClick={deleteRequest}>Hapus</button></>}</div>
      {notice && <p className="request-notice" role="status">{notice}</p>}
      {editing && <form className="request-form request-edit-form" onSubmit={saveEdit}><h2>Edit request</h2><label>Nama tool<input name="name" defaultValue={request.name} minLength={2} maxLength={120} required /></label><label>Kategori<select name="category" defaultValue={request.category}>{Object.entries(categories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>Deskripsi<textarea name="description" defaultValue={request.description} minLength={10} maxLength={5000} rows={4} required /></label><label>Link referensi<input name="referenceUrl" type="url" defaultValue={request.reference_url || ''} /></label><button className="request-submit-open" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan perubahan'}</button></form>}
    </article>
    <section className="request-comments"><div className="request-board-heading"><div><span className="request-kicker">DISKUSI PUBLIK</span><h2>Komentar</h2></div><span>{comments.length}</span></div>
      {loggedIn ? <form className="request-comment-form" onSubmit={sendComment}><textarea name="body" rows={3} maxLength={2000} placeholder="Tulis komentar yang membantu…" required /><button disabled={busy}><Send size={15} /> Kirim</button></form> : <p className="request-comment-login"><Link href="/login">Masuk</Link> untuk ikut berkomentar.</p>}
      {comments.length ? <div className="request-comment-list">{comments.map((comment) => <article key={comment.id}><header><b>{comment.author_name}</b><span className={comment.author_role === 'admin' ? 'author-admin' : comment.author_membership_tier === 'vip' ? 'author-vip' : ''}>{comment.author_role === 'admin' ? 'ADMIN' : comment.author_membership_tier === 'vip' ? 'RAKYAT VIP' : 'RAKYAT BIASA'}</span><small>{comment.author_user_id}</small><time>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(comment.created_at))}</time></header><p>{comment.body}</p></article>)}</div> : <div className="request-empty"><span>Belum ada komentar</span><p>Mulai diskusi dengan tetap menjaga percakapan ramah dan relevan.</p></div>}
    </section>
  </main>;
}
