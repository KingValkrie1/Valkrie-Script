'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import styles from '@/app/tools/catalog.module.css';

export function ToolFavoriteButton({ slug, initialFavorite, compact = false }: { slug: string; initialFavorite: boolean; compact?: boolean }) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/tools/${encodeURIComponent(slug)}/favorite`, { method: favorite ? 'DELETE' : 'POST' });
      const result = await response.json();
      if (response.status === 401) setMessage('Masuk untuk menyimpan favorit.');
      else if (!response.ok) setMessage(result.error || 'Favorit belum bisa diperbarui.');
      else {
        setFavorite(!favorite);
        if (window.location.pathname === '/favorites') window.location.reload();
      }
    } catch {
      setMessage('Koneksi belum tersedia. Coba lagi nanti.');
    }
    setBusy(false);
  }

  return <span className={styles.favoriteWrap}>
    <button type="button" className={`${styles.favoriteButton} ${favorite ? styles.isFavorite : ''} ${compact ? styles.favoriteCompact : ''}`} onClick={toggle} disabled={busy} aria-label={favorite ? 'Hapus dari favorit' : 'Simpan ke favorit'} aria-pressed={favorite}>
      <Heart size={compact ? 16 : 18} fill={favorite ? 'currentColor' : 'none'} />{!compact && <span>{favorite ? 'Tersimpan' : 'Simpan favorit'}</span>}
    </button>
    {message && <span role="status" className={styles.favoriteMessage}>{message}</span>}
  </span>;
}
