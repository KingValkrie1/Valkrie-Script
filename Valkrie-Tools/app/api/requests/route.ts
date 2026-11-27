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

    const contentType = request.headers.get('content-type') || '';
    let body: Record<string, FormDataEntryValue | unknown>;
    let image: File | null = null;
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      image = form.get('image') instanceof File && (form.get('image') as File).size > 0 ? form.get('image') as File : null;
      body = Object.fromEntries(Array.from(form.entries()).filter(([key]) => key !== 'image'));
    } else {
      body = await request.json();
    }
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

    if (image && (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type) || image.size > 5 * 1024 * 1024)) {
      return NextResponse.json({ error: 'Gambar harus JPG, PNG, atau WebP maksimal 5 MB.' }, { status: 400 });
    }
    const requestId = crypto.randomUUID();
    let imagePath: string | null = null;
    if (image) {
      const extension = image.type === 'image/jpeg' ? 'jpg' : image.type === 'image/png' ? 'png' : 'webp';
      imagePath = `${user.id}/${requestId}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('request-attachments').upload(imagePath, image, { contentType: image.type, cacheControl: '3600', upsert: false });
      if (uploadError) return NextResponse.json({ error: 'Gambar belum bisa diunggah. Pastikan migration penyimpanan request sudah dijalankan.' }, { status: 400 });
    }

    const { data, error } = await supabase.from('tool_requests').insert({
      id: requestId, user_id: user.id, name, category, description, reference_url: referenceUrl || null, tags, image_path: imagePath,
    }).select('id').single();
    if (error) {
      if (imagePath) await supabase.storage.from('request-attachments').remove([imagePath]);
      if (error.message.includes('quota')) return NextResponse.json({ error: 'Kuota request mingguanmu sudah habis.' }, { status: 429 });
      return NextResponse.json({ error: 'Request belum berhasil disimpan. Coba lagi nanti.' }, { status: 400 });
    }
    return NextResponse.json({ ok: true, id: data.id, message: 'Request berhasil diajukan.' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Request belum bisa diproses. Pastikan database sudah disiapkan.' }, { status: 503 });
  }
}
