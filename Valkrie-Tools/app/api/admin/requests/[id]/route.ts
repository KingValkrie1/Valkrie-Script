import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validStatuses = ['pending', 'processing', 'completed', 'rejected', 'duplicate'];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!uuidPattern.test(params.id)) return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Masuk sebagai admin untuk mengelola request.' }, { status: 401 });
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Akses admin diperlukan.' }, { status: 403 });

    const body = await request.json();
    const status = typeof body.status === 'string' ? body.status : '';
    const reply = typeof body.reply === 'string' ? body.reply.trim() : '';
    const rejectionReason = typeof body.rejectionReason === 'string' ? body.rejectionReason.trim() : '';
    if (!validStatuses.includes(status) || reply.length > 5000 || rejectionReason.length > 1000 || typeof body.pinned !== 'boolean' || typeof body.hidden !== 'boolean') return NextResponse.json({ error: 'Periksa status atau panjang balasan.' }, { status: 400 });
    if (status === 'rejected' && !rejectionReason) return NextResponse.json({ error: 'Tuliskan alasan penolakan yang akan terlihat publik.' }, { status: 400 });

    const updates = {
      status,
      admin_reply: reply || null,
      rejection_reason: status === 'rejected' ? rejectionReason : null,
      pinned: body.pinned,
      hidden: body.hidden,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    };
    const { data, error } = await supabase.from('tool_requests').update(updates).eq('id', params.id).select('id').maybeSingle();
    if (error) return NextResponse.json({ error: 'Perubahan belum berhasil disimpan.' }, { status: 400 });
    if (!data) return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
    await supabase.from('admin_activity').insert({ admin_id: user.id, action: 'request.moderated', target_type: 'request', target_id: params.id, details: updates });
    return NextResponse.json({ ok: true, message: 'Request berhasil diperbarui.' });
  } catch {
    return NextResponse.json({ error: 'Perubahan request belum bisa diproses.' }, { status: 503 });
  }
}
