'use client';

import { type MouseEvent, type ReactNode, useState } from 'react';
import { SlidersHorizontalIcon } from 'lucide-react';

import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type FilterSheetProps = {
  triggerLabel: string;
  activeCount: number;
  doneLabel: string;
  children: ReactNode;
};

// Os filtros do celular, numa gaveta. Eles já valem ao marcar: o botão do rodapé só fecha, com o total da lista.
export function FilterSheet({ triggerLabel, activeCount, doneLabel, children }: FilterSheetProps) {
  const [open, setOpen] = useState(false);

  // Link dentro da gaveta (outro departamento) troca de página, e o layout continua montado: sem fechar, a gaveta
  // ficaria sobre a página nova.
  const closeOnLink = (event: MouseEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* aria-label com o total por extenso: um span sr-only perderia o espaço antes do texto ("1filtro ativo"). */}
      <SheetTrigger
        aria-label={activeCount > 0 ? `${triggerLabel}, ${activeCount} ${activeCount === 1 ? 'filtro ativo' : 'filtros ativos'}` : undefined}
        className="flex h-ctl-lg items-center gap-2 rounded-xl border border-paper-line bg-gray-0 px-4 text-body font-bold text-ink transition-colors duration-base hover:border-ink"
      >
        <SlidersHorizontalIcon aria-hidden className="size-4" />
        {triggerLabel}
        {activeCount > 0
          ? (
              <span className="flex min-w-5 items-center justify-center rounded-pill bg-ink px-1.5 py-1 text-micro text-gray-0 tabular-nums">
                {activeCount}
              </span>
            )
          : null}
      </SheetTrigger>
      <SheetContent side="left" className="gap-0" onClick={closeOnLink}>
        <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
          {/* O tamanho vai no span: o SheetTitle passa a classe pelo cn, que descartaria o text-display-sm. */}
          <SheetTitle className="type-display">
            <span className="text-display-sm">{triggerLabel}</span>
          </SheetTitle>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-5">{children}</div>
        <div className="border-t border-border p-4">
          <SheetClose className="flex h-cta w-full items-center justify-center rounded-pill bg-ink px-6 text-body font-extrabold text-gray-0 uppercase transition-colors duration-base hover:bg-ink-soft">
            {doneLabel}
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
