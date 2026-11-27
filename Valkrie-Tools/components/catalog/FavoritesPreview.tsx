'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Heart } from 'lucide-react';
import type { CatalogTool } from '@/lib/tools/catalog';

const key = 'valkrie-favorites';

export function FavoritesPreview({ products }: { products: CatalogTool[] }) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    try { setIds(JSON.parse(localStorage.getItem(key) || '[]')); } catch { setIds([]); }
  }, []);
  const saved = useMemo(() => products.filter((product) => ids.includes(product.id)), [products, ids]);

  function remove(id: string) {
    const next = ids.filter((item) => item !== id);
    setIds(next);
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('valkrie-favorites-changed', { detail: next }));
  }

  return <main className="request-page favorite-preview-page">
    <header className="request-top"><Link href="/" className="request-brand">← <span>VALKRIE<span>X969</span></span></Link><span>FAVORIT TOOLS</span></header>
    <section className="request-intro"><span className="request-kicker">KOLEKSI KAMU</span><h1>Tools <em>favorit.</em></h1><p>Simpan tools yang ingin kamu buka lagi. Preview ini menyimpan daftar di browser perangkat ini.</p><p className="preview-mode-banner">MODE PREVIEW · Favorit belum tersinkron ke akun</p></section>
    {saved.length ? <div className="favorite-preview-grid">{saved.map((tool) => <article key={tool.id}><span className="favorite-preview-icon">{tool.icon}</span><span className="request-kicker">{tool.category}</span><h2>{tool.name}</h2><p>{tool.description}</p><div><a href={tool.websiteUrl} target="_blank" rel="noreferrer">Buka situs resmi <ArrowUpRight size={14} /></a><button type="button" onClick={() => remove(tool.id)} aria-label={`Hapus ${tool.name} dari favorit`}><Heart size={15} fill="currentColor" /> Hapus</button></div></article>)}</div> : <section className="request-empty favorite-preview-empty"><Heart size={26} /><span>Belum ada favorit</span><p>Tekan ikon hati pada kartu tool di beranda untuk menyimpannya di sini.</p><Link className="request-submit-open" href="/">Jelajahi katalog</Link></section>}
  </main>;
}
