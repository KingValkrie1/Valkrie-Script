import type { Metadata } from 'next';
import './globals.css';
import './preferences.css';
import { PreferenceApplier } from '@/components/account/PreferenceApplier';
import { BottomNavigation } from '@/components/BottomNavigation';
export const metadata: Metadata = {
  title: { default: 'Valkrie Tools | ValkrieX969', template: '%s | Valkrie Tools' },
  description: 'ValkrieX969 — katalog tools digital legal untuk desain, produktivitas, utilitas, dan pengembangan.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body><PreferenceApplier />{children}<BottomNavigation /></body></html>;
}
