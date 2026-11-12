import { Injectable } from '@kernel/decorators/Injectable';
import { Controller } from '@application/contracts/Controller';
import { ListProductsUseCase } from '@application/useCases/products/ListProductsUseCase';

import type { VariantResponse } from './variantResponse';

@Injectable()
export class ListProductsController extends Controller<'private', ListProductsController.Response> {
  protected override readonly routeType = 'private';

  constructor(private readonly listProductsUseCase: ListProductsUseCase) {
    super();
  }

  protected override async handle(): Promise<Controller.Response<ListProductsController.Response>> {
    const { products } = await this.listProductsUseCase.execute();

    return {
      statusCode: 200,
      body: { products: products.map(({ updatedAt, ...product }) => ({ ...product, updatedAt: updatedAt.toISOString() })) },
    };
  }
}

export namespace ListProductsController {
  export type Product = {
    id: string;
    title: string;
    status: 'draft' | 'active' | 'inactive' | 'archived';
    brandId: string;
    categoryId: string;
    coverUrl: string | null;
    variants: VariantResponse[];
    updatedAt: string;
  };

  export type Response = {
    products: Product[];
  };
}
