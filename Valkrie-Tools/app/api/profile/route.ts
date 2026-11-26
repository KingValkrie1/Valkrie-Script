import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Masuk dulu untuk mengubah profil.' }, { status: 401 });

    const body = await request.json();
    const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';
    const bio = typeof body.bio === 'string' ? body.bio.trim() : '';
    const city = typeof body.city === 'string' ? body.city.trim() : '';
    if (displayName.length < 1 || displayName.length > 40 || bio.length > 240 || city.length > 80) {
      return NextResponse.json({ error: 'Nama, bio, atau kota melebihi batas yang diizinkan.' }, { status: 400 });
    }

    const { data: profile } = await supabase.from('profiles').select('membership_tier, vip_expires_at, vip_permanent').eq('id', user.id).maybeSingle();
    const vipActive = profile?.membership_tier === 'vip' && (profile.vip_permanent || (profile.vip_expires_at && new Date(profile.vip_expires_at).getTime() > Date.now()));
    if (city && !vipActive) return NextResponse.json({ error: 'Kolom kota request tersedia untuk Rakyat VIP aktif.' }, { status: 403 });

    const { error } = await supabase.from('profiles').update({ display_name: displayName, bio: bio || null, city: vipActive ? city || null : null }).eq('id', user.id);
    if (error) return NextResponse.json({ error: 'Profil belum dapat disimpan. Cek koneksi database.' }, { status: 400 });
    return NextResponse.json({ ok: true, message: 'Profil berhasil diperbarui.' });
  } catch {
    return NextResponse.json({ error: 'Profil belum dapat diperbarui.' }, { status: 503 });
  }
}
