'use client';

import Link from 'next/link';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowRight, Camera, Check, ChevronDown, Copy, Gift, HelpCircle, LockKeyhole, Moon, Pencil, Settings2, Sun, UserRound, X } from 'lucide-react';
import styles from './ProfilePreview.module.css';

const storageKey = 'valkrie-profile-preview';
const userId = '12345678';

export function ProfilePreview() {
  const [username, setUsername] = useState('Username');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [banner, setBanner] = useState('');
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState('');
  const [claimed, setClaimed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [light, setLight] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const profile = JSON.parse(saved) as { username?: string; bio?: string };
        if (profile.username) setUsername(profile.username);
        if (typeof profile.bio === 'string') setBio(profile.bio);
      }
      setLight(localStorage.getItem('valkrie-theme') === 'light');
    } catch { /* Keep preview defaults when browser storage is unavailable. */ }
  }, []);

  function chooseImage(event: ChangeEvent<HTMLInputElement>, target: 'avatar' | 'banner') {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setNotice('Pilih JPG, PNG, atau WebP maksimal 5 MB. Gambar hanya pratinjau di perangkat ini.');
      event.target.value = '';
      return;
    }
    const preview = URL.createObjectURL(file);
    if (target === 'avatar') setAvatar(preview);
    else setBanner(preview);
    setNotice('Gambar hanya tampil sebagai pratinjau; belum disimpan ke akun.');
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      localStorage.setItem(storageKey, JSON.stringify({ username: username.trim() || 'Username', bio: bio.trim() }));
      setUsername(username.trim() || 'Username');
      setBio(bio.trim());
      setEditing(false);
      setNotice('Pratinjau profil disimpan di browser ini saja.');
    } catch { setNotice('Browser tidak dapat menyimpan pratinjau ini.'); }
  }

  async function copyId() {
    try { await navigator.clipboard.writeText(userId); setNotice('ID contoh disalin.'); }
    catch { setNotice(`ID contoh: ${userId}`); }
  }

  function toggleTheme() {
    const next = !light;
    setLight(next);
    document.documentElement.dataset.theme = next ? 'light' : 'dark';
    localStorage.setItem('valkrie-theme', next ? 'light' : 'dark');
  }

  function claimGift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!code.trim()) { setNotice('Masukkan kode hadiah terlebih dahulu.'); return; }
    setClaimed(true);
  }

  return <main id="top" className={`${styles.page} ${light ? styles.light : ''}`}>
    <header className={styles.header}><Link href="/" className={styles.brand}><span>V</span> VALKRIE<span>X969</span></Link><span className={styles.headerLabel}>PROFIL KOMUNITAS</span></header>
    <section className={styles.previewBanner}><span>MODE PREVIEW</span><p>Profil dan tukar kode hadiah ini masih pratinjau. Perubahan hanya tersimpan di browser.</p></section>

    <section className={styles.profileCard} aria-label="Profil komunitas">
      <div className={styles.cover} style={banner ? { backgroundImage: `linear-gradient(90deg,#240c16aa,#240c1640),url(${banner})` } : undefined}>
        <span className={styles.coverGlow} />
        <label className={styles.coverEdit} aria-label="Ganti banner"><Camera size={17} /><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseImage(event, 'banner')} /></label>
      </div>
      <div className={styles.identity}>
        <label className={styles.avatarEdit} aria-label="Ganti avatar"><span className={styles.avatar}>{avatar ? <img src={avatar} alt="Avatar preview" /> : <UserRound size={43} />}</span><i><Camera size={13} /></i><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseImage(event, 'avatar')} /></label>
        <div className={styles.bioBubble}><button type="button" aria-label="Edit bio" onClick={() => setEditing(true)}><Pencil size={12} /></button><span>{bio || <em>Tulis bio kamu di sini...</em>}</span></div>
      </div>
      <div className={styles.nameRow}><button type="button" className={styles.nameButton} onClick={() => setEditing(true)}><b>{username}</b><Pencil size={14} /><ChevronDown size={15} /></button></div>
      <div className={styles.idRow}><span>ID: <b>{userId}</b></span><button type="button" aria-label="Salin ID" onClick={copyId}><Copy size={14} /></button><small>ID contoh</small></div>
      <div className={styles.badges} aria-label="Slot lencana kosong"><span /><span /><span /></div>
      {notice && <p className={styles.notice} role="status">{notice}</p>}
    </section>

    {editing && <form className={styles.editPanel} onSubmit={saveProfile}><div><span className={styles.kicker}>EDIT PROFIL</span><button type="button" aria-label="Tutup edit" onClick={() => setEditing(false)}><X size={16} /></button></div><label>Username<input value={username} maxLength={32} onChange={(event) => setUsername(event.target.value)} /></label><label>Bio<textarea value={bio} maxLength={160} rows={3} placeholder="Tulis bio kamu di sini..." onChange={(event) => setBio(event.target.value)} /></label><button className={styles.saveButton}>Simpan perubahan preview</button></form>}

    <section className={styles.giftCard}>
      <div className={styles.giftHeading}><span className={styles.giftIcon}><Gift size={19} /></span><div><span className={styles.kicker}>HADIAH KOMUNITAS</span><h2>Tukar Kode Hadiah</h2></div></div>
      <form className={styles.giftForm} onSubmit={claimGift}><label className={styles.srOnly} htmlFor="gift-code">Kode hadiah</label><input id="gift-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Masukkan kode hadiah di sini..." /><button>Klaim Hadiah</button></form>
      <p className={styles.previewHint}>Preview saja · klaim belum terhubung ke akun atau sistem hadiah.</p>
    </section>

    <section className={styles.menuCard} aria-label="Pengaturan profil">
      <Link href="/account/preferences"><span className={styles.menuIcon}><Settings2 size={17} /></span><span><b>Personal Information</b><small>Profil dan preferensi akun</small></span><ArrowRight size={15} /></Link>
      <Link href="/contact"><span className={styles.menuIcon}><HelpCircle size={17} /></span><span><b>Need help?</b><small>Kontak admin Valkrie Tools</small></span><ArrowRight size={15} /></Link>
      <Link href="/privacy"><span className={styles.menuIcon}><LockKeyhole size={17} /></span><span><b>Privacy Policy</b><small>Informasi privasi pengguna</small></span><ArrowRight size={15} /></Link>
      <button type="button" onClick={toggleTheme}><span className={styles.menuIcon}>{light ? <Moon size={17} /> : <Sun size={17} />}</span><span><b>Theme</b><small>{light ? 'Mode terang' : 'Mode gelap'}</small></span><span className={styles.themeAction}>{light ? 'Gelap' : 'Terang'}</span></button>
    </section>

    <button type="button" className={styles.editCta} onClick={() => { setEditing(!editing); document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' }); }}><Pencil size={17} /> Edit Profile</button>
    <footer className={styles.footer}><Link href="/">← Kembali ke Valkrie Tools</Link><span>Profil komunitas · pratinjau</span></footer>

    {claimed && <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setClaimed(false); }}><section className={styles.successModal} role="dialog" aria-modal="true" aria-labelledby="success-title"><button className={styles.modalClose} aria-label="Tutup" onClick={() => setClaimed(false)}><X size={18} /></button><span className={styles.successIcon}><Check size={31} /></span><h2 id="success-title">Hadiah Berhasil Diklaim!</h2><p>Kode valid. Hadiah telah ditambahkan ke akun kamu</p><small>Pratinjau visual · hadiah belum tersimpan ke akun.</small><button className={styles.okayButton} onClick={() => { setClaimed(false); setCode(''); }}>Okay, Thanks</button></section></div>}
  </main>;
}
