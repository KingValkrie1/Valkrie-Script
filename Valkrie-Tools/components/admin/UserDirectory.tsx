'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

export type AdminDirectoryUser = { id: string; user_id: string; username: string; display_name: string; avatar_url: string | null; role: string; membership_tier: string; vip_expires_at: string | null; vip_permanent: boolean; joined_at: string; vip_active: boolean };

export function UserDirectory({ users }: { users: AdminDirectoryUser[] }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => users.filter((user) => `${user.display_name} ${user.username} ${user.user_id}`.toLowerCase().includes(search.toLowerCase())), [users, search]);
  return <section className="user-directory"><label className="user-search">Cari user<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nama, @username, atau VALK-000123" /></label><div className="user-directory-heading"><b>{filtered.length} pengguna</b><span>maks. 500 terbaru</span></div>{filtered.length ? filtered.map((user) => <article className="user-directory-row" key={user.id}><div className="directory-avatar">{user.avatar_url ? <img src={user.avatar_url} alt="" /> : user.display_name.slice(0, 1).toUpperCase()}</div><div className="directory-user-copy"><b>{user.display_name}</b><small>@{user.username} · {user.user_id}</small><small>Gabung {new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(new Date(user.joined_at))}</small></div><strong className={user.role === 'admin' ? 'author-admin' : user.vip_active ? 'author-vip' : ''}>{user.role === 'admin' ? 'ADMIN' : user.vip_active ? 'RAKYAT VIP' : 'RAKYAT BIASA'}</strong>{user.role !== 'admin' && <Link href={`/admin/vip?userId=${encodeURIComponent(user.user_id)}`} className="directory-vip-link">Atur VIP</Link>}</article>) : <div className="request-empty"><span>User tidak ditemukan</span><p>Coba cari dengan nama atau User ID lengkap.</p></div>}</section>;
}
