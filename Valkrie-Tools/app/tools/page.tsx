import type { Metadata } from 'next';
import { ToolCatalog } from '@/components/ToolCatalog';
import { getCatalogTools } from '@/lib/tools/catalog';

export const metadata: Metadata = {
  title: 'Katalog Tools',
  description: 'Jelajahi tools pilihan untuk desain, produktivitas, utilitas, dan pengembangan.',
};

export const dynamic = 'force-dynamic';

export default async function ToolsPage() {
  const tools = await getCatalogTools();
  const source = tools[0]?.source ?? (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'database' : 'contoh');
  return <ToolCatalog products={tools} source={source} />;
}
