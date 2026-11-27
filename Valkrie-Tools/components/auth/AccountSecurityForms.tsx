'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function PasswordChangeForm() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    if (values.newPassword !== values.confirmPassword) { setBusy(false); setError('Konfirmasi password baru tidak cocok.'); return; }
    try {
      const response = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: values.currentPassword, newPassword: values.newPassword }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Password belum bisa diubah.');
      form.reset(); setMessage(result.message);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Password belum bisa diubah.'); }
    finally { setBusy(false); }
  }
  return <form className="profile-security-form" onSubmit={submit}>
    <h2>Ganti password</h2>
    <label>Password saat ini<input name="currentPassword" type="password" autoComplete="current-password" minLength={10} maxLength={128} required /></label>
    <label>Password baru<input name="newPassword" type="password" autoComplete="new-password" minLength={10} maxLength={128} required /></label>
    <label>Ulangi password baru<input name="confirmPassword" type="password" autoComplete="new-password" minLength={10} maxLength={128} required /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-success" role="status">{message}</p>}
    <button disabled={busy}>{busy ? 'Menyimpan…' : 'Perbarui password'}</button>
  </form>;
}

export function DeactivateAccountForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    if (!window.confirm('Akun dan seluruh data profil/request terkait akan dihapus permanen. Lanjutkan?')) return;
    setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch('/api/account', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Akun belum bisa dihapus.');
      router.replace('/'); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Akun belum bisa dihapus.'); setBusy(false); }
  }
  return <form className="profile-danger-form" onSubmit={submit}>
    <h2>Hapus akun</h2><p>Penghapusan permanen juga menghapus profil, request, komentar, vote, dan bookmark akun ini.</p>
    <label>Password untuk konfirmasi<input name="password" type="password" autoComplete="current-password" minLength={10} maxLength={128} required /></label>
    <label>Ketik HAPUS untuk konfirmasi<input name="confirmation" autoComplete="off" pattern="HAPUS" required /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}<button disabled={busy}>{busy ? 'Menghapus…' : 'Hapus akun permanen'}</button>
  </form>;
}
