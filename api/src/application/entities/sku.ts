import { slugify } from '@shared/utils/slugify';

// CAM-3F9A2C-M-PRETO. Usa o id, não o título: o SKU não pode mudar quando o título muda.
export function generateSku({ categorySlug, productId, size, color }: GenerateSkuInput): string {
  const category = categorySlug.replace(/-/g, '').slice(0, 3);
  const product = productId.replace(/-/g, '').slice(0, 6);

  return [category, product, size, slugify(color)]
    .filter(Boolean)
    .join('-')
    .toUpperCase();
}

type GenerateSkuInput = {
  categorySlug: string;
  productId: string;
  size: string;
  color: string;
};
