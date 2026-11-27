'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function RequestBookmark({ requestId, initialSaved, loggedIn, previewMode = false }: { requestId: string; initialSaved: boolean; loggedIn: boolean; previewMode?: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function toggle() {
    if (!loggedIn) { window.location.assign('/login'); return; }
    setBusy(true);
    try {
      const response = await fetch(`/api/requests/${requestId}/bookmark`, { method: saved ? 'DELETE' : 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Favorit belum tersimpan.');
      setSaved(!saved); router.refresh();
    } catch (error) { window.alert(error instanceof Error ? error.message : 'Favorit belum tersimpan.'); }
    finally { setBusy(false); }
  }
  return <button className={`request-share request-bookmark${saved ? ' saved' : ''}`} type="button" aria-pressed={saved} disabled={busy || previewMode} title={previewMode ? 'Bookmark aktif setelah database disambungkan' : undefined} onClick={toggle}><Bookmark size={15} /> {saved ? 'Tersimpan' : 'Simpan'}</button>;
}
