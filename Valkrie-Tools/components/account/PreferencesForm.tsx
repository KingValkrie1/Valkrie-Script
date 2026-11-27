'use client';

import { useEffect, useState } from 'react';
import styles from './PreferencesForm.module.css';

export type AccountPreferences = {
  request_replies: boolean;
  request_status_changes: boolean;
  vip_changes: boolean;
  vip_expiry: boolean;
  theme: 'dark' | 'light';
  language: 'id' | 'en';
};

const notificationItems: Array<[keyof Pick<AccountPreferences, 'request_replies' | 'request_status_changes' | 'vip_changes' | 'vip_expiry'>, string, string]> = [
  ['request_replies', 'Balasan admin', 'Saat admin membalas request kamu'],
  ['request_status_changes', 'Perubahan status request', 'Saat status request kamu berubah'],
  ['vip_changes', 'Perubahan status VIP', 'Saat status VIP akun berubah'],
  ['vip_expiry', 'Pengingat masa VIP', 'Pengingat saat masa VIP mendekati akhir'],
];

export function PreferencesForm({ initialPreferences, previewOnly = false }: { initialPreferences: AccountPreferences; previewOnly?: boolean }) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!previewOnly) return;
    try {
      const saved = localStorage.getItem('valkrie-account-preferences-preview');
      if (saved) setPreferences({ ...initialPreferences, ...JSON.parse(saved) });
    } catch { /* Keep the supplied preview defaults. */ }
  }, [initialPreferences, previewOnly]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    if (previewOnly) {
      try {
        localStorage.setItem('valkrie-account-preferences-preview', JSON.stringify(preferences));
        localStorage.setItem('valkrie-account-display-preferences', JSON.stringify({ theme: preferences.theme, language: preferences.language }));
        window.dispatchEvent(new CustomEvent('valkrie-preferences-changed', { detail: { theme: preferences.theme, language: preferences.language } }));
        setMessage('Preferensi preview disimpan di browser ini saja.');
      } catch { setMessage('Browser tidak dapat menyimpan preferensi preview.'); }
      setBusy(false);
      return;
    }
    try {
      const response = await fetch('/api/account/preferences', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(preferences) });
      const result = await response.json();
      if (response.ok) {
        window.dispatchEvent(new CustomEvent('valkrie-preferences-changed', { detail: { theme: preferences.theme, language: preferences.language } }));
        setMessage(result.message);
      } else setMessage(result.error || 'Preferensi belum bisa disimpan.');
    } catch {
      setMessage('Koneksi belum tersedia. Preferensi belum disimpan.');
    }
    setBusy(false);
  }

  return <form className={styles.form} onSubmit={save}>
    <section className={styles.section}><span className={styles.kicker}>NOTIFIKASI AKUN</span><h2>Pilihan notifikasi</h2><p>{previewOnly ? 'Pilihan ini hanya disimpan di browser untuk preview; email belum dikirim.' : 'Preferensi ini disimpan ke akun. Pengiriman email belum aktif sebelum provider email dikonfigurasi.'}</p>
      {notificationItems.map(([key, title, description]) => <label className={styles.toggleRow} key={key}><span><b>{title}</b><small>{description}</small></span><input type="checkbox" checked={preferences[key]} onChange={(event) => setPreferences({ ...preferences, [key]: event.target.checked })} aria-label={title} /></label>)}
    </section>
    <section className={styles.section}><span className={styles.kicker}>TAMPILAN</span><h2>Tema dan bahasa</h2><p>Tema diterapkan di halaman utama, katalog, akun, dan Request Board. Pilihan English mengatur metadata bahasa; terjemahan teks halaman belum tersedia.</p>
      <label className={styles.selectRow}>Tema<select value={preferences.theme} onChange={(event) => setPreferences({ ...preferences, theme: event.target.value as AccountPreferences['theme'] })}><option value="dark">Gelap</option><option value="light">Terang</option></select></label>
      <label className={styles.selectRow}>Bahasa<select value={preferences.language} onChange={(event) => setPreferences({ ...preferences, language: event.target.value as AccountPreferences['language'] })}><option value="id">Bahasa Indonesia</option><option value="en">English · metadata saja</option></select></label>
    </section>
    {message && <p className={styles.message} role="status">{message}</p>}
    <button className={styles.save} disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan preferensi'}</button>
  </form>;
}
