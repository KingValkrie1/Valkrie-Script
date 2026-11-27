import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Masuk untuk melihat kuota request.' }, { status: 401 });
    const { data, error } = await supabase.rpc('get_my_request_quota').single();
    if (error || !data) return NextResponse.json({ error: 'Kuota belum tersedia.' }, { status: 503 });
    return NextResponse.json({ quota: data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Kuota belum tersedia.' }, { status: 503 });
  }
}
