'use client';

import Link from 'next/link';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowRight, Camera, Clock3, Heart, Settings2, ShieldCheck, UserRound } from 'lucide-react';
import styles from './ProfilePreview.module.css';

const storageKey = 'valkrie-profile-preview';

export function ProfilePreview() {
  const [displayName, setDisplayName] = useState('Nama kamu');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      const preview = JSON.parse(saved) as { displayName?: string; bio?: string };
      if (preview.displayName) setDisplayName(preview.displayName);
      if (typeof preview.bio === 'string') setBio(preview.bio);
    } catch { /* Keep the blank preview when browser storage is unavailable. */ }
  }, []);

  function chooseAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage('Pilih JPG, PNG, atau WebP maksimal 5 MB.');
      event.target.value = '';
      return;
    }
    setAvatar(URL.createObjectURL(file));
    setMessage('Avatar hanya pratinjau di halaman ini; belum diunggah.');
  }

  function savePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      localStorage.setItem(storageKey, JSON.stringify({ displayName: displayName.trim(), bio: bio.trim() }));
      setDisplayName(displayName.trim() || 'Nama kamu');
      setBio(bio.trim());
      setMessage('Pratinjau profil disimpan di browser ini saja.');
    } catch {
      setMessage('Browser tidak dapat menyimpan pratinjau ini.');
    }
  }

  return <main className={styles.page}>
    <header className={styles.header}><Link href="/" className={styles.brand}><span>V</span> VALKRIE<span>X969</span></Link><Link href="/login" className={styles.signIn}>Masuk / daftar <ArrowRight size={15} /></Link></header>
    <section className={styles.previewBanner}><span>MODE PREVIEW</span><p>Ini rancangan profil untuk ditinjau. Belum terhubung ke akun atau database.</p></section>

    <section className={styles.profileHero}>
      <div className={styles.avatar}>{avatar ? <img src={avatar} alt="Pratinjau avatar profil" /> : <UserRound size={35} />}</div>
      <div className={styles.identity}><span className={styles.kicker}>PROFIL VALKRIE TOOLS</span><h1>{displayName}</h1><p>@username-kamu <span>·</span> status contoh</p><div className={styles.badges}><span className={styles.memberBadge}>RAKYAT BIASA · CONTOH</span><span className={styles.roleBadge}>AKUN PREVIEW</span></div></div>
      <label className={styles.avatarUpload}><Camera size={15} /> Pilih avatar<input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseAvatar} /></label>
    </section>

    <div className={styles.columns}>
      <section className={styles.panel}>
        <div className={styles.panelHeading}><div><span className={styles.kicker}>TENTANG AKUN</span><h2>Informasi profil</h2></div><ShieldCheck size={19} /></div>
        <dl className={styles.details}>
          <div><dt>User ID</dt><dd><code>VALK-000123</code><small>Contoh format, bukan ID akun</small></dd></div>
          <div><dt>Username</dt><dd>@username-kamu<small>Ditentukan saat pendaftaran</small></dd></div>
          <div><dt>Member sejak</dt><dd>Terisi setelah akun dibuat</dd></div>
          <div><dt>Status member</dt><dd>Rakyat Biasa<small>Status aktual dikelola oleh sistem akun</small></dd></div>
          <div><dt>Bio</dt><dd>{bio || 'Bio kamu akan tampil di sini.'}</dd></div>
        </dl>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}><div><span className={styles.kicker}>PERSONALISASI</span><h2>Edit profil</h2></div><Settings2 size={19} /></div>
        <form className={styles.form} onSubmit={savePreview}>
          <label>Nama tampilan<input value={displayName} maxLength={40} onChange={(event) => setDisplayName(event.target.value)} /></label>
          <label>Bio singkat<textarea value={bio} maxLength={240} rows={4} placeholder="Tulis sedikit tentang dirimu…" onChange={(event) => setBio(event.target.value)} /></label>
          <p>Perubahan ini hanya disimpan di browser untuk preview.</p>
          <button>Simpan preview profil</button>
          {message && <span className={styles.notice} role="status">{message}</span>}
        </form>
      </section>
    </div>

    <section className={styles.activity}>
      <div className={styles.panelHeading}><div><span className={styles.kicker}>AKTIVITAS</span><h2>Area akun</h2></div><Clock3 size={19} /></div>
      <div className={styles.shortcuts}>
        <Link href="/requests"><span><b>Request saya</b><small>Riwayat request tampil setelah akun tersambung.</small></span><ArrowRight size={16} /></Link>
        <Link href="/favorites"><span><b>Favorit tools</b><small>Daftar favorit tersimpan per akun.</small></span><Heart size={16} /></Link>
        <Link href="/account/preferences"><span><b>Preferensi</b><small>Tema, bahasa, dan pilihan notifikasi.</small></span><ArrowRight size={16} /></Link>
      </div>
    </section>
    <footer className={styles.footer}><Link href="/">← Kembali ke beranda</Link><span>Login, penyimpanan akun, dan status member aktif setelah Supabase dikonfigurasi.</span></footer>
  </main>;
}
