import { Suspense } from 'react';
import type { Metadata } from 'next';

import { addToBag } from '@/features/store/cart/data/actions';
import { ProductDetailSkeleton } from '@/features/store/catalog/components/product/product-detail-skeleton';
import { ProductDetailContainer } from '@/features/store/catalog/containers/product-detail-container';
import { getProduct } from '@/features/store/catalog/data/queries';
import { metaDescription } from '@/features/store/catalog/model/product-detail';
import { estimateShipping } from '@/features/store/shipping/data/actions';

export async function generateMetadata({ params }: PageProps<'/produtos/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Produto não encontrado' };
  }

  const description = metaDescription(product);
  const images = product.images.map(({ url, alt }) => ({ url, alt }));

  return {
    title: product.name,
    description,
    openGraph: { title: product.name, description, images, type: 'website' },
  };
}

// Slug inexistente responde 200 com noindex: o streaming já começou quando o notFound() roda. Um 404 de verdade
// pediria checar o slug no proxy, que não chama a API (web/AGENTS.md, Pendências).
export default function Page({ params }: PageProps<'/produtos/[slug]'>) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      {params.then(({ slug }) => (
        <ProductDetailContainer slug={slug} addToBagAction={addToBag} estimateShippingAction={estimateShipping} />
      ))}
    </Suspense>
  );
}
