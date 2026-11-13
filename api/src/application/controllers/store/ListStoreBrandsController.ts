import { Injectable } from '@kernel/decorators/Injectable';
import { Controller } from '@application/contracts/Controller';
import { ListStoreBrandsUseCase } from '@application/useCases/store/ListStoreBrandsUseCase';

import { listStoreBrandsSchema } from './schemas/listStoreBrandsSchema';

@Injectable()
export class ListStoreBrandsController extends Controller<'public', ListStoreBrandsController.Response> {
  protected override readonly routeType = 'public';

  constructor(private readonly listStoreBrandsUseCase: ListStoreBrandsUseCase) {
    super();
  }

  protected override async handle({
    queryParams,
  }: Controller.Request<'public'>): Promise<Controller.Response<ListStoreBrandsController.Response>> {
    const { limit } = this.validate(listStoreBrandsSchema, queryParams);
    const { brands } = await this.listStoreBrandsUseCase.execute({ limit });

    return { statusCode: 200, body: { brands } };
  }
}

export namespace ListStoreBrandsController {
  export type Brand = {
    slug: string;
    name: string;
    productCount: number;
    // O logo da marca.
    imageUrl: string | null;
  };

  export type Response = {
    // Da que tem mais produtos para a que tem menos. Só marcas com produto na vitrine.
    brands: Brand[];
  };
}
