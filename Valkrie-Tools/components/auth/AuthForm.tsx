'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

const modeCopy: Record<AuthMode, { title: string; lead: string; endpoint: string; submit: string }> = {
  login: { title: 'Masuk akun', lead: 'Masuk untuk mengelola profil dan request tool kamu.', endpoint: '/api/auth/login', submit: 'Masuk' },
  register: { title: 'Buat akun', lead: 'Akun baru mendapat User ID VALK otomatis setelah daftar.', endpoint: '/api/auth/register', submit: 'Daftar' },
  forgot: { title: 'Reset password', lead: 'Kami kirim instruksi reset ke email akunmu jika terdaftar.', endpoint: '/api/auth/forgot-password', submit: 'Kirim link reset' },
  reset: { title: 'Buat password baru', lead: 'Pilih password baru minimal 10 karakter.', endpoint: '/api/auth/reset-password', submit: 'Simpan password' },
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const copy = modeCopy[mode];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const payload = mode === 'login' ? { identifier: values.identifier, password: values.password }
      : mode === 'register' ? { email: values.email, username: values.username, displayName: values.displayName, password: values.password }
      : mode === 'forgot' ? { email: values.email } : { password: values.password };
    try {
      const response = await fetch(copy.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Permintaan belum berhasil.');
      setMessage(result.message || 'Berhasil.');
      if (mode === 'login' || mode === 'reset') window.location.assign('/profile');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Koneksi belum berhasil. Coba lagi.');
    } finally { setBusy(false); }
  }

  return <main className="auth-shell">
    <Link href="/" className="auth-brand"><span>V</span> VALKRIE<span className="auth-brand-accent">X969</span></Link>
    <section className="auth-card">
      <span className="auth-kicker">VALKRIE TOOLS · AKUN</span>
      <h1>{copy.title}</h1>
      <p>{copy.lead}</p>
      {process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? <form className="auth-form" onSubmit={submit}>
        {mode === 'register' && <>
          <label>Nama tampilan<input name="displayName" autoComplete="name" minLength={1} maxLength={40} required /></label>
          <label>Username<input name="username" autoComplete="username" minLength={3} maxLength={24} pattern="[A-Za-z0-9_]{3,24}" required /><small>3–24 karakter: huruf, angka, atau garis bawah.</small></label>
        </>}
        {(mode === 'register' || mode === 'forgot') && <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>}
        {mode === 'login' && <label>Email atau username<input name="identifier" autoComplete="username" maxLength={254} required /></label>}
        {(mode === 'login' || mode === 'register' || mode === 'reset') && <label>{mode === 'reset' ? 'Password baru' : 'Password'}<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={10} maxLength={128} required /></label>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p className="auth-success" role="status">{message}</p>}
        <button disabled={busy} type="submit">{busy ? 'Memproses…' : copy.submit}</button>
      </form> : <div className="auth-setup-note">Login belum aktif. Project database Supabase perlu dibuat dan dikonfigurasi terlebih dahulu.</div>}

      <nav className="auth-links">
        {mode === 'login' && <><Link href="/forgot-password">Lupa password?</Link><span>Belum punya akun? <Link href="/register">Daftar</Link></span></>}
        {mode === 'register' && <span>Sudah punya akun? <Link href="/login">Masuk</Link></span>}
        {(mode === 'forgot' || mode === 'reset') && <Link href="/login">Kembali ke login</Link>}
      </nav>
    </section>
    <Link className="auth-back" href="/">← Kembali ke beranda</Link>
  </main>;
}
