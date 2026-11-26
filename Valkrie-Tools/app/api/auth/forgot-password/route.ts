import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || email.length > 254) return NextResponse.json({ error: 'Masukkan alamat email yang valid.' }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL('/auth/callback?next=/reset-password', siteUrl).toString(),
    });
    return NextResponse.json({ ok: true, message: 'Kalau email terdaftar, instruksi reset sudah dikirim.' });
  } catch {
    return NextResponse.json({ error: 'Permintaan reset belum bisa diproses.' }, { status: 503 });
  }
}
