import type { Metadata } from 'next';

import { addToBag } from '@/features/store/cart/data/actions';
import { CatalogContainer } from '@/features/store/catalog/containers/catalog-container';
import { allProductsScope } from '@/features/store/catalog/model/scope';

const scope = allProductsScope();

export const metadata: Metadata = {
  title: scope.metaTitle,
  description: scope.description,
};

export default function Page({ searchParams }: PageProps<'/produtos'>) {
  return <CatalogContainer scope={scope} searchParams={searchParams} addToBagAction={addToBag} />;
}
