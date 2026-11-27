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
  return <ToolCatalog products={tools} />;
}
