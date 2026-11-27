'use client';

import { useState, type ChangeEvent } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function ProfilePhotoForm({ avatarUrl, displayName }: { avatarUrl: string | null; displayName: string }) {
  const [preview, setPreview] = useState(avatarUrl || '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(''); setMessage('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Pilih gambar JPG, PNG, atau WebP maksimal 5 MB.'); event.target.value = ''; return;
    }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Masuk kembali sebelum mengganti foto profil.');
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
      if (uploadError) throw new Error('Foto belum bisa diunggah. Pastikan migration penyimpanan avatar sudah dijalankan.');
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatarUrl: data.publicUrl }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Foto belum bisa dipasang di profil.');
      setPreview(data.publicUrl); setMessage('Foto profil berhasil diperbarui.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Foto belum bisa diperbarui.'); }
    finally { setBusy(false); event.target.value = ''; }
  }

  return <section className="profile-photo-form">
    <div className="profile-photo-avatar">{preview ? <img src={preview} alt={`Foto profil ${displayName}`} /> : displayName.slice(0, 1).toUpperCase()}</div>
    <div><label>Foto profil<input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={busy} /></label><small>JPG, PNG, atau WebP · maksimal 5 MB</small></div>
    {busy && <span role="status">Mengunggah…</span>}{message && <p className="auth-success" role="status">{message}</p>}{error && <p className="auth-error" role="alert">{error}</p>}
  </section>;
}
