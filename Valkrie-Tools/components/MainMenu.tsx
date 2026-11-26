'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MoreVertical, ExternalLink, Info } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ThemeSwitch } from '@/components/ThemeSwitch';
import { ApkModal } from '@/components/ApkModal';
import { categories, totalTools, type Category } from '@/data/tools';

const names: Record<Category, string> = { all: `Semua Tools · ${totalTools}`, downloader: 'Downloader', maker: 'Maker', tools: 'Tools', visual: 'Visual', vault: 'Vault', external: 'External' };
const reportUrl = 'https://example.com/report-bug';

export function MainMenu() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  function choose(category: Category) {
    router.replace(`/?cat=${category}`, { scroll: false });
    setSheetOpen(false);
  }
  return <>
    <div className="desktop-menu">
      <DropdownMenu>
        <DropdownMenuTrigger asChild><button className="icon-button" aria-label="Menu"><MoreVertical size={21} /></button></DropdownMenuTrigger>
        <DropdownMenuContent className="menu-content" align="start" sideOffset={9}>
          <DropdownMenuLabel className="menu-heading">Jelajahi</DropdownMenuLabel>
          {categories.map((category) => <DropdownMenuItem key={category} className="menu-item" onSelect={() => choose(category)}>{names[category]}</DropdownMenuItem>)}
          <DropdownMenuSeparator className="menu-separator" />
          <div className="menu-theme"><ThemeSwitch /></div>
          <DropdownMenuSeparator className="menu-separator" />
          <div className="menu-control"><ApkModal /></div>
          <DropdownMenuItem asChild className="menu-item"><Link href="/about"><Info size={16} />About Dev</Link></DropdownMenuItem>
          <DropdownMenuItem asChild className="menu-item"><a href={reportUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} />Report Bug</a></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div className="mobile-menu">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild><button className="icon-button" aria-label="Menu"><MoreVertical size={21} /></button></SheetTrigger>
        <SheetContent side="bottom" className="mobile-sheet">
          <div className="sheet-handle" /><SheetTitle className="menu-heading">Jelajahi Valkrie-Tools</SheetTitle>
          <nav role="menu" aria-label="Kategori tools" className="sheet-categories" onKeyDown={(event) => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
            const current = items.indexOf(document.activeElement as HTMLButtonElement);
            const direction = event.key === 'ArrowDown' ? 1 : -1;
            items[(current + direction + items.length) % items.length]?.focus();
          }}>{categories.map((category, index) => <button role="menuitem" tabIndex={index === 0 ? 0 : -1} type="button" key={category} className="menu-item" onClick={() => choose(category)}>{names[category]}</button>)}</nav>
          <div className="sheet-divider" /><ThemeSwitch />
          <div className="sheet-divider" /><ApkModal />
          <Link className="menu-item" href="/about" onClick={() => setSheetOpen(false)}><Info size={16} />About Dev</Link>
          <a className="menu-item" href={reportUrl} target="_blank" rel="noreferrer" onClick={() => setSheetOpen(false)}><ExternalLink size={16} />Report Bug</a>
        </SheetContent>
      </Sheet>
    </div>
  </>;
}
