import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { PageContainer } from '@/components/store/layout/page-container';
import { SectionHeading } from '@/components/store/layout/section-heading';
import { OUTLET_HREF } from '@/features/store/catalog/model/outlet';
import type { OutletShowcase } from '@/features/store/catalog/model/types';

import { OutletTile } from './outlet-tile';

type OutletSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  showcase: OutletShowcase;
};

const WIDE_TILE_SIZES = '(min-width: 1440px) 698px, (min-width: 960px) 49vw, 92vw';
const NARROW_TILE_SIZES = '(min-width: 1440px) 343px, (min-width: 960px) 24vw, 46vw';
const NARROW_ON_DESKTOP_TILE_SIZES = '(min-width: 1440px) 343px, (min-width: 960px) 24vw, 92vw';

// Celular: a primeira e a última peças na largura toda, e as outras duas lado a lado. A partir do md, na ordem das
// peças: a grande, a de cima do meio, a alta da direita e a de baixo do meio, que o grid encaixa no vão que sobra.
// A grande define a altura do mosaico, e as outras esticam.
const TILE_SLOTS = [
  { placement: 'col-span-2 aspect-4/3 md:col-span-6 md:row-span-2 md:aspect-8/7', imageSizes: WIDE_TILE_SIZES },
  { placement: 'aspect-4/5 md:col-span-3 md:aspect-auto', imageSizes: NARROW_TILE_SIZES },
  { placement: 'aspect-4/5 md:col-span-3 md:row-span-2 md:aspect-auto', imageSizes: NARROW_TILE_SIZES },
  { placement: 'col-span-2 aspect-4/3 md:col-span-3 md:aspect-auto', imageSizes: NARROW_ON_DESKTOP_TILE_SIZES },
] as const;

export function OutletSection({ eyebrow, title, description, showcase }: OutletSectionProps) {
  return (
    <section aria-labelledby="outlet-title">
      <PageContainer>
        <SectionHeading
          id="outlet-title"
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={(
            <div className="flex items-center gap-4 md:shrink-0">
              <p className="flex shrink-0 flex-col gap-0.5">
                <span className="text-body-sm text-gray-700">Nesta seleção</span>
                <span className="text-title font-extrabold tracking-normal text-ink">{`Até ${showcase.topDiscountPercent}% off`}</span>
              </p>
              <Link
                href={OUTLET_HREF}
                className="flex h-13 flex-1 items-center justify-between gap-3 rounded-xl bg-ink px-4.5 text-body-lg font-bold text-gray-0 md:w-50 md:flex-none"
              >
                Ver outlet
                <ArrowRightIcon aria-hidden className="size-4" />
              </Link>
            </div>
          )}
        />
        <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-12 lg:-mx-4 lg:mt-8">
          {TILE_SLOTS.map(({ placement, imageSizes }, index) => {
            const product = showcase.products[index];

            return product
              ? (
                  <li key={product.id} className={placement}>
                    <OutletTile product={product} imageSizes={imageSizes} />
                  </li>
                )
              : null;
          })}
        </ul>
      </PageContainer>
    </section>
  );
}
