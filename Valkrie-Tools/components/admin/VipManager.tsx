'use client';

import { useState, type FormEvent } from 'react';

type AdminUser = { user_id: string; username: string; display_name: string; avatar_url: string | null; role: string; membership_tier: string; vip_expires_at: string | null; vip_permanent: boolean; joined_at: string; activeVip: boolean };
type VipHistoryRow = { id: string; user_id: string; changed_by: string | null; action: string; duration_days: number | null; permanent: boolean; note: string | null; created_at: string; target_name: string; target_user_id: string; admin_name: string };

export function VipManager({ history }: { history: VipHistoryRow[] }) {
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState<AdminUser | null>(null);
  const [operation, setOperation] = useState<'grant' | 'extend' | 'revoke'>('grant');
  const [duration, setDuration] = useState('30');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function findUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setNotice(''); setUser(null);
    try {
      const response = await fetch(`/api/admin/vip?userId=${encodeURIComponent(userId)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'User ID tidak ditemukan.');
      setUser(result.user); setOperation(result.user.activeVip ? 'extend' : 'grant');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Pencarian belum berhasil.'); }
    finally { setBusy(false); }
  }

  async function saveVip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!user) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/admin/vip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.user_id, operation, durationDays: Number(duration) || null, permanent: duration === 'permanent', note }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Perubahan VIP belum berhasil.');
      setNotice(result.message); setUser(null); setUserId(''); setNote('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Perubahan VIP belum berhasil.'); }
    finally { setBusy(false); }
  }

  return <>
    <section className="vip-manager-card"><span className="request-kicker">AKSI ADMIN</span><h2>Kelola VIP via User ID</h2><p>Temukan akun, cek status, lalu beri, perpanjang, atau cabut VIP.</p>
      <form className="vip-lookup" onSubmit={findUser}><label>User ID<input value={userId} onChange={(event) => setUserId(event.target.value.toUpperCase())} placeholder="VALK-000123" pattern="VALK-[0-9]{6,}" required /></label><button disabled={busy}>{busy ? 'Mencari…' : 'Cari akun'}</button></form>
      {error && <p className="auth-error" role="alert">{error}</p>}{notice && <p className="auth-success" role="status">{notice}</p>}
      {user && <article className="vip-user-preview"><div className="vip-user-avatar">{user.avatar_url ? <img src={user.avatar_url} alt="" /> : user.display_name.slice(0, 1).toUpperCase()}</div><div className="vip-user-info"><b>{user.display_name}</b><span>@{user.username} · {user.user_id}</span><small>Gabung {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(user.joined_at))}</small></div><strong className={user.activeVip ? 'author-vip' : user.role === 'admin' ? 'author-admin' : ''}>{user.role === 'admin' ? 'ADMIN' : user.activeVip ? 'RAKYAT VIP' : 'RAKYAT BIASA'}</strong></article>}
      {user && <form className="vip-action-form" onSubmit={saveVip}><label>Aksi<select value={operation} onChange={(event) => setOperation(event.target.value as typeof operation)}><option value="grant" disabled={user.activeVip}>Jadikan VIP</option><option value="extend" disabled={!user.activeVip || user.vip_permanent}>Perpanjang VIP</option><option value="revoke" disabled={!user.activeVip}>Cabut VIP</option></select></label>{operation !== 'revoke' && <label>Durasi<select value={duration} onChange={(event) => setDuration(event.target.value)}><option value="7">7 hari</option><option value="30">30 hari</option><option value="365">1 tahun</option><option value="permanent">Permanen</option></select></label>}<label>Catatan admin<input value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder="Hadiah event, donasi, dan lainnya" /></label><button disabled={busy}>{busy ? 'Menyimpan…' : operation === 'revoke' ? 'Cabut VIP' : operation === 'extend' ? 'Perpanjang VIP' : 'Jadikan VIP'}</button></form>}
    </section>
    <section className="vip-history"><div className="request-board-heading"><div><span className="request-kicker">AUDIT ADMIN</span><h2>Riwayat VIP</h2></div><span>{history.length} terbaru</span></div>{history.length ? history.map((item) => <article key={item.id}><div><b>{item.target_name} · {item.target_user_id}</b><small>{item.action} · oleh {item.admin_name} · {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.created_at))}</small>{item.note && <p>{item.note}</p>}</div><span>{item.permanent ? 'Permanen' : item.duration_days ? `${item.duration_days} hari` : '—'}</span></article>) : <div className="request-empty"><span>Belum ada perubahan VIP</span></div>}</section>
  </>;
}
