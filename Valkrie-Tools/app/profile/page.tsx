import Link from 'next/link';
import { redirect } from 'next/navigation';
import { EditProfileForm } from '@/components/auth/EditProfileForm';
import { ProfilePhotoForm } from '@/components/auth/ProfilePhotoForm';
import { DeactivateAccountForm, PasswordChangeForm } from '@/components/auth/AccountSecurityForms';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return <main className="auth-shell"><section className="auth-card"><h1>Profil</h1><p>Profile belum aktif. Database Supabase perlu dikonfigurasi.</p><Link href="/">Kembali ke beranda</Link></section></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('user_id, username, display_name, avatar_url, bio, city, role, membership_tier, vip_expires_at, vip_permanent, joined_at').eq('id', user.id).maybeSingle();
  if (!profile) return <main className="auth-shell"><section className="auth-card"><h1>Profil belum siap</h1><p>Database belum selesai disiapkan. Coba lagi nanti.</p><SignOutButton /></section></main>;
  const { data: ownRequests } = await supabase.from('tool_requests').select('id,request_number,name,status,admin_reply,hidden,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);

  const vipActive = profile.membership_tier === 'vip' && (profile.vip_permanent || (profile.vip_expires_at && new Date(profile.vip_expires_at).getTime() > Date.now()));
  const badge = profile.role === 'admin' ? 'ADMIN' : vipActive ? 'RAKYAT VIP' : 'RAKYAT BIASA';
  return <main className="auth-shell">
    <Link href="/" className="auth-brand"><span>V</span> VALKRIE<span className="auth-brand-accent">X969</span></Link>
    <section className="auth-card profile-card">
      <span className="auth-kicker">PROFIL VALKRIE TOOLS</span>
      <h1>{profile.display_name}</h1>
      <span className={`profile-role role-${profile.role === 'admin' ? 'admin' : vipActive ? 'vip' : 'member'}`}>{badge}</span>
      <ProfilePhotoForm avatarUrl={profile.avatar_url} displayName={profile.display_name} />
      <dl className="profile-details">
        <div><dt>User ID</dt><dd>{profile.user_id}</dd></div>
        <div><dt>Username</dt><dd>@{profile.username}</dd></div>
        <div><dt>Email</dt><dd>{user.email}</dd></div>
        <div><dt>Member sejak</dt><dd>{new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(profile.joined_at))}</dd></div>
        {vipActive && <div><dt>Status VIP</dt><dd>{profile.vip_permanent ? 'Permanen' : `Sampai ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(profile.vip_expires_at!))}`}</dd></div>}
        {profile.city && <div><dt>Kota request</dt><dd>{profile.city}</dd></div>}
        {profile.bio && <div><dt>Bio</dt><dd>{profile.bio}</dd></div>}
      </dl>
      <EditProfileForm displayName={profile.display_name} bio={profile.bio} city={profile.city} canSetCity={Boolean(vipActive)} />
      <PasswordChangeForm />
      <Link href={`/u/${profile.username}`} className="profile-home-link">Lihat profil publik →</Link>
      <section className="profile-my-requests"><div><span className="auth-kicker">AKTIVITAS</span><h2>Request saya</h2></div>{ownRequests?.length ? ownRequests.map((item) => <article key={item.id}>{item.hidden ? <span>{item.name} <small>· disembunyikan admin</small></span> : <Link href={`/requests/${item.id}`}>{item.name} <small>· REQ-{item.request_number}</small></Link>}<b className={`request-status status-${item.status}`}>{({ pending: 'Menunggu', processing: 'Diproses', completed: 'Selesai', rejected: 'Ditolak', duplicate: 'Duplikat' } as Record<string, string>)[item.status] || item.status}</b><small>{item.admin_reply ? 'Sudah dibalas admin' : 'Belum dibalas admin'}</small></article>) : <p>Belum ada request yang kamu ajukan. <Link href="/requests">Buka Request Board</Link></p>}</section>
      <Link href="/favorites" className="profile-home-link">Lihat favorit tools akun →</Link>
      <Link href="/account/preferences" className="profile-home-link">Atur preferensi akun →</Link>
      <SignOutButton />
      <DeactivateAccountForm />
      <Link href="/" className="profile-home-link">Kembali ke katalog</Link>
    </section>
  </main>;
}
