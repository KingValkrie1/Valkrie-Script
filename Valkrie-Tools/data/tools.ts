export type Tool = {
  slug: string;
  title: string;
  category: 'downloader' | 'maker' | 'tools' | 'visual' | 'vault' | 'external';
  badge?: string;
  tier: 'free' | 'vvip' | 'local' | 'external' | 'new';
  status: 'ready';
  description: string;
};

const entries: Array<[string, string, Tool['category']]> = [
  ['Baca Komik Full', 'FULL', 'tools'],
  ['Avatar Studio', 'SVG', 'maker'],
  ['HTML / WebGL to MP4', 'LOCAL MP4', 'maker'],
  ['Motion Control', 'EXTERNAL AI', 'visual'],
  ['Image Vectorizer', 'VVIP', 'visual'],
  ['SVG → XML', 'VVIP', 'maker'],
  ['Prompt Generator', 'VISION AI', 'tools'],
  ['Anime Discover', 'NEW · SFW', 'tools'],
  ['Big JPG', 'VVIP', 'visual'],
  ['FF Tools', 'FREE FIRE · OVERDRIVE', 'tools'],
  ['Social Downloader', 'TIKTOK + INSTAGRAM', 'downloader'],
  ['Alight Motion Premium 1 Tahun', 'VVIP', 'vault'],
  ['Auto Cut', 'REMOVE BG V4 · ALIGHT', 'maker'],
  ['Multi-AI', 'VVIP', 'tools'],
  ['AI Image', 'PUTER AI', 'visual'],
  ['Safelinku Bypass', 'DIRECT LINK', 'tools'],
  ['Cari Preset AM', 'TIKTOK → AM', 'downloader'],
  ['Placeholder Studio', 'NO API KEY', 'maker'],
  ['Auto PDF', 'VVIP', 'maker'],
  ['ML Tools', 'MLBB', 'tools'],
  ['QR Generator', 'QR', 'tools'],
  ['GenMail', 'VVIP', 'tools'],
  ['Danbooru Search', 'VVIP', 'external'],
  ['Image HD Enhancer V4', 'UPSCALE', 'visual'],
  ['Get Code HTML', 'VVIP', 'maker'],
  ['Remove BG', 'AI', 'visual'],
  ['Quote TikTok', 'NEXUS', 'maker'],
  ['ElevenLabs Studio', 'AUDIO AI', 'maker'],
  ['Fake OVO', 'SIMULASI', 'maker'],
  ['Sertifikat Custom', 'PNG', 'maker'],
  ['E-KTP Generator', 'Full', 'maker'],
  ['Foto To Link', 'STORAGE', 'vault'],
  ['Quote Generator', 'JPG', 'maker'],
  ['CariFakta', 'AI', 'tools'],
  ['Web Encryption', 'SECURE', 'tools'],
  ['Virus Scan', 'SECURITY', 'tools'],
  ['PDF Lab Local', '100% LOCAL', 'tools'],
  ['Crypto Market Scanner', 'MTF LIVE', 'tools'],
  ['BMKG Indonesia', 'BMKG', 'external'],
  ['IP & ASN Intelligence', 'IPINFO', 'tools'],
  ['Web Intelligence', 'INTEL', 'tools'],
  ['Space Explorer', 'NASA', 'external'],
  ['Document AI', 'VVIP', 'tools'],
  ['OCR Intelligence', 'OCR', 'tools'],
  ['2D Text Animate / Text FX', 'LOCAL XML', 'maker'],
  ['Fake Lobby', 'Game', 'maker'],
  ['3D Text Animate', '7 PRESET', 'maker'],
  ['Text FX Animation', '5 PRESET', 'maker'],
  ['Text to Vector', 'OPENTYPE', 'maker'],
  ['Trimpath Generator', 'LOCAL XML', 'maker'],
  ['Logo Animate', '8.33S', 'maker'],
  ['Password Gen', 'Secure', 'tools'],
  ['Windows Quotes', '2 STYLE', 'maker'],
  ['World Classics Reader', 'NEW', 'tools'],
  ['Morse Code', 'Audio', 'tools'],
  ['Anime to Real', 'AI TRANSFORM', 'visual'],
  ['Nokia Message', 'RETRO', 'maker'],
  ['AI Video Generator', 'AI VIDEO', 'visual'],
  ['AI Song Generator', 'VVIP', 'maker'],
  ['Smart Cutout', 'LOCAL AI', 'visual'],
  ['Downloader', 'Downloder', 'downloader'],
];

const toSlug = (title: string) => title.toLowerCase().replace(/→/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const describe = (title: string) => `${title} membantu kamu menyelesaikan kebutuhan dengan cepat dan praktis.`;

export const tools: Tool[] = entries.map(([title, badge, category]) => {
  const tier: Tool['tier'] = badge.includes('VVIP') ? 'vvip' : badge.includes('LOCAL') ? 'local' : badge.includes('NEW') ? 'new' : badge.includes('EXTERNAL') || category === 'external' ? 'external' : 'free';
  return { slug: toSlug(title), title, category, badge, tier, status: 'ready', description: describe(title) };
});

export const totalTools = tools.length; // 61
export const categories = ['all', 'downloader', 'maker', 'tools', 'visual', 'vault', 'external'] as const;
export type Category = typeof categories[number];
