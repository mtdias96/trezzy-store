import type { ReactNode } from 'react';

import { PageContainer } from '@/components/store/layout/page-container';
import { PillNav } from '@/components/store/navigation/pill-nav';
import type { CatalogScope } from '@/features/store/catalog/model/scope';

import { CatalogHeading } from './catalog-heading';

type CatalogViewProps = {
  scope: CatalogScope;
  count: ReactNode;
  children: ReactNode;
};

// O topo só depende da página (departamento e categoria): entra no HTML estático. O count e a lista dependem dos
// filtros da URL e chegam em streaming.
export function CatalogView({ scope, count, children }: CatalogViewProps) {
  return (
    <PageContainer className="pt-4 pb-16 lg:pt-6 lg:pb-24">
      <CatalogHeading scope={scope} count={count} />
      <div className="mt-4 lg:mt-5">
        <PillNav label={scope.tabsLabel} items={scope.tabs} />
      </div>
      {children}
    </PageContainer>
  );
}
