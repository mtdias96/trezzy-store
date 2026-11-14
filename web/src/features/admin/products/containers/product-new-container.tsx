import { getProduct, listBrands, listCategories, listColorwayCandidates } from '@/features/admin/products/data/queries';

import { ProductFormContainer } from './product-form-container';

type ProductNewContainerProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// ?modelo={id}: "Cadastrar outra cor" desse produto. Id que não existe abre o cadastro vazio.
export async function ProductNewContainer({ searchParams }: ProductNewContainerProps) {
  const { modelo } = await searchParams;
  const [brands, categories, colorwayCandidates, modelOf] = await Promise.all([
    listBrands(),
    listCategories(),
    listColorwayCandidates(),
    typeof modelo === 'string' && modelo !== '' ? getProduct(modelo) : null,
  ]);

  return (
    <ProductFormContainer
      key={modelOf?.id ?? 'novo'}
      modelOf={modelOf ?? undefined}
      brands={brands}
      categories={categories}
      colorwayCandidates={colorwayCandidates}
    />
  );
}
