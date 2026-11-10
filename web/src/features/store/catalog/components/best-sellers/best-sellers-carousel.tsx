'use client';

import { type ReactNode, type UIEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';

import { SectionHeading } from '@/components/store/layout/section-heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BEST_SELLERS_HREF, railPage, railPageLabel } from '@/features/store/catalog/model/best-sellers';

export type BestSellersPanel = {
  id: string;
  label: string;
  pageCount: number;
  items: ReactNode;
};

type BestSellersCarouselProps = {
  titleId: string;
  eyebrow: string;
  title: string;
  panels: readonly BestSellersPanel[];
};

const PAGER_BUTTON = 'flex items-center justify-center transition-colors duration-base focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand';

// A posição vem da rolagem, e não do clique: assim o contador acompanha o gesto no trackpad e o foco do teclado.
// O <Activity> do Next guarda o estado ao sair da página, mas a rolagem se perde: ao voltar, a trilha é reposta.
// Abaixo do md os cards são arrastados, e a trilha encosta na borda da tela para o próximo card aparecer cortado.
export function BestSellersCarousel({ titleId, eyebrow, title, panels }: BestSellersCarouselProps) {
  const railRef = useRef<HTMLOListElement>(null);
  const scrollLeft = useRef(0);
  const [view, setView] = useState({ panelId: panels[0]?.id, page: 0 });
  const pageCount = panels.find(({ id }) => id === view.panelId)?.pageCount ?? 1;

  useEffect(() => {
    railRef.current?.scrollTo({ left: scrollLeft.current, behavior: 'instant' });
  }, []);

  const changePanel = (panelId: string) => {
    scrollLeft.current = 0;
    setView({ panelId, page: 0 });
  };

  const goToPage = (page: number) => {
    const rail = railRef.current;

    rail?.scrollTo({ left: page * rail.clientWidth });
  };

  const onRailScroll = ({ currentTarget }: UIEvent<HTMLOListElement>) => {
    const page = railPage(currentTarget, pageCount);

    scrollLeft.current = currentTarget.scrollLeft;
    setView((current) => (current.page === page ? current : { ...current, page }));
  };

  return (
    <Tabs value={view.panelId} onValueChange={changePanel}>
      <SectionHeading
        id={titleId}
        eyebrow={eyebrow}
        title={title}
        filters={(
          <TabsList aria-label="Filtrar por departamento" activateOnFocus className="-m-1 scrollbar-none gap-1.5 overflow-x-auto p-1">
            {panels.map(({ id, label }) => (
              <TabsTrigger key={id} value={id} size="sm">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        )}
        actions={(
          <div className="flex shrink-0 items-center gap-3.5">
            <Link href={BEST_SELLERS_HREF} className="flex h-6 items-center text-body font-bold text-ink underline decoration-1 underline-offset-4">
              Ver todos
              <span className="sr-only">{` em ${title}`}</span>
            </Link>
            <div role="group" aria-label={`Páginas de ${title}`} className="hidden h-12.5 overflow-hidden rounded-xl border border-line md:flex sm:pointer-fine:flex">
              <button
                type="button"
                aria-label="Página anterior"
                disabled={view.page === 0}
                onClick={() => goToPage(view.page - 1)}
                className={`${PAGER_BUTTON} w-13 border-r border-surface text-ink hover:bg-surface disabled:text-disabled disabled:hover:bg-transparent`}
              >
                <ArrowLeftIcon aria-hidden className="size-4.5" />
              </button>
              <p aria-live="polite" className="flex w-16.25 items-center justify-center text-body font-bold tracking-tight text-ink">
                <span aria-hidden>{railPageLabel(view.page, pageCount)}</span>
                <span className="sr-only">{`Página ${view.page + 1} de ${pageCount}`}</span>
              </p>
              <button
                type="button"
                aria-label="Próxima página"
                disabled={view.page >= pageCount - 1}
                onClick={() => goToPage(view.page + 1)}
                className={`${PAGER_BUTTON} w-13.25 bg-ink text-gray-0 hover:bg-ink-soft disabled:bg-gray-0 disabled:text-disabled`}
              >
                <ArrowRightIcon aria-hidden className="size-4.5" />
              </button>
            </div>
          </div>
        )}
      />
      {panels.map(({ id, items }) => (
        <TabsContent key={id} value={id} className="mt-4.5">
          <ol
            ref={railRef}
            onScroll={onRailScroll}
            className="-mx-4 scrollbar-none flex snap-x snap-mandatory scroll-px-2.5 overflow-x-auto overscroll-x-contain px-2.5 pb-1 motion-safe:scroll-smooth sm:-mx-6 sm:scroll-px-4.5 sm:px-4.5 md:-mx-1.5 md:scroll-px-0 md:px-0 lg:-mr-5.75 lg:-ml-3.25"
          >
            {items}
          </ol>
        </TabsContent>
      ))}
    </Tabs>
  );
}
