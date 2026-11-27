import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const password = typeof body.password === 'string' ? body.password : '';
    const confirmation = typeof body.confirmation === 'string' ? body.confirmation : '';
    if (password.length < 10 || password.length > 128 || confirmation !== 'HAPUS') return NextResponse.json({ error: 'Masukkan password dan ketik HAPUS untuk konfirmasi.' }, { status: 400 });
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: 'Masuk kembali untuk menghapus akun.' }, { status: 401 });
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password });
    if (verifyError) return NextResponse.json({ error: 'Password salah; akun belum dihapus.' }, { status: 401 });
    const admin = createSupabaseAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return NextResponse.json({ error: 'Akun belum bisa dihapus. Cek konfigurasi server.' }, { status: 503 });
    await supabase.auth.signOut({ scope: 'global' });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Penghapusan akun membutuhkan Supabase dan service role key server-side.' }, { status: 503 });
  }
}
