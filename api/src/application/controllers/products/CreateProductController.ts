import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';
import { Controller } from '@application/contracts/Controller';
import { CreateProductUseCase } from '@application/useCases/products/CreateProductUseCase';

import { type CreateProductBody, createProductSchema } from './schemas/createProductSchema';

@Injectable()
@Schema(createProductSchema)
export class CreateProductController extends Controller<'private', CreateProductController.Response> {
  protected override readonly routeType = 'private';

  constructor(private readonly createProductUseCase: CreateProductUseCase) {
    super();
  }

  protected override async handle({
    body,
  }: Controller.Request<'private', CreateProductBody>): Promise<Controller.Response<CreateProductController.Response>> {
    const { title, description, status, brandId, categoryId, colorName, familyOf, variants, mediaIds } = body;

    const { id } = await this.createProductUseCase.execute({
      title,
      description,
      status,
      brandId,
      categoryId,
      colorName,
      familyOf,
      variants: variants.map(({ size, color, sku, priceInCents, stock, active }) => ({
        size,
        color,
        sku,
        priceInCents,
        stock,
        active,
      })),
      mediaIds,
    });

    return { statusCode: 201, body: { id } };
  }
}

export namespace CreateProductController {
  export type Response = {
    id: string;
  };
}
