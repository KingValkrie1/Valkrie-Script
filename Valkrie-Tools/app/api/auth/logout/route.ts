import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut({ scope: 'global' });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Logout belum bisa diproses.' }, { status: 503 });
  }
}
