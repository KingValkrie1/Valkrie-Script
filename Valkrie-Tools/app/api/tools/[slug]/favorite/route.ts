import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type Context = { params: { slug: string } };

async function getBookmarkTarget(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { response: NextResponse.json({ error: 'Masuk untuk menyimpan favorit.' }, { status: 401 }) };
  const { data: tool } = await supabase.from('tools').select('id').eq('slug', slug).eq('is_published', true).maybeSingle();
  if (!tool) return { response: NextResponse.json({ error: 'Tool tidak ditemukan atau belum tersedia untuk akun ini.' }, { status: 404 }) };
  return { supabase, user, tool };
}

export async function POST(_request: Request, { params }: Context) {
  try {
    const target = await getBookmarkTarget(params.slug);
    if ('response' in target) return target.response;
    const { error } = await target.supabase.from('tool_bookmarks').insert({ tool_id: target.tool.id, user_id: target.user.id });
    if (error?.code === '23505') return NextResponse.json({ ok: true });
    if (error) return NextResponse.json({ error: 'Tool belum bisa disimpan ke favorit.' }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Favorit belum bisa diperbarui. Periksa koneksi database.' }, { status: 503 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const target = await getBookmarkTarget(params.slug);
    if ('response' in target) return target.response;
    const { error } = await target.supabase.from('tool_bookmarks').delete().eq('tool_id', target.tool.id).eq('user_id', target.user.id);
    if (error) return NextResponse.json({ error: 'Tool belum bisa dihapus dari favorit.' }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Favorit belum bisa diperbarui. Periksa koneksi database.' }, { status: 503 });
  }
}
