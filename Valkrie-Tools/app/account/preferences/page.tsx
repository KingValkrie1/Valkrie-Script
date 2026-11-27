import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PreferencesForm, type AccountPreferences } from '@/components/account/PreferencesForm';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const defaults: AccountPreferences = { request_replies: true, request_status_changes: true, vip_changes: true, vip_expiry: true, theme: 'dark', language: 'id' };

export default async function AccountPreferencesPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="auth-shell"><section className="auth-card"><h1>Preferensi akun belum aktif</h1><p>Hubungkan Supabase untuk menyimpan pilihan tema, bahasa, dan notifikasi ke akun.</p><Link href="/">Kembali ke beranda</Link></section></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=%2Faccount%2Fpreferences');
  const { data } = await supabase.from('notification_preferences').select('request_replies,request_status_changes,vip_changes,vip_expiry,theme,language').eq('user_id', user.id).maybeSingle();
  const preferences = { ...defaults, ...(data || {}) } as AccountPreferences;

  return <main className="auth-shell"><Link href="/profile" className="auth-brand"><span>V</span> VALKRIE<span className="auth-brand-accent">X969</span></Link><section className="auth-card"><span className="auth-kicker">PENGATURAN AKUN</span><h1>Preferensi</h1><p>Atur pilihan notifikasi, tampilan, dan bahasa akunmu.</p><PreferencesForm initialPreferences={preferences} /><Link href="/profile" className="profile-home-link">← Kembali ke profil</Link></section></main>;
}
