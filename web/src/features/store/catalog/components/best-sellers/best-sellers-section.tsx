import { ProductCard } from '@/components/store/data-display/product-card';
import { PageContainer } from '@/components/store/layout/page-container';
import { railPageCount } from '@/features/store/catalog/model/best-sellers';
import type { ProductTab } from '@/features/store/catalog/model/types';
import type { FormAction } from '@/lib/action-result';

import { BestSellersCarousel } from './best-sellers-carousel';

type BestSellersSectionProps = {
  eyebrow: string;
  title: string;
  tabs: readonly ProductTab[];
  addToBagAction: FormAction;
};

const CARD_IMAGE_SIZES = '(min-width: 1440px) 341px, (min-width: 960px) 24vw, (min-width: 640px) 30vw, 42vw';

// O espaço entre os cards é o padding de cada item, e não gap: assim quatro itens somam a largura exata da trilha, e
// uma página anda uma largura inteira. A lista ordenada já diz a posição: o número grande é só visual.
export function BestSellersSection({ eyebrow, title, tabs, addToBagAction }: BestSellersSectionProps) {
  return (
    <section aria-labelledby="best-sellers-title">
      <PageContainer>
        <BestSellersCarousel
          titleId="best-sellers-title"
          eyebrow={eyebrow}
          title={title}
          panels={tabs.map(({ id, label, products }) => ({
            id,
            label,
            pageCount: railPageCount(products.length),
            items: products.map((product, index) => (
              <li key={product.id} className="@container flex shrink-0 basis-5/12 snap-start flex-col px-1.5 sm:basis-3/10 md:basis-1/4">
                <span aria-hidden className="text-rank block text-numeral">{index + 1}</span>
                <div className="relative flex-1">
                  <ProductCard product={product} imageSizes={CARD_IMAGE_SIZES} addToBagAction={addToBagAction} />
                </div>
              </li>
            )),
          }))}
        />
      </PageContainer>
    </section>
  );
}
