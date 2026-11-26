import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Masuk sebagai admin.' }, { status: 401 }) };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') return { error: NextResponse.json({ error: 'Akses admin diperlukan.' }, { status: 403 }) };
  return { supabase, user };
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if ('error' in admin) return admin.error;
    const userId = request.nextUrl.searchParams.get('userId')?.trim().toUpperCase();
    if (!userId) return NextResponse.json({ error: 'Masukkan User ID.' }, { status: 400 });
    const { data, error } = await admin.supabase.from('profiles').select('user_id,username,display_name,avatar_url,role,membership_tier,vip_expires_at,vip_permanent,joined_at').eq('user_id', userId).maybeSingle();
    if (error || !data) return NextResponse.json({ error: 'User ID tidak ditemukan.' }, { status: 404 });
    const activeVip = data.membership_tier === 'vip' && (data.vip_permanent || (data.vip_expires_at && Date.parse(data.vip_expires_at) > Date.now()));
    return NextResponse.json({ user: { ...data, activeVip } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Pencarian user belum bisa diproses.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if ('error' in admin) return admin.error;
    const body = await request.json();
    const userId = typeof body.userId === 'string' ? body.userId.trim().toUpperCase() : '';
    const operation = typeof body.operation === 'string' ? body.operation : '';
    const durationDays = typeof body.durationDays === 'number' ? body.durationDays : null;
    const permanent = body.permanent === true;
    const note = typeof body.note === 'string' ? body.note.trim() : '';
    if (!/^VALK-\d{6,}$/.test(userId) || !['grant', 'extend', 'revoke'].includes(operation) || note.length > 500) {
      return NextResponse.json({ error: 'Periksa User ID, aksi, atau catatan.' }, { status: 400 });
    }
    if (operation !== 'revoke' && !permanent && ![7, 30, 365].includes(durationDays || 0)) return NextResponse.json({ error: 'Pilih durasi 7 hari, 30 hari, 1 tahun, atau permanen.' }, { status: 400 });

    const { data, error } = await admin.supabase.rpc('admin_manage_vip', {
      target_user_id: userId,
      operation,
      duration_days: durationDays,
      permanent,
      note: note || null,
    });
    if (error) return NextResponse.json({ error: error.message.replace(/^.*?:\s*/, '') || 'Perubahan VIP belum berhasil.' }, { status: 400 });
    return NextResponse.json({ ok: true, user: data?.[0], message: operation === 'revoke' ? 'VIP dicabut.' : operation === 'extend' ? 'VIP berhasil diperpanjang.' : 'User berhasil dijadikan VIP.' });
  } catch {
    return NextResponse.json({ error: 'Perubahan VIP belum bisa diproses.' }, { status: 503 });
  }
}
