import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ToolCatalog } from '@/components/ToolCatalog';
import { getCatalogTools } from '@/lib/tools/catalog';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function FavoriteToolsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <main className="request-page"><header className="request-top"><Link href="/tools">← KATALOG TOOLS</Link></header><div className="request-empty"><span>Favorit akun belum aktif</span><p>Favorit tools tersimpan per akun setelah Supabase dikonfigurasi.</p></div></main>;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=%2Ffavorites');
  const tools = await getCatalogTools();
  if (tools.some((tool) => tool.source !== 'database')) {
    return <main className="request-page"><header className="request-top"><Link href="/tools">← KATALOG TOOLS</Link></header><div className="request-empty"><span>Favorit akun belum tersedia</span><p>Migration katalog belum aktif di database ini.</p></div></main>;
  }
  return <ToolCatalog products={tools.filter((tool) => tool.favorite)} favoritesOnly source="database" />;
}
