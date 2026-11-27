import { products, type Product } from '@/data/products';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type CatalogTool = Product & {
  description: string;
  premium: boolean;
  source: 'database' | 'contoh';
  favorite: boolean;
};

const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function fixtureTools(): CatalogTool[] {
  return products.map((product) => ({
    ...product,
    description: `${product.name} membantu kebutuhan ${product.category.toLowerCase()} melalui layanan resminya.`,
    premium: false,
    source: 'contoh',
    favorite: false,
  }));
}

export async function getCatalogTools(): Promise<CatalogTool[]> {
  if (!hasSupabaseConfig) return fixtureTools();

  try {
    const supabase = await createSupabaseServerClient();
    const [{ data, error }, { data: { user } }] = await Promise.all([
      supabase
      .from('tools')
      .select('id,slug,name,category,description,icon_url,website_url,is_premium')
      .eq('is_published', true)
      .order('name', { ascending: true }),
      supabase.auth.getUser(),
    ]);

    if (error || !data) return fixtureTools();
    const { data: saved } = user
      ? await supabase.from('tool_bookmarks').select('tool_id').eq('user_id', user.id)
      : { data: [] };
    const savedIds = new Set((saved || []).map((bookmark) => bookmark.tool_id));
    return data.map((tool) => ({
      id: tool.slug,
      name: tool.name,
      platform: 'WEB APP',
      category: tool.category.replaceAll('_', ' '),
      icon: tool.name.slice(0, 2).toUpperCase(),
      status: 'TERSEDIA',
      tone: 'gold',
      websiteUrl: tool.website_url || '#',
      description: tool.description,
      premium: tool.is_premium,
      source: 'database',
      favorite: savedIds.has(tool.id),
    }));
  } catch {
    return fixtureTools();
  }
}

export async function getCatalogTool(slug: string): Promise<CatalogTool | null> {
  if (hasSupabaseConfig) {
    try {
      const supabase = await createSupabaseServerClient();
      const [{ data }, { data: { user } }] = await Promise.all([
        supabase
        .from('tools')
        .select('id,slug,name,category,description,icon_url,website_url,is_premium')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle(),
        supabase.auth.getUser(),
      ]);

      if (data) {
        const { data: bookmark } = user
          ? await supabase.from('tool_bookmarks').select('tool_id').eq('tool_id', data.id).eq('user_id', user.id).maybeSingle()
          : { data: null };
        return {
          id: data.slug,
          name: data.name,
          platform: 'WEB APP',
          category: data.category.replaceAll('_', ' '),
          icon: data.name.slice(0, 2).toUpperCase(),
          status: 'TERSEDIA',
          tone: 'gold',
          websiteUrl: data.website_url || '#',
          description: data.description,
          premium: data.is_premium,
          source: 'database',
          favorite: Boolean(bookmark),
        };
      }
    } catch {
      // Fixture pages stay available until Supabase is configured.
    }
  }

  const fixture = fixtureTools().find((tool) => tool.id === slug);
  return fixture || null;
}
