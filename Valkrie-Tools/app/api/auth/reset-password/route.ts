import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = typeof body.password === 'string' ? body.password : '';
    if (password.length < 10 || password.length > 128) return NextResponse.json({ error: 'Password baru minimal 10 karakter.' }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sesi reset tidak ditemukan. Minta link reset baru.' }, { status: 401 });
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, message: 'Password sudah diperbarui.' });
  } catch {
    return NextResponse.json({ error: 'Password belum bisa diperbarui.' }, { status: 503 });
  }
}
