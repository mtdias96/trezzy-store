import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';
import { Controller } from '@application/contracts/Controller';
import { SetProductColorwayUseCase } from '@application/useCases/products/SetProductColorwayUseCase';

import { productParamsSchema } from './schemas/productParamsSchema';
import { type SetProductColorwayBody, setProductColorwaySchema } from './schemas/setProductColorwaySchema';

// Liga, troca ou desliga a família de cores e grava o nome da cor. Rota própria: funciona sem a edição do produto.
@Injectable()
@Schema(setProductColorwaySchema)
export class SetProductColorwayController extends Controller<'private'> {
  protected override readonly routeType = 'private';

  constructor(private readonly setProductColorwayUseCase: SetProductColorwayUseCase) {
    super();
  }

  protected override async handle({
    params,
    body,
  }: Controller.Request<'private', SetProductColorwayBody>): Promise<Controller.Response> {
    const { id } = this.validate(productParamsSchema, params);
    const { colorName, familyOf } = body;

    await this.setProductColorwayUseCase.execute({ productId: id, colorName, familyOf });

    return { statusCode: 204 };
  }
}
