import { ArrowUpRight, Sparkles } from 'lucide-react';
import type { Tool } from '@/data/tools';

const categoryNames: Record<Tool['category'], string> = { downloader: 'Downloader', maker: 'Maker', tools: 'Tools', visual: 'Visual', vault: 'Vault', external: 'External' };
export function ToolGrid({ tools }: { tools: Tool[] }) {
  if (!tools.length) return <p className="empty-state">Belum ada tools di kategori ini.</p>;
  return <div className="tool-grid">{tools.map((tool, index) => <article className="tool-card" key={tool.slug} style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}>
    <div className="card-top"><span className={`tool-icon icon-${tool.category}`}><Sparkles size={18} /></span>{tool.badge && <span className="tool-badge">{tool.badge}</span>}</div>
    <div className="card-copy"><span className="card-category">{categoryNames[tool.category]}</span><h2>{tool.title}</h2><p>{tool.description}</p></div>
    <div className="card-bottom"><span className={`tier tier-${tool.tier}`}>{tool.tier}</span><span className="card-arrow" aria-label="Fungsi segera hadir"><ArrowUpRight size={17} /></span></div>
  </article>)}</div>;
}
