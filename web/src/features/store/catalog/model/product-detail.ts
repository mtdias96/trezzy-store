import type { Route } from 'next';

import type { ProductDetail, SizeOption } from './types';

const META_DESCRIPTION_LENGTH = 160;

// O typedRoutes recusa barra no slug (SafeSlug) e não prova isso numa string qualquer; o schema da API já só aceita
// minúsculas, números e hífen.
export function productHref(slug: string): Route {
  return `/produtos/${slug}` as Route;
}

export function sizeOptions({ sizes, variants }: ProductDetail, colorId: string | null): SizeOption[] {
  return sizes.map((size) => {
    const variant = variants.find((item) => item.colorId === colorId && item.size === size && item.inStock);

    return { size, variantId: variant?.id ?? null };
  });
}

export function initialColorId({ colors, variants }: ProductDetail): string | null {
  const inStock = colors.find(({ id }) => variants.some((variant) => variant.colorId === id && variant.inStock));

  return (inStock ?? colors[0])?.id ?? null;
}

export function isSoldOut({ variants }: ProductDetail): boolean {
  return !variants.some(({ inStock }) => inStock);
}

export function metaDescription({ description, name }: ProductDetail): string {
  const text = description[0] ?? name;

  if (text.length <= META_DESCRIPTION_LENGTH) {
    return text;
  }

  return `${text.slice(0, text.lastIndexOf(' ', META_DESCRIPTION_LENGTH - 1))}…`;
}

const isAbsoluteUrl = (url: string) => /^https?:\/\//.test(url);

// Fotos só com URL absoluta: o Google ignora as relativas.
export function productJsonLd(product: ProductDetail): Record<string, unknown> {
  const images = product.images.map(({ url }) => url).filter(isAbsoluteUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description.join(' '),
    brand: { '@type': 'Brand', name: product.brand },
    ...(images.length > 0 ? { image: images } : {}),
    ...(product.rating !== null && product.reviewCount > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewCount } }
      : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: (product.priceInCents / 100).toFixed(2),
      itemCondition: 'https://schema.org/NewCondition',
      availability: isSoldOut(product) ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
  };
}
