import { PageContainer } from '@/components/store/layout/page-container';

const CARDS = 6;

export function CatalogCountSkeleton() {
  return <div className="h-5 w-20 animate-skeleton rounded-md bg-paper-stone" />;
}

// No formato da lista de verdade (toolbar, painel no lg e cards 4:5): nada pula quando ela chega.
export function CatalogResultsSkeleton() {
  return (
    <div role="status" className="mt-6 lg:mt-8">
      <span className="sr-only">Carregando produtos…</span>
      <div className="flex justify-between lg:justify-end">
        <div className="h-ctl-lg w-28 animate-skeleton rounded-xl bg-paper-stone lg:hidden" />
        <div className="h-ctl-lg w-48 animate-skeleton rounded-xl bg-paper-stone" />
      </div>
      <div className="mt-4 flex items-start gap-6 lg:mt-5">
        <div className="hidden h-120 w-68 shrink-0 animate-skeleton rounded-card bg-paper-stone lg:block" />
        <ul className="grid min-w-0 flex-1 grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
          {Array.from({ length: CARDS }, (_, index) => (
            <li key={index} className="flex flex-col gap-3 rounded-card border border-paper-line bg-gray-0 p-1.5 pb-4">
              <div className="aspect-4/5 animate-skeleton rounded-2xl bg-paper-stone" />
              <div className="mx-2 h-3 w-1/3 animate-skeleton rounded-md bg-paper-stone" />
              <div className="mx-2 h-4 w-3/4 animate-skeleton rounded-md bg-paper-stone" />
              <div className="mx-2 h-5 w-1/2 animate-skeleton rounded-md bg-paper-stone" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Fallback da página enquanto o departamento da URL não é conhecido (o App Shell da rota).
export function CatalogPageSkeleton() {
  return (
    <PageContainer className="pt-4 pb-16 lg:pt-6 lg:pb-24">
      <div className="h-5 w-40 animate-skeleton rounded-md bg-paper-stone" />
      <div className="mt-3 h-10 w-2/3 animate-skeleton rounded-md bg-paper-stone lg:mt-4 lg:h-14 lg:w-1/3" />
      <div className="mt-5 flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-ctl-lg w-24 shrink-0 animate-skeleton rounded-pill bg-paper-stone lg:h-ctl" />
        ))}
      </div>
      <CatalogResultsSkeleton />
    </PageContainer>
  );
}
