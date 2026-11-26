'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { categories, type Category } from '@/data/tools';

const labels: Record<Category, string> = { all: 'Semua', downloader: 'Downloader', maker: 'Maker', tools: 'Tools', visual: 'Visual', vault: 'Vault', external: 'External' };

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get('cat') as Category | null;
  const active = requested && categories.includes(requested) ? requested : 'all';
  return <nav className="filter-bar" aria-label="Filter kategori tools" role="tablist">
    {categories.map((category) => <button key={category} type="button" role="tab" aria-selected={active === category} className={`filter-tab ${active === category ? 'active' : ''}`} onClick={() => router.replace(`/?cat=${category}`, { scroll: false })}>{labels[category]}</button>)}
  </nav>;
}
