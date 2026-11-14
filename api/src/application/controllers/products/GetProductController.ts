import { Injectable } from '@kernel/decorators/Injectable';
import { Controller } from '@application/contracts/Controller';
import { GetProductUseCase } from '@application/useCases/products/GetProductUseCase';

import { productParamsSchema } from './schemas/productParamsSchema';
import type { VariantResponse } from './variantResponse';

@Injectable()
export class GetProductController extends Controller<'private', GetProductController.Response> {
  protected override readonly routeType = 'private';

  constructor(private readonly getProductUseCase: GetProductUseCase) {
    super();
  }

  protected override async handle({
    params,
  }: Controller.Request<'private'>): Promise<Controller.Response<GetProductController.Response>> {
    const { id } = this.validate(productParamsSchema, params);
    const product = await this.getProductUseCase.execute({ productId: id });

    return { statusCode: 200, body: { product: { ...product, updatedAt: product.updatedAt.toISOString() } } };
  }
}

export namespace GetProductController {
  export type Product = {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'active' | 'inactive' | 'archived';
    brandId: string;
    categoryId: string;
    // Nome comercial da cor no seletor da loja.
    colorName: string | null;
    // As outras cores do mesmo modelo, sem o próprio produto.
    colorways: {
      id: string;
      title: string;
      colorName: string | null;
      status: 'draft' | 'active' | 'inactive' | 'archived';
      coverUrl: string | null;
    }[];
    variants: VariantResponse[];
    media: { id: string; url: string }[];
    updatedAt: string;
  };

  export type Response = {
    product: Product;
  };
}
