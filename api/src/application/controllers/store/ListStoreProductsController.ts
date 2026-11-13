import { Injectable } from '@kernel/decorators/Injectable';
import { Controller } from '@application/contracts/Controller';
import { ListStoreProductsUseCase } from '@application/useCases/store/ListStoreProductsUseCase';

import { listStoreProductsSchema } from './schemas/listStoreProductsSchema';

@Injectable()
export class ListStoreProductsController extends Controller<'public', ListStoreProductsController.Response> {
  protected override readonly routeType = 'public';

  constructor(private readonly listStoreProductsUseCase: ListStoreProductsUseCase) {
    super();
  }

  protected override async handle({
    queryParams,
  }: Controller.Request<'public'>): Promise<Controller.Response<ListStoreProductsController.Response>> {
    const { category, brand, size, priceAboveInCents, priceUpToInCents, sort, page, limit } = this.validate(
      listStoreProductsSchema,
      queryParams,
    );
    const { products, total, facets } = await this.listStoreProductsUseCase.execute({
      categorySlugs: category,
      brandSlugs: brand,
      sizes: size,
      priceAboveInCents: priceAboveInCents ?? null,
      priceUpToInCents: priceUpToInCents ?? null,
      sort,
      page,
      limit,
    });

    return { statusCode: 200, body: { products, total, facets } };
  }
}

export namespace ListStoreProductsController {
  export type Product = {
    id: string;
    slug: string;
    title: string;
    brandName: string;
    // A variante ativa mais barata.
    priceInCents: number;
    installments: { count: number; valueInCents: number };
    pixPriceInCents: number;
    coverUrl: string | null;
    // A segunda foto da galeria, ou null.
    hoverImageUrl: string | null;
    // Tamanhos da cor que a página do produto abre selecionada, na ordem da grade. variantId null: esgotado.
    sizeOptions: { size: string; variantId: string | null }[];
  };

  export type Response = {
    products: Product[];
    total: number;
    facets: {
      // Só tamanhos com estoque no recorte, na ordem da grade.
      sizes: { value: string; count: number }[];
      // Todas as marcas ativas, inclusive as com zero no recorte.
      brands: { slug: string; name: string; count: number }[];
    };
  };
}
