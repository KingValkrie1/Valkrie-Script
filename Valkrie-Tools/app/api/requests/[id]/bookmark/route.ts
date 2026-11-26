import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!uuidPattern.test(params.id)) return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
  try {
    const { supabase, user } = await getUser();
    if (!user) return NextResponse.json({ error: 'Masuk untuk menyimpan request.' }, { status: 401 });
    const { error } = await supabase.from('request_bookmarks').insert({ request_id: params.id, user_id: user.id });
    if (error?.code === '23505') return NextResponse.json({ ok: true, message: 'Request sudah ada di favorit.' });
    if (error) return NextResponse.json({ error: 'Request belum bisa disimpan.' }, { status: 400 });
    return NextResponse.json({ ok: true, message: 'Request disimpan ke favorit.' });
  } catch { return NextResponse.json({ error: 'Favorit belum bisa diperbarui.' }, { status: 503 }); }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!uuidPattern.test(params.id)) return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
  try {
    const { supabase, user } = await getUser();
    if (!user) return NextResponse.json({ error: 'Masuk untuk mengelola favorit.' }, { status: 401 });
    const { error } = await supabase.from('request_bookmarks').delete().eq('request_id', params.id).eq('user_id', user.id);
    if (error) return NextResponse.json({ error: 'Request belum bisa dihapus dari favorit.' }, { status: 400 });
    return NextResponse.json({ ok: true, message: 'Request dihapus dari favorit.' });
  } catch { return NextResponse.json({ error: 'Favorit belum bisa diperbarui.' }, { status: 503 }); }
}
