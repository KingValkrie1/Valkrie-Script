'use client';
import * as Dialog from '@radix-ui/react-dialog';

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;
export const SheetTitle = Dialog.Title;
export const SheetDescription = Dialog.Description;
export const SheetPortal = Dialog.Portal;
export function SheetContent({ children, side = 'bottom', className = '' }: { children: React.ReactNode; side?: 'bottom'; className?: string }) {
  return <Dialog.Portal><Dialog.Overlay className="sheet-overlay" /><Dialog.Content className={`sheet-content sheet-${side} ${className}`}>{children}</Dialog.Content></Dialog.Portal>;
}
