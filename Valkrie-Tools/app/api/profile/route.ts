import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Masuk dulu untuk mengubah profil.' }, { status: 401 });

    const body = await request.json();
    const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : undefined;
    const bio = typeof body.bio === 'string' ? body.bio.trim() : undefined;
    const city = typeof body.city === 'string' ? body.city.trim() : undefined;
    const avatarUrl = typeof body.avatarUrl === 'string' ? body.avatarUrl.trim() : undefined;
    if ((displayName !== undefined && (displayName.length < 1 || displayName.length > 40)) || (bio !== undefined && bio.length > 240) || (city !== undefined && city.length > 80)) {
      return NextResponse.json({ error: 'Nama, bio, atau kota melebihi batas yang diizinkan.' }, { status: 400 });
    }
    if (avatarUrl !== undefined) {
      const storagePrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.id}/`;
      if (!avatarUrl.startsWith(storagePrefix) || avatarUrl.length > 2048) return NextResponse.json({ error: 'URL foto profil tidak valid.' }, { status: 400 });
    }

    const { data: profile } = await supabase.from('profiles').select('membership_tier, vip_expires_at, vip_permanent').eq('id', user.id).maybeSingle();
    const vipActive = profile?.membership_tier === 'vip' && (profile.vip_permanent || (profile.vip_expires_at && new Date(profile.vip_expires_at).getTime() > Date.now()));
    if (city && !vipActive) return NextResponse.json({ error: 'Kolom kota request tersedia untuk Rakyat VIP aktif.' }, { status: 403 });

    const updates: Record<string, string | null> = {};
    if (displayName !== undefined) updates.display_name = displayName;
    if (bio !== undefined) updates.bio = bio || null;
    if (city !== undefined) updates.city = vipActive ? city || null : null;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'Tidak ada perubahan profil.' }, { status: 400 });
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) return NextResponse.json({ error: 'Profil belum dapat disimpan. Cek koneksi database.' }, { status: 400 });
    return NextResponse.json({ ok: true, message: 'Profil berhasil diperbarui.' });
  } catch {
    return NextResponse.json({ error: 'Profil belum dapat diperbarui.' }, { status: 503 });
  }
}
