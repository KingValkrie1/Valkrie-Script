import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const usernamePattern = /^[a-z0-9_]{3,24}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
    const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : username;
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || email.length > 254 || !usernamePattern.test(username) || displayName.length < 1 || displayName.length > 40 || password.length < 10 || password.length > 128) {
      return NextResponse.json({ error: 'Periksa email, username (3–24 karakter: huruf, angka, _), nama, dan password (minimal 10 karakter).' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: new URL('/auth/callback?next=/profile', siteUrl).toString(),
        data: { username, display_name: displayName },
      },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true, message: 'Kalau email dapat didaftarkan, link verifikasi sudah dikirim. Cek inbox dan folder spam.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pendaftaran belum bisa diproses.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
