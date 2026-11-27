import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import { notFound } from 'next/navigation';
import { catalogCopy } from '@/data/catalog-copy';
import { ToolFavoriteButton } from '@/components/ToolFavoriteButton';
import { getCatalogTool } from '@/lib/tools/catalog';
import styles from '../catalog.module.css';

type Props = { params: { slug: string } };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getCatalogTool(params.slug);
  return { title: product ? product.name : 'Tools' };
}

export default async function ToolDetailPage({ params }: Props) {
  const product = await getCatalogTool(params.slug);
  if (!product) notFound();
  const copy = catalogCopy[product.id] || { summary: product.description, useCases: [product.description] };

  return <main className={`${styles.page} ${styles.detailPage}`}>
    <header className={styles.header}><Link className={styles.brand} href="/">VALKRIE<span>X969</span></Link><Link href="/tools">Katalog tools</Link></header>
    <section className={styles.detailHero}>
      <Link className={styles.backLink} href="/tools"><ArrowLeft size={15} /> Semua tools</Link>
      <div className={`${styles.detailMark} ${styles[`tone_${product.tone}`]}`}>{product.icon}</div>
      <span className={styles.eyebrow}>{product.category} · {product.platform}</span>
      <h1>{product.name}</h1>
      <p>{copy.summary}</p>
      {product.source === 'database' && <ToolFavoriteButton slug={product.id} initialFavorite={product.favorite} />}
      <a className={styles.visitButton} href={product.websiteUrl} target="_blank" rel="noopener noreferrer">Buka situs resmi <ArrowUpRight size={17} /></a>
    </section>
    <section className={styles.detailInfo}>
      <div><span className={styles.eyebrow}>COCOK UNTUK</span><h2>Yang bisa kamu kerjakan</h2></div>
      <ul>{copy.useCases.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul>
      <p className={styles.disclaimer}>Valkrie Tools hanya menyediakan informasi dan tautan. Fitur, harga, akun, serta ketentuan layanan dikelola oleh penyedia masing-masing.</p>
    </section>
    <footer className={styles.footer}><Link href="/tools">← Kembali ke katalog</Link><Link href="/requests">Usulkan tools lain</Link></footer>
  </main>;
}
