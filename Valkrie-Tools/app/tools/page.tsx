import type { Metadata } from 'next';
import { ToolCatalog } from '@/components/ToolCatalog';

export const metadata: Metadata = {
  title: 'Katalog Tools',
  description: 'Jelajahi tools pilihan untuk desain, produktivitas, utilitas, dan pengembangan.',
};

export default function ToolsPage() {
  return <ToolCatalog />;
}
