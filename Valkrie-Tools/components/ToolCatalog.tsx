'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, Sparkles } from 'lucide-react';
import { catalogCopy } from '@/data/catalog-copy';
import type { CatalogTool } from '@/lib/tools/catalog';
import styles from '@/app/tools/catalog.module.css';

type Props = { products: CatalogTool[] };

export function ToolCatalog({ products }: Props) {
  const categories = ['Semua', ...Array.from(new Set(products.map((product) => product.category)))];
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');
  const filtered = useMemo(() => products.filter((product) => {
    const matchesCategory = category === 'Semua' || product.category === category;
    const matchesQuery = `${product.name} ${product.category} ${product.platform} ${product.description}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, query]);

  return <main className={styles.page}>
    <header className={styles.header}>
      <Link className={styles.brand} href="/">VALKRIE<span>X969</span></Link>
      <nav aria-label="Navigasi utama"><Link href="/requests">Request</Link><Link href="/vip">VIP</Link><Link href="/about">Tentang</Link></nav>
    </header>

    <section className={styles.hero}>
      <span className={styles.eyebrow}><Sparkles size={14} /> KATALOG VALKRIE TOOLS</span>
      <h1>Tools pilihan,<br /><em>akses langsung.</em></h1>
      <p>Temukan layanan resmi untuk desain, produktivitas, utilitas, dan pengembangan. Setiap kartu mengarah ke situs penyedia.</p>
      <div className={styles.heroMeta}><span>{products.length} tools {products[0]?.source === 'database' ? 'tersedia' : 'contoh'}</span><span>Link situs resmi</span><span>{products[0]?.source === 'database' ? 'Katalog database' : 'Contoh katalog · Supabase belum tersambung'}</span></div>
    </section>

    <section className={styles.catalog} aria-label="Daftar tools">
      <div className={styles.catalogHeading}><div><span className={styles.eyebrow}>JELAJAHI</span><h2>Direktori tools</h2></div><span className={styles.count}>{filtered.length} hasil</span></div>
      <label className={styles.search}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau kategori…" /><span className={styles.searchHint}>Cari</span></label>
      <div className={styles.filters} aria-label="Filter kategori">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={category === item ? styles.activeFilter : ''} aria-pressed={category === item}>{item}</button>)}</div>
      {filtered.length ? <div className={styles.grid}>{filtered.map((product, index) => <Link href={`/tools/${product.id}`} className={styles.card} key={product.id}>
        <div className={styles.cardTop}><span className={`${styles.mark} ${styles[`tone_${product.tone}`]}`}>{product.icon}</span><span className={styles.external}>SITUS RESMI <ArrowUpRight size={14} /></span></div>
        <span className={styles.category}>{product.category}{product.premium ? ' · VIP' : ''}</span><h3>{product.name}</h3><p>{catalogCopy[product.id]?.summary || product.description}</p>
        <div className={styles.cardBottom}><span>{product.platform}</span><span>LIHAT DETAIL <ArrowUpRight size={13} /></span></div>
      </Link>)}</div> : <div className={styles.empty}><b>Belum ada tools yang cocok.</b><span>Coba kata kunci atau kategori lain.</span></div>}
    </section>

    <footer className={styles.footer}><Link href="/">← Valkrie Tools</Link><span>Informasi dan ketentuan tiap layanan mengikuti situs penyedianya.</span></footer>
  </main>;
}
