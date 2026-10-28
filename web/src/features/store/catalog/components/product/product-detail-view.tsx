import type { ReactNode } from 'react';

import { PageContainer } from '@/components/store/layout/page-container';
import { Breadcrumb } from '@/components/store/navigation/breadcrumb';
import type { ProductDetail } from '@/features/store/catalog/model/types';

import { ProductGallery } from './product-gallery';
import { ProductInfoTabs } from './product-info-tabs';
import { ProductJsonLd } from './product-json-ld';
import { ProductSummary } from './product-summary';

type ProductDetailViewProps = {
  product: ProductDetail;
  sizeChart: ReactNode;
  purchase: ReactNode;
  shipping: ReactNode;
  reviews: ReactNode;
};

export function ProductDetailView({ product, sizeChart, purchase, shipping, reviews }: ProductDetailViewProps) {
  const trail = [
    { name: 'Home', href: '/' as const },
    product.department,
    ...(product.category ? [product.category] : []),
  ];

  return (
    <PageContainer className="pt-4 pb-16 lg:pt-6 lg:pb-24">
      <Breadcrumb trail={trail} current={product.name} />
      <div className="mt-4 grid gap-6 lg:mt-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} />
        </div>
        <div className="flex flex-col gap-7 lg:col-span-5">
          <ProductSummary product={product} />
          {purchase}
          {shipping}
          <ProductInfoTabs product={product} sizeChart={sizeChart} />
        </div>
      </div>
      <div className="mt-12 lg:mt-20">{reviews}</div>
      <ProductJsonLd product={product} />
    </PageContainer>
  );
}
