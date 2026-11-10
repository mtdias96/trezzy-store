import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { ProductCard } from '@/components/store/data-display/product-card';
import { PageContainer } from '@/components/store/layout/page-container';
import { SectionHeading } from '@/components/store/layout/section-heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NEW_ARRIVALS_HREF } from '@/features/store/catalog/model/new-arrivals';
import type { ProductTabs } from '@/features/store/catalog/model/types';
import type { FormAction } from '@/lib/action-result';

type NewArrivalsSectionProps = {
  eyebrow: string;
  title: string;
  arrivals: ProductTabs;
  addToBagAction: FormAction;
};

const CARD_IMAGE_SIZES = '(min-width: 1440px) 266px, (min-width: 960px) 18vw, (min-width: 640px) 23vw, 46vw';

// py-1 na lista: o contorno do foco fica fora do corte do overflow.
export function NewArrivalsSection({ eyebrow, title, arrivals, addToBagAction }: NewArrivalsSectionProps) {
  const [firstTab] = arrivals.tabs;

  return (
    <section aria-labelledby="new-arrivals-title">
      <PageContainer>
        <Tabs defaultValue={firstTab?.id}>
          <SectionHeading
            id="new-arrivals-title"
            eyebrow={eyebrow}
            title={title}
            actions={(
              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3">
                <TabsList aria-label="Filtrar por departamento" activateOnFocus className="-mx-1 w-full gap-1.5 overflow-x-auto px-1 py-1 md:w-auto">
                  {arrivals.tabs.map(({ id, label }) => (
                    <TabsTrigger key={id} value={id}>
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <Link
                  href={NEW_ARRIVALS_HREF}
                  className="flex h-6 shrink-0 items-center gap-1.5 text-body font-bold text-ink md:border-l md:border-line md:pl-4.5"
                >
                  <span className="underline decoration-2 underline-offset-4">Ver tudo</span>
                  <span className="sr-only">{` em ${title}`}</span>
                  <span className="font-normal text-gray-700 underline decoration-2 underline-offset-4">{`(${arrivals.total})`}</span>
                  <ArrowRightIcon aria-hidden className="size-4" />
                </Link>
              </div>
            )}
          />
          <div className="mt-5 lg:mt-8">
            {arrivals.tabs.map(({ id, products }) => (
              <TabsContent key={id} value={id}>
                <ul className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-4 md:grid-cols-5 lg:gap-y-9">
                  {products.map((product) => (
                    <li key={product.id}>
                      <ProductCard product={product} imageSizes={CARD_IMAGE_SIZES} addToBagAction={addToBagAction} />
                    </li>
                  ))}
                </ul>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </PageContainer>
    </section>
  );
}
