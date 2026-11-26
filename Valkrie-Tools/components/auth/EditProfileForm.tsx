'use client';

import { useState, type FormEvent } from 'react';

export function EditProfileForm({ displayName, bio, city, canSetCity }: { displayName: string; bio: string | null; city: string | null; canSetCity: boolean }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Perubahan belum bisa disimpan.');
      setMessage(result.message);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Perubahan belum bisa disimpan.'); }
    finally { setBusy(false); }
  }

  return <form className="profile-edit-form" onSubmit={save}>
    <h2>Edit profil</h2>
    <label>Nama tampilan<input name="displayName" defaultValue={displayName} maxLength={40} required /></label>
    <label>Bio singkat<textarea name="bio" defaultValue={bio || ''} maxLength={240} rows={3} /></label>
    {canSetCity ? <label>Kota request<input name="city" defaultValue={city || ''} maxLength={80} /></label> : <p className="profile-edit-note">Kota request tersedia untuk Rakyat VIP aktif.</p>}
    {error && <p className="auth-error" role="alert">{error}</p>}
    {message && <p className="auth-success" role="status">{message}</p>}
    <button disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan profil'}</button>
  </form>;
}
