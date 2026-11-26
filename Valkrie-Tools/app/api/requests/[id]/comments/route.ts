import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!uuidPattern.test(params.id)) return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Masuk dulu untuk berkomentar.' }, { status: 401 });
    const body = await request.json();
    const comment = typeof body.body === 'string' ? body.body.trim() : '';
    if (!comment || comment.length > 2000) return NextResponse.json({ error: 'Komentar harus 1–2000 karakter.' }, { status: 400 });
    const { error } = await supabase.from('request_comments').insert({ request_id: params.id, user_id: user.id, body: comment });
    if (error) return NextResponse.json({ error: 'Komentar belum berhasil dikirim.' }, { status: 400 });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Komentar belum bisa diproses.' }, { status: 503 });
  }
}
