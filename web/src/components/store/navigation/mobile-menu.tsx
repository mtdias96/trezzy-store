'use client';

import { type MouseEvent, type ReactNode, useState } from 'react';
import { MenuIcon } from 'lucide-react';

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type MobileMenuProps = {
  label: string;
  children: ReactNode;
};

export function MobileMenu({ label, children }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  // O layout continua montado na navegação: sem fechar ao seguir um link, a gaveta ficaria sobre a página nova.
  const closeOnLink = (event: MouseEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Abrir menu"
        className="flex size-11 shrink-0 items-center justify-center rounded-pill transition-colors duration-base hover:bg-ink-soft"
      >
        <MenuIcon aria-hidden className="size-6" />
      </SheetTrigger>
      <SheetContent side="left" className="gap-0 overflow-y-auto" onClick={closeOnLink}>
        <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
          {/* O tamanho vai no span: o SheetTitle passa a classe pelo cn, que descartaria o text-display-sm. */}
          <SheetTitle className="type-display">
            <span className="text-display-sm">Menu</span>
          </SheetTitle>
        </div>
        <nav aria-label={label}>{children}</nav>
      </SheetContent>
    </Sheet>
  );
}
