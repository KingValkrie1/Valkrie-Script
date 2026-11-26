import Link from 'next/link';
import { redirect } from 'next/navigation';
import { EditProfileForm } from '@/components/auth/EditProfileForm';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return <main className="auth-shell"><section className="auth-card"><h1>Profil</h1><p>Profile belum aktif. Database Supabase perlu dikonfigurasi.</p><Link href="/">Kembali ke beranda</Link></section></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('user_id, username, display_name, avatar_url, bio, city, role, membership_tier, vip_expires_at, vip_permanent, joined_at').eq('id', user.id).maybeSingle();
  if (!profile) return <main className="auth-shell"><section className="auth-card"><h1>Profil belum siap</h1><p>Database belum selesai disiapkan. Coba lagi nanti.</p><SignOutButton /></section></main>;

  const vipActive = profile.membership_tier === 'vip' && (profile.vip_permanent || (profile.vip_expires_at && new Date(profile.vip_expires_at).getTime() > Date.now()));
  const badge = profile.role === 'admin' ? 'ADMIN' : vipActive ? 'RAKYAT VIP' : 'RAKYAT BIASA';
  return <main className="auth-shell">
    <Link href="/" className="auth-brand"><span>V</span> VALKRIE<span className="auth-brand-accent">X969</span></Link>
    <section className="auth-card profile-card">
      <span className="auth-kicker">PROFIL VALKRIE TOOLS</span>
      <h1>{profile.display_name}</h1>
      <span className={`profile-role role-${profile.role === 'admin' ? 'admin' : vipActive ? 'vip' : 'member'}`}>{badge}</span>
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
      <p className="auth-setup-note">Avatar upload dan preferensi akun menyusul. Favorit saat ini tetap tersimpan di browser ini.</p>
      <SignOutButton />
      <Link href="/" className="profile-home-link">Kembali ke katalog</Link>
    </section>
  </main>;
}
