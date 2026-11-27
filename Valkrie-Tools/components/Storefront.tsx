'use client';

import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Bell, Bookmark, ChevronRight, CircleHelp, Clock3, Crown, Gamepad2, Headphones, Heart, Menu, MessageSquarePlus, Moon, Search, Settings2, Sun, UserRound, Volume2, VolumeX, Wrench, X, Zap } from 'lucide-react';
import { categories, products, type Product } from '@/data/products';

const channelUrl = 'https://whatsapp.com/channel/0029VbAq9wH4inozYo8E9z2s';

export function Storefront() {
  const [category, setCategory] = useState('Semua');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [light, setLight] = useState(false);
  const [muted, setMuted] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem('valkrie-favorites') || '[]'));
      setRecent(JSON.parse(localStorage.getItem('valkrie-recent') || '[]'));
      setLight(localStorage.getItem('valkrie-theme') === 'light');
    } catch { /* Use an empty storefront state if saved data is unavailable. */ }
  }, []);
  useEffect(() => {
    const syncTheme = (event: Event) => setLight((event as CustomEvent<string>).detail === 'light');
    window.addEventListener('valkrie-theme-applied', syncTheme);
    return () => window.removeEventListener('valkrie-theme-applied', syncTheme);
  }, []);
  useEffect(() => { if (!toast) return; const id = window.setTimeout(() => setToast(''), 2400); return () => window.clearTimeout(id); }, [toast]);

  const filtered = useMemo(() => products.filter((product) => {
    const categoryMatch = category === 'Semua' || (category === 'Favorit' ? favorites.includes(product.id) : product.category === category);
    const queryMatch = `${product.name} ${product.platform} ${product.category}`.toLowerCase().includes(query.toLowerCase());
    return categoryMatch && queryMatch;
  }), [category, favorites, query]);
  const recentlyViewed = recent.map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product));

  function toggleFavorite(id: string) {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    setFavorites(next); localStorage.setItem('valkrie-favorites', JSON.stringify(next));
  }
  function openProduct(product: Product) {
    const next = [product.id, ...recent.filter((id) => id !== product.id)].slice(0, 5);
    setRecent(next); localStorage.setItem('valkrie-recent', JSON.stringify(next));
    window.open(product.websiteUrl, '_blank', 'noopener,noreferrer');
  }
  function toggleTheme() {
    const next = !light;
    setLight(next);
    localStorage.setItem('valkrie-theme', next ? 'light' : 'dark');
    try {
      const saved = JSON.parse(localStorage.getItem('valkrie-account-display-preferences') || '{"language":"id"}');
      localStorage.setItem('valkrie-account-display-preferences', JSON.stringify({ ...saved, theme: next ? 'light' : 'dark' }));
    } catch { /* The local theme still works if preference storage is unavailable. */ }
    document.documentElement.dataset.theme = next ? 'light' : 'dark';
    window.dispatchEvent(new CustomEvent('valkrie-theme-applied', { detail: next ? 'light' : 'dark' }));
  }
  function navigateTo(id: string, tab: string) {
    if (tab === 'request') { window.location.assign('/requests'); return; }
    if (tab === 'profile') { setProfileOpen(true); return; }
    setProfileOpen(false);
    if (tab === 'products') { setCategory('Semua'); setQuery(''); }
    if (tab === 'favorites') { setCategory('Favorit'); setQuery(''); }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function quickRipple(event: ReactPointerEvent<HTMLAnchorElement | HTMLButtonElement>) {
    const target = event.currentTarget;
    const bounds = target.getBoundingClientRect();
    target.style.setProperty('--ripple-x', `${event.clientX - bounds.left}px`);
    target.style.setProperty('--ripple-y', `${event.clientY - bounds.top}px`);
    target.classList.remove('is-rippling');
    requestAnimationFrame(() => target.classList.add('is-rippling'));
  }
  const categoryCount = (name: string) => name === 'Semua' ? products.length : name === 'Favorit' ? favorites.length : products.filter((p) => p.category === name).length;

  const card = (product: Product, index: number, ranked = false) => <article className="store-card" key={product.id}>
    {ranked && <span className="store-rank">#{product.rank ?? index + 1}</span>}
    <button className={`store-heart ${favorites.includes(product.id) ? 'is-favorite' : ''}`} aria-label={favorites.includes(product.id) ? 'Hapus favorit' : 'Tambah favorit'} aria-pressed={favorites.includes(product.id)} onClick={() => toggleFavorite(product.id)}><Heart size={17} /></button>
    <button className={`store-art art-${product.tone}`} onClick={() => openProduct(product)} aria-label={`Lihat ${product.name}`}>
      <span className="art-glow" /><span className="art-emblem">{product.icon}</span>
      {product.hot && <span className="store-hot">HOT</span>}
      <span className="store-game"><i>{product.icon.slice(0, 1)}</i>{product.platform}</span>
    </button>
    <div className="store-status"><span className={product.status === 'BARU' ? 'status-new' : product.status === 'UPDATE' ? 'status-update' : ''}>{product.status}</span><span>BUKA WEB ↗</span></div>
    <span className="store-category">{product.category}</span>
    <button className="store-product-name" onClick={() => openProduct(product)}>{product.name}</button>
  </article>;

  return <div className={`storefront ${light ? 'store-light' : ''}`}>
    <header className="store-header"><div className="store-header-inner">
      <a className="store-brand" href="#top"><span className="store-brand-mark"><Zap size={18} fill="currentColor" /></span><span>VALKRIE<span className="brand-969">X969</span></span></a>
      <div className="store-header-actions">
        <button className="store-icon-btn" aria-label="Notifikasi" onClick={() => setToast('Belum ada notifikasi baru.')}><Bell size={18} /></button>
        <button className="store-icon-btn" aria-label="Ganti tema" onClick={toggleTheme}>{light ? <Moon size={18} /> : <Sun size={18} />}</button>
        <button className="store-icon-btn menu-toggle" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></button>
      </div>
      {menuOpen && <nav className="store-menu"><a href="#products" onClick={() => setMenuOpen(false)}>Semua produk</a><a href="#quick-links" onClick={() => setMenuOpen(false)}>Layanan</a><a href="#footer" onClick={() => setMenuOpen(false)}>Tentang</a></nav>}
    </div></header>
    <main id="top" className="store-main">
      <nav className="store-categories" aria-label="Kategori produk">{categories.map((name) => <button key={name} className={`category-chip ${category === name ? 'active' : ''}`} onClick={() => setCategory(name)}>{name}<small>{categoryCount(name)}</small></button>)}</nav>
      <form className="store-search" onSubmit={(event) => event.preventDefault()}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari produk atau kategori..." aria-label="Cari produk atau kategori" /><button aria-label="Cari"><Search size={18} /></button></form>
      <section className="store-hero" aria-labelledby="store-title"><div className="hero-noise" /><div className="store-hero-copy"><span className="store-open"><i /> KATALOG DIGITAL</span><h1 id="store-title">Valkrie<span>X969</span></h1><p>Temukan tools legal untuk kebutuhan kreatif, produktivitas, dan pengembangan.</p><small>Direktori pilihan · informasi yang jelas · akses praktis</small><a href="#products" className="store-hero-button">Jelajahi katalog <ChevronRight size={16} /></a></div><div className="hero-emblem" aria-hidden="true"><Wrench size={78} /></div></section>
      <section className="store-stats" aria-label="Statistik katalog"><article><b>{products.length}</b><span>Tools di katalog</span></article><article><b>{new Set(products.map((product) => product.category)).size}</b><span>Kategori</span></article><article><b>{products.length}</b><span>Tautan resmi</span></article></section>
      <section className="store-quick" id="quick-links"><h2 className="store-section-title">Akses <em>cepat</em></h2><div className="quick-grid">
        <a href="/tools" className="quick-link quick-hero" onPointerDown={quickRipple}><span className="quick-icon icon-catalog"><Gamepad2 size={21} /></span><span className="quick-copy"><b>Semua Tools</b><small>{products.length} tools di katalog</small></span><span className="quick-label">JELAJAHI</span><ChevronRight className="quick-arrow" size={17} /><span className="quick-orbit" aria-hidden="true" /></a>
        <a href="/requests" className="quick-link quick-half quick-request" onPointerDown={quickRipple}><span className="quick-icon icon-request"><CircleHelp size={20} /></span><span className="quick-copy"><b>Ajukan Tool</b><small>Sampaikan ide tool baru</small></span><ChevronRight className="quick-arrow" size={16} /></a>
        <a className="quick-link quick-half quick-support" href={channelUrl} target="_blank" rel="noreferrer" onPointerDown={quickRipple}><span className="quick-icon icon-admin"><Headphones size={20} /></span><span className="quick-copy"><b>Info &amp; Bantuan</b><small>Buka kanal WhatsApp</small></span><ChevronRight className="quick-arrow" size={16} /></a>
        <a className="quick-link quick-wide quick-updates" href={channelUrl} target="_blank" rel="noreferrer" onPointerDown={quickRipple}><span className="quick-icon icon-updates"><Bell size={20} /></span><span className="quick-copy"><b>Saluran Update</b><small>Info katalog terbaru</small></span><span className="quick-label">BUKA CHANNEL</span><ChevronRight className="quick-arrow" size={16} /></a>
      </div></section>
      {recentlyViewed.length > 0 && <section className="store-section"><h2 className="store-section-title">Terakhir <em>dibuka</em></h2><div className="recent-list">{recentlyViewed.map((product) => <button className={`recent-item art-${product.tone}`} key={product.id} onClick={() => openProduct(product)}><span>{product.icon}</span><b>{product.name}</b></button>)}</div></section>}
      <section className="store-section"><h2 className="store-section-title">Produk <em>terlaris</em></h2><div className="best-list">{products.slice(0, 5).map((product, index) => card(product, index, true))}</div></section>
      <section className="store-section" id="products"><div className="store-section-heading"><h2 className="store-section-title">Semua <em>produk</em></h2><span>{filtered.length} item</span></div>{filtered.length ? <div className="store-grid">{filtered.map((product, index) => card(product, index))}</div> : <div className="store-empty">Belum ada produk untuk filter ini.</div>}</section>
      <footer id="footer" className="store-footer"><a href="#top">VALKRIE X969</a><span>Valkrie Tools · katalog digital</span><a href="#top">Kembali ke atas ↑</a></footer>
    </main>
    {profileOpen && <div className="profile-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileOpen(false); }}>
      <section className="profile-sheet" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <header className="profile-heading"><div><span className="profile-kicker">VALKRIE TOOLS</span><h2 id="profile-title">Profil kamu</h2></div><button className="profile-close" aria-label="Tutup profil" onClick={() => setProfileOpen(false)}><X size={19} /></button></header>
        <div className="profile-account"><span className="profile-avatar"><UserRound size={25} /></span><span className="profile-account-copy"><small>AKUN VALKRIE TOOLS</small><b>Selamat datang</b><span>Masuk untuk melihat profil dan aktivitas akun.</span></span><span className="member-badge">RAKYAT</span></div>
        <div className="profile-id-row"><span>User ID</span><b>Tampil setelah kamu masuk</b></div>
        <section className="membership-block"><div className="profile-section-head"><h3>Status member</h3><span>Detail di profil</span></div><article className="member-plan"><div className="plan-icon"><Gamepad2 size={18} /></div><div><b>Rakyat Biasa</b><small>Status awal setiap akun. Kuota dan aturan request berlaku sama untuk semua.</small></div><span className="plan-active">DEFAULT</span></article><article className="vip-plan"><div className="plan-icon"><Crown size={18} /></div><div className="vip-copy"><b>Rakyat VIP</b><small>Benefit kuota dan tools premium dijelaskan di halaman VIP.</small><a href="/vip">Pelajari manfaat VIP →</a></div></article></section>
        <section className="profile-shortcuts"><div className="profile-section-head"><h3>Aktivitas kamu</h3></div><button onClick={() => { setProfileOpen(false); navigateTo('products', 'favorites'); }}><Heart size={17} /><span><b>Produk favorit</b><small>{favorites.length} produk tersimpan</small></span><ChevronRight size={16} /></button><button onClick={() => { setProfileOpen(false); navigateTo('products', 'products'); }}><Clock3 size={17} /><span><b>Terakhir dibuka</b><small>{recentlyViewed.length} produk dilihat</small></span><ChevronRight size={16} /></button><button onClick={() => { setProfileOpen(false); navigateTo('quick-links', 'home'); }}><Bookmark size={17} /><span><b>Bantuan & update</b><small>Kontak admin dan saluran informasi</small></span><ChevronRight size={16} /></button></section>
        <a className="profile-login" href="/login"><UserRound size={17} /> Masuk / daftar <span>EMAIL</span></a>
        <p className="profile-note">Setelah daftar dan verifikasi email, User ID otomatis akan tampil di profil. Favorit katalog saat ini tersimpan di browser ini.</p>
      </section>
    </div>}
    <div className="store-fab"><button aria-label={muted ? 'Suara mati' : 'Matikan suara'} onClick={() => { setMuted(!muted); setToast(muted ? 'Suara dinyalakan.' : 'Suara dimatikan.'); }}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button><button aria-label="Pengaturan" onClick={toggleTheme}><Settings2 size={18} /></button><a aria-label="Info dan bantuan WhatsApp" href={channelUrl} target="_blank" rel="noreferrer"><Headphones size={18} /></a></div>
    {toast && <div className="store-toast" role="status">{toast}</div>}
  </div>;
}
