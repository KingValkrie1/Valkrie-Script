export type Product = {
  id: string;
  name: string;
  game: string;
  category: string;
  icon: string;
  status: string;
  tone: string;
  rank?: number;
  hot?: boolean;
};

// Edit daftar ini untuk menambah atau mengubah kartu produk di halaman utama.
export const products: Product[] = [
  { id: 'xyroz', name: 'XYROZ - MLBB', game: 'Mobile Legends', category: 'Mobile Legends', icon: 'ML', status: 'TERSEDIA', tone: 'violet', rank: 2, hot: true },
  { id: 'necro', name: 'NECRO TOOLKIT', game: 'Free Fire', category: 'Free Fire', icon: 'FF', status: 'TERSEDIA', tone: 'ember', rank: 3 },
  { id: 'codm', name: 'CODM LOADOUT', game: 'Call of Duty Mobile', category: 'CODM', icon: 'CoD', status: 'UPDATE', tone: 'steel', rank: 4 },
  { id: 'mlbb', name: 'MLBB TOOLKIT', game: 'Mobile Legends', category: 'Mobile Legends', icon: 'ML', status: 'TERSEDIA', tone: 'blue', rank: 5 },
  { id: 'ff-max', name: 'FREE FIRE MAX', game: 'Free Fire', category: 'Free Fire', icon: 'FF', status: 'BARU', tone: 'gold', hot: true },
  { id: 'codm-operator', name: 'OPERATOR PACK', game: 'Call of Duty Mobile', category: 'CODM', icon: 'CoD', status: 'TERSEDIA', tone: 'green' },
  { id: 'arena', name: 'ARENA UTILITY', game: 'Arena Breakout', category: 'Tools', icon: 'AB', status: 'TERSEDIA', tone: 'sand' },
  { id: 'pubg', name: 'PUBG MOBILE KIT', game: 'PUBG Mobile', category: 'Tools', icon: 'PUBG', status: 'UPDATE', tone: 'orange' },
];

export const categories = ['Semua', 'Favorit', 'Free Fire', 'Mobile Legends', 'CODM', 'Tools'];
