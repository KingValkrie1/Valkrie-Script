import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const categories = ['utility', 'web_tools', 'design_tools', 'developer_tools', 'productivity', 'other'];
const slugPattern = /^[a-z0-9-]{2,80}$/;

async function getAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { response: NextResponse.json({ error: 'Masuk sebagai admin.' }, { status: 401 }) };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') return { response: NextResponse.json({ error: 'Akses admin diperlukan.' }, { status: 403 }) };
  return { supabase, user };
}

function parseTool(body: Record<string, unknown>) {
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const category = typeof body.category === 'string' ? body.category : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const websiteUrl = typeof body.websiteUrl === 'string' ? body.websiteUrl.trim() : '';
  const iconUrl = typeof body.iconUrl === 'string' ? body.iconUrl.trim() : '';
  const isPremium = body.isPremium === true;
  const isPublished = body.isPublished === true;

  if (!slugPattern.test(slug) || name.length < 1 || name.length > 100 || !categories.includes(category) || description.length > 2000 || !websiteUrl) {
    return { error: 'Periksa slug, nama, kategori, deskripsi, dan URL situs resmi.' };
  }
  for (const value of [websiteUrl, iconUrl]) {
    if (!value) continue;
    try {
      if (new URL(value).protocol !== 'https:') return { error: 'Tautan tool dan ikon harus memakai HTTPS.' };
    } catch {
      return { error: 'Tautan tool atau ikon tidak valid.' };
    }
  }
  return {
    value: {
      slug,
      name,
      category,
      description,
      website_url: websiteUrl || null,
      icon_url: iconUrl || null,
      is_premium: isPremium,
      is_published: isPublished,
    },
  };
}

export async function POST(request: Request) {
  try {
    const auth = await getAdmin();
    if ('response' in auth) return auth.response;
    const body = await request.json();
    const parsed = parseTool(body);
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { error } = await auth.supabase.from('tools').insert({ ...parsed.value, created_by: auth.user.id });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Tool belum bisa disimpan. Periksa koneksi database.' }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAdmin();
    if ('response' in auth) return auth.response;
    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'ID tool tidak valid.' }, { status: 400 });
    const parsed = parseTool(body);
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { data, error } = await auth.supabase.from('tools').update(parsed.value).eq('id', id).select('id').maybeSingle();
    if (error || !data) return NextResponse.json({ error: error?.message || 'Tool tidak ditemukan.' }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Tool belum bisa diperbarui. Periksa koneksi database.' }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await getAdmin();
    if ('response' in auth) return auth.response;
    const { id } = await request.json();
    if (typeof id !== 'string' || !id) return NextResponse.json({ error: 'ID tool tidak valid.' }, { status: 400 });
    const { data, error } = await auth.supabase.from('tools').delete().eq('id', id).select('id').maybeSingle();
    if (error || !data) return NextResponse.json({ error: error?.message || 'Tool tidak ditemukan.' }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Tool belum bisa dihapus. Periksa koneksi database.' }, { status: 503 });
  }
}
