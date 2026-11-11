import type { ReactNode } from 'react';

import { Breadcrumb } from '@/components/store/navigation/breadcrumb';
import type { CatalogScope } from '@/features/store/catalog/model/scope';

type CatalogHeadingProps = {
  scope: Pick<CatalogScope, 'title' | 'trail'>;
  count: ReactNode;
};

// break-words: uma palavra longa no display (125% de largura) não estoura os 320px.
export function CatalogHeading({ scope, count }: CatalogHeadingProps) {
  return (
    <>
      <Breadcrumb trail={scope.trail} current={scope.title} />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-1 lg:mt-4">
        <h1 className="min-w-0 type-display text-display-lg break-words not-italic sm:text-display-xl lg:text-display-2xl">
          {scope.title}
        </h1>
        <div className="pb-1">{count}</div>
      </div>
    </>
  );
}
