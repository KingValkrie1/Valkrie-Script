import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!uuidPattern.test(params.id)) return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Masuk dulu untuk vote.' }, { status: 401 });
    const { error } = await supabase.from('request_votes').insert({ request_id: params.id, user_id: user.id });
    if (error?.code === '23505') return NextResponse.json({ error: 'Kamu sudah vote request ini.' }, { status: 409 });
    if (error) return NextResponse.json({ error: 'Vote belum berhasil disimpan.' }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Vote belum bisa diproses.' }, { status: 503 });
  }
}
