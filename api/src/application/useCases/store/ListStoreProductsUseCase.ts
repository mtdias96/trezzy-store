import { Injectable } from '@kernel/decorators/Injectable';
import { compareSizes, sizeOptions, type Storefront, storePricing } from '@application/entities/storefront';
import { ProductRepository } from '@infra/database/repositories/ProductRepository';
import { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

const byName = new Intl.Collator('pt-BR', { sensitivity: 'base' });

// Sem busca e sem pedidos ainda: relevância e mais vendidos ordenam como os mais novos.
const ORDER_BY_SORT = {
  relevance: 'newest',
  newest: 'newest',
  'best-selling': 'newest',
  'price-asc': 'price-asc',
  'price-desc': 'price-desc',
} satisfies Record<ListStoreProductsUseCase.Sort, ProductRepository.StorefrontOrder>;

@Injectable()
export class ListStoreProductsUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly mediaStorageGateway: MediaStorageGateway,
  ) {}

  async execute({ sort, ...query }: ListStoreProductsUseCase.Input): Promise<ListStoreProductsUseCase.Output> {
    const { products, total, facets } = await this.productRepository.findStorefrontPage({ ...query, order: ORDER_BY_SORT[sort] });

    const sizes = facets.sizes.sort((a, b) => compareSizes(a.value, b.value));
    const brands = facets.brands.sort((a, b) => byName.compare(a.name, b.name));

    return { products: products.map((product) => this.toCard(product)), total, facets: { sizes, brands } };
  }

  private toCard(product: ProductRepository.StorefrontItem): ListStoreProductsUseCase.Product {
    const { id, slug, title, brandName, grid, priceInCents, variants, mediaKeys } = product;
    const [coverKey, hoverKey] = mediaKeys;

    return {
      id,
      slug,
      title,
      brandName,
      priceInCents,
      ...storePricing(priceInCents),
      coverUrl: coverKey ? this.mediaStorageGateway.getPublicUrl(coverKey) : null,
      hoverImageUrl: hoverKey ? this.mediaStorageGateway.getPublicUrl(hoverKey) : null,
      sizeOptions: sizeOptions(grid, variants),
    };
  }
}

export namespace ListStoreProductsUseCase {
  export type Sort = 'relevance' | 'newest' | 'best-selling' | 'price-asc' | 'price-desc';

  export type Input = Omit<ProductRepository.StorefrontQuery, 'order'> & { sort: Sort };

  export type Product = Storefront.Pricing & {
    id: string;
    slug: string;
    title: string;
    brandName: string;
    priceInCents: number;
    coverUrl: string | null;
    hoverImageUrl: string | null;
    sizeOptions: Storefront.SizeOption[];
  };

  export type Output = {
    products: Product[];
    total: number;
    facets: {
      sizes: { value: string; count: number }[];
      brands: { slug: string; name: string; count: number }[];
    };
  };
}
