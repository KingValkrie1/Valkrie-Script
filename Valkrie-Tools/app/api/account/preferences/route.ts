import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const fields = ['request_replies', 'request_status_changes', 'vip_changes', 'vip_expiry'] as const;

async function getAccount() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { response: NextResponse.json({ error: 'Masuk untuk mengatur preferensi.' }, { status: 401 }) };
  return { supabase, user };
}

export async function GET() {
  try {
    const account = await getAccount();
    if ('response' in account) return account.response;
    const { data, error } = await account.supabase.from('notification_preferences').select('request_replies,request_status_changes,vip_changes,vip_expiry,theme,language').eq('user_id', account.user.id).maybeSingle();
    if (error) return NextResponse.json({ error: 'Preferensi belum bisa dimuat.' }, { status: 400 });
    return NextResponse.json({ preferences: data || { request_replies: true, request_status_changes: true, vip_changes: true, vip_expiry: true, theme: 'dark', language: 'id' } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Koneksi preferensi belum tersedia.' }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  try {
    const account = await getAccount();
    if ('response' in account) return account.response;
    const body = await request.json();
    const validBooleans = fields.every((key) => typeof body[key] === 'boolean');
    if (!validBooleans || !['dark', 'light'].includes(body.theme) || !['id', 'en'].includes(body.language)) {
      return NextResponse.json({ error: 'Nilai preferensi tidak valid.' }, { status: 400 });
    }
    const preferences = Object.fromEntries(fields.map((key) => [key, body[key]]));
    const { error } = await account.supabase.from('notification_preferences').upsert({
      user_id: account.user.id,
      ...preferences,
      theme: body.theme,
      language: body.language,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) return NextResponse.json({ error: 'Preferensi belum bisa disimpan. Pastikan migration akun tersedia.' }, { status: 400 });
    return NextResponse.json({ ok: true, message: 'Preferensi tersimpan di akun.' });
  } catch {
    return NextResponse.json({ error: 'Preferensi belum bisa disimpan.' }, { status: 503 });
  }
}
