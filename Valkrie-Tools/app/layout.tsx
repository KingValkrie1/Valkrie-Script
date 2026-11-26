import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Valkrie Tools | ValkrieX969', template: '%s | Valkrie Tools' },
  description: 'ValkrieX969 — katalog digital Valkrie Tools untuk koleksi game dan layanan komunitas.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
