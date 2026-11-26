import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const invalidLogin = () => NextResponse.json({ error: 'Email/username atau password salah.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = typeof body.identifier === 'string' ? body.identifier.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!identifier || !password || identifier.length > 254 || password.length > 256) return invalidLogin();

    let email = identifier.toLowerCase();
    if (!identifier.includes('@')) {
      const admin = createSupabaseAdminClient();
      const { data: profile } = await admin.from('profiles').select('id').eq('username', identifier.toLowerCase()).maybeSingle();
      if (!profile) return invalidLogin();
      const { data: result, error: lookupError } = await admin.auth.admin.getUserById(profile.id);
      if (lookupError || !result.user?.email) return invalidLogin();
      email = result.user.email;
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return invalidLogin();

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login belum bisa diproses.';
    return NextResponse.json({ error: message }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
