'use client';
import { useState } from 'react';
import { Download, X } from 'lucide-react';

export function ApkModal() {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className="menu-link" onClick={() => setOpen(true)}><Download size={16} /> Download APK</button>
    {open && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="apk-modal" role="dialog" aria-modal="true" aria-labelledby="apk-title">
        <button type="button" className="modal-close" onClick={() => setOpen(false)} aria-label="Tutup"><X size={18} /></button>
        <span className="modal-icon"><Download size={20} /></span><h2 id="apk-title">Valkrie-Tools APK</h2>
        <p>Link APK akan ditambahkan di sini.</p><button type="button" className="button button-primary" onClick={() => setOpen(false)}>Mengerti</button>
      </section>
    </div>}
  </>;
}
