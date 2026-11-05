import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { ProductCard } from '@/components/store/data-display/product-card';
import { PageContainer } from '@/components/store/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NEW_ARRIVALS_HREF } from '@/features/store/catalog/model/new-arrivals';
import type { NewArrivals } from '@/features/store/catalog/model/types';

type NewArrivalsSectionProps = {
  title: string;
  arrivals: NewArrivals;
};

const CARD_IMAGE_SIZES = '(min-width: 1440px) 320px, (min-width: 1100px) 23vw, 46vw';

// keepMounted: os painéis escondidos vão no HTML, para os buscadores. py-1 na lista: o contorno do foco fica fora
// do corte do overflow.
export function NewArrivalsSection({ title, arrivals }: NewArrivalsSectionProps) {
  const [firstTab] = arrivals.tabs;

  return (
    <section aria-labelledby="new-arrivals-title">
      <PageContainer className="pb-12 lg:pb-20">
        <Tabs defaultValue={firstTab?.id}>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <h2
              id="new-arrivals-title"
              className="type-display text-display-lg not-italic sm:text-display-xl lg:text-display-2xl"
            >
              {title}
            </h2>
            <TabsList
              aria-label="Filtrar por departamento"
              activateOnFocus
              className="order-last -mx-1 w-full overflow-x-auto px-1 py-1 lg:order-0 lg:ml-auto lg:w-auto"
            >
              {arrivals.tabs.map(({ id, label }) => (
                <TabsTrigger key={id} value={id}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <Link
              href={NEW_ARRIVALS_HREF}
              className="flex shrink-0 items-center gap-1.5 text-body font-bold text-ink lg:border-l lg:border-paper-line lg:pl-6"
            >
              <span className="underline decoration-2 underline-offset-4">Ver tudo</span>
              <span className="sr-only">
                {' '}
                em
                {title}
              </span>
              <span className="text-gray-600">{`(${arrivals.total})`}</span>
              <ArrowRightIcon aria-hidden className="size-4" />
            </Link>
          </div>
          {arrivals.tabs.map(({ id, products }) => (
            <TabsContent key={id} value={id} keepMounted className="mt-5 lg:mt-6">
              <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {products.map((product) => (
                  <li key={product.id}>
                    <ProductCard product={product} imageSizes={CARD_IMAGE_SIZES} />
                  </li>
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      </PageContainer>
    </section>
  );
}
