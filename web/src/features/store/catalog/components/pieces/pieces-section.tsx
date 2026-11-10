import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { PageContainer } from '@/components/store/layout/page-container';
import { productCountLabel } from '@/features/store/catalog/model/departments';
import { OUTLET_HREF } from '@/features/store/catalog/model/outlet';
import type { PieceShortcut } from '@/features/store/catalog/model/types';

import { PieceTile } from './piece-tile';

type PiecesSectionProps = {
  title: string;
  pieces: readonly PieceShortcut[];
  outletDiscountPercent: number | null;
};

// Celular: 3 × 3, com as nove peças à vista. Tablet: 5 + 4, e o Outlet ocupa a vaga que sobraria. Desktop: uma linha,
// que divide a largura entre as peças que vierem.
export function PiecesSection({ title, pieces, outletDiscountPercent }: PiecesSectionProps) {
  return (
    <section aria-labelledby="pieces-title">
      <PageContainer>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2 id="pieces-title" className="text-subtitle font-bold text-ink">{title}</h2>
          {outletDiscountPercent === null
            ? null
            : (
                <Link
                  href={OUTLET_HREF}
                  className="group flex h-ctl-sm items-center gap-2 rounded-pill bg-surface pr-1.5 pl-3 text-chip text-ink"
                >
                  <span>Até</span>
                  {' '}
                  <span className="font-bold text-brand">{`${outletDiscountPercent}% off`}</span>
                  {' '}
                  <span>no outlet</span>
                  <span aria-hidden className="-ml-px flex size-6 items-center justify-center rounded-pill bg-ink text-gray-0">
                    <ArrowRightIcon className="size-3 transition-transform duration-slow ease-out group-hover:translate-x-0.5" />
                  </span>
                </Link>
              )}
        </div>
        <ul className="@container mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
          {pieces.map(({ name, icon, href, productCount }) => (
            <li key={href}>
              <PieceTile href={href} name={name} detail={productCountLabel(productCount)} icon={icon} />
            </li>
          ))}
          {outletDiscountPercent === null
            ? null
            : (
                <li className="sm:col-span-2 lg:col-span-1">
                  <PieceTile href={OUTLET_HREF} name="Outlet" detail={`até ${outletDiscountPercent}% off`} icon="tag" tone="outlet" />
                </li>
              )}
        </ul>
      </PageContainer>
    </section>
  );
}
