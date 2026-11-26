import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const validStatuses = ['pending', 'processing', 'completed', 'duplicate'];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Masuk sebagai admin untuk mengelola request.' }, { status: 401 });
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Akses admin diperlukan.' }, { status: 403 });

    const body = await request.json();
    const ids = Array.isArray(body.ids) ? Array.from(new Set(body.ids)) : [];
    const status = typeof body.status === 'string' ? body.status : '';
    if (!ids.length || ids.length > 100 || ids.some((id) => typeof id !== 'string' || !uuidPattern.test(id)) || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Pilih maksimal 100 request dan status yang valid.' }, { status: 400 });
    }
    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    const { data, error } = await supabase.from('tool_requests').update({ status, completed_at: completedAt }).in('id', ids).select('id');
    if (error) return NextResponse.json({ error: 'Status belum berhasil diperbarui.' }, { status: 400 });
    const changedIds = (data || []).map((row) => row.id);
    if (!changedIds.length) return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
    const { error: logError } = await supabase.from('admin_activity').insert(changedIds.map((id) => ({ admin_id: user.id, action: 'request.bulk_moderated', target_type: 'request', target_id: id, details: { status } })));
    if (logError) return NextResponse.json({ error: 'Status berubah, tetapi pencatatan audit gagal.' }, { status: 503 });
    return NextResponse.json({ ok: true, ids: changedIds, message: `${changedIds.length} request berhasil diperbarui.` });
  } catch {
    return NextResponse.json({ error: 'Aksi massal belum bisa diproses.' }, { status: 503 });
  }
}
