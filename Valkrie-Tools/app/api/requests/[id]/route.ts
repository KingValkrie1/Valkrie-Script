import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const categories = ['utility', 'web_tools', 'design_tools', 'developer_tools', 'productivity', 'other'];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!uuidPattern.test(params.id)) return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Masuk dulu untuk mengedit request.' }, { status: 401 });
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const category = typeof body.category === 'string' ? body.category : '';
    const referenceUrl = typeof body.referenceUrl === 'string' ? body.referenceUrl.trim() : '';
    if (name.length < 2 || name.length > 120 || description.length < 10 || description.length > 5000 || !categories.includes(category)) {
      return NextResponse.json({ error: 'Isi nama, kategori, dan deskripsi dengan benar.' }, { status: 400 });
    }
    if (referenceUrl) {
      try { const parsed = new URL(referenceUrl); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); }
      catch { return NextResponse.json({ error: 'Link referensi harus memakai http atau https.' }, { status: 400 }); }
    }
    const { data, error } = await supabase.from('tool_requests').update({ name, category, description, reference_url: referenceUrl || null }).eq('id', params.id).eq('user_id', user.id).is('admin_reply', null).select('id').maybeSingle();
    if (error) return NextResponse.json({ error: 'Request ini sudah dibalas atau tidak bisa diedit.' }, { status: 409 });
    if (!data) return NextResponse.json({ error: 'Request tidak ditemukan atau sudah dibalas admin.' }, { status: 404 });
    return NextResponse.json({ ok: true, message: 'Request berhasil diperbarui.' });
  } catch {
    return NextResponse.json({ error: 'Request belum bisa diperbarui.' }, { status: 503 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!uuidPattern.test(params.id)) return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Masuk dulu untuk menghapus request.' }, { status: 401 });
    const { data, error } = await supabase.from('tool_requests').delete().eq('id', params.id).eq('user_id', user.id).is('admin_reply', null).select('id').maybeSingle();
    if (error) return NextResponse.json({ error: 'Request ini sudah dibalas atau tidak bisa dihapus.' }, { status: 409 });
    if (!data) return NextResponse.json({ error: 'Request tidak ditemukan atau sudah dibalas admin.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Request belum bisa dihapus.' }, { status: 503 });
  }
}
