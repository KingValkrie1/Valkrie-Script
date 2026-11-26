export type Product = {
  id: string;
  name: string;
  platform: string;
  category: string;
  icon: string;
  status: string;
  tone: string;
  rank?: number;
  hot?: boolean;
  websiteUrl: string;
};

// Edit daftar ini untuk menambah atau mengubah kartu produk di halaman utama.
export const products: Product[] = [
  { id: 'photopea', name: 'Photopea Editor', platform: 'WEB APP', category: 'Design Tools', icon: 'P', status: 'TERSEDIA', tone: 'violet', rank: 2, hot: true, websiteUrl: 'https://www.photopea.com/' },
  { id: 'canva', name: 'Canva Design', platform: 'WEB APP', category: 'Design Tools', icon: 'C', status: 'TERSEDIA', tone: 'ember', rank: 3, websiteUrl: 'https://www.canva.com/' },
  { id: 'figma', name: 'Figma Design', platform: 'WEB APP', category: 'Design Tools', icon: 'F', status: 'TERSEDIA', tone: 'steel', rank: 4, websiteUrl: 'https://www.figma.com/' },
  { id: 'vscode', name: 'Visual Studio Code', platform: 'DESKTOP APP', category: 'Developer Tools', icon: 'VS', status: 'TERSEDIA', tone: 'blue', rank: 5, websiteUrl: 'https://code.visualstudio.com/' },
  { id: 'notion', name: 'Notion Workspace', platform: 'WEB APP', category: 'Productivity', icon: 'N', status: 'BARU', tone: 'gold', hot: true, websiteUrl: 'https://www.notion.so/' },
  { id: 'docs', name: 'Google Docs', platform: 'WEB APP', category: 'Productivity', icon: 'D', status: 'TERSEDIA', tone: 'green', websiteUrl: 'https://docs.google.com/' },
  { id: 'sheets', name: 'Google Sheets', platform: 'WEB APP', category: 'Productivity', icon: 'S', status: 'TERSEDIA', tone: 'sand', websiteUrl: 'https://sheets.google.com/' },
  { id: 'pdf24', name: 'PDF24 Tools', platform: 'WEB APP', category: 'Utility', icon: 'PDF', status: 'TERSEDIA', tone: 'orange', websiteUrl: 'https://tools.pdf24.org/' },
];

export const categories = ['Semua', 'Favorit'].concat(Array.from(new Set(products.map((product) => product.category))));
