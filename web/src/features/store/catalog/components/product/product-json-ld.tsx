import { productJsonLd } from '@/features/store/catalog/model/product-detail';
import type { ProductDetail } from '@/features/store/catalog/model/types';

type ProductJsonLdProps = {
  product: ProductDetail;
};

// O "<" vira <: texto vindo da API não fecha a tag <script> nem injeta HTML (guia de JSON-LD do Next).
export function ProductJsonLd({ product }: ProductJsonLdProps) {
  return (
    <script
      type="application/ld+json"

      dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)).replace(/</g, '\\u003c') }}
    />
  );
}
