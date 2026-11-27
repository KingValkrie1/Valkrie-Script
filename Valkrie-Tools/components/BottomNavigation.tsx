'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, House, MessageSquarePlus, Search, UserRound } from 'lucide-react';

const items = [
  { href: '/', label: 'Beranda', icon: House, key: 'home' },
  { href: '/requests', label: 'Request', icon: MessageSquarePlus, key: 'request' },
  { href: '/tools', label: 'Cari', icon: Search, key: 'tools' },
  { href: '/favorites', label: 'Favorit', icon: Heart, key: 'favorites' },
  { href: '/profile', label: 'Akun', icon: UserRound, key: 'account' },
];

export function BottomNavigation() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin') || ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname) || pathname.startsWith('/auth/')) return null;
  const active = pathname === '/' ? 'home'
    : pathname.startsWith('/tools') ? 'tools'
      : pathname.startsWith('/requests/saved') || pathname.startsWith('/favorites') ? 'favorites'
        : pathname.startsWith('/requests') ? 'request'
          : pathname === '/profile' || pathname.startsWith('/account') || pathname.startsWith('/u/') ? 'account' : '';

  return <nav className="site-bottom-nav" aria-label="Navigasi utama">
    {items.map(({ href, label, icon: Icon, key }) => <Link key={key} href={href} className={active === key ? 'active' : undefined} aria-current={active === key ? 'page' : undefined}>
      <Icon size={19} aria-hidden="true" /><span>{label}</span>
    </Link>)}
  </nav>;
}
