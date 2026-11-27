import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    if (!currentPassword || newPassword.length < 10 || newPassword.length > 128) return NextResponse.json({ error: 'Password saat ini wajib diisi; password baru minimal 10 karakter.' }, { status: 400 });
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: 'Masuk kembali untuk mengubah password.' }, { status: 401 });
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
    if (verifyError) return NextResponse.json({ error: 'Password saat ini salah.' }, { status: 401 });
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return NextResponse.json({ error: 'Password baru belum bisa disimpan.' }, { status: 400 });
    return NextResponse.json({ ok: true, message: 'Password berhasil diperbarui.' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Password belum bisa diubah. Periksa konfigurasi Supabase.' }, { status: 503 });
  }
}
