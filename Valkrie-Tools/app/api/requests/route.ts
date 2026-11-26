import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const categories = ['utility', 'web_tools', 'design_tools', 'developer_tools', 'productivity', 'other'] as const;

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('public_request_board').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(200);
    if (error) return NextResponse.json({ error: 'Daftar request belum tersedia.' }, { status: 503 });
    return NextResponse.json({ requests: data || [] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ requests: [], configured: false }, { headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Masuk dulu untuk mengajukan tool.' }, { status: 401 });

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const category = typeof body.category === 'string' ? body.category : '';
    const referenceUrl = typeof body.referenceUrl === 'string' ? body.referenceUrl.trim() : '';
    const tags = typeof body.tags === 'string' ? body.tags.split(',').map((tag: string) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 8) : [];
    if (name.length < 2 || name.length > 120 || description.length < 10 || description.length > 5000 || !categories.includes(category as typeof categories[number])) {
      return NextResponse.json({ error: 'Isi nama, kategori, dan deskripsi request dengan benar.' }, { status: 400 });
    }
    if (referenceUrl) {
      try { const parsed = new URL(referenceUrl); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); }
      catch { return NextResponse.json({ error: 'Link referensi harus berupa URL http atau https.' }, { status: 400 }); }
    }

    const { data, error } = await supabase.from('tool_requests').insert({
      user_id: user.id, name, category, description, reference_url: referenceUrl || null, tags,
    }).select('id').single();
    if (error) {
      if (error.message.includes('quota')) return NextResponse.json({ error: 'Kuota request mingguanmu sudah habis.' }, { status: 429 });
      return NextResponse.json({ error: 'Request belum berhasil disimpan. Coba lagi nanti.' }, { status: 400 });
    }
    return NextResponse.json({ ok: true, id: data.id, message: 'Request berhasil diajukan.' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Request belum bisa diproses. Pastikan database sudah disiapkan.' }, { status: 503 });
  }
}
