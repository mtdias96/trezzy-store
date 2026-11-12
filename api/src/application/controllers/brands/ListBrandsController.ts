import { Injectable } from '@kernel/decorators/Injectable';
import { Controller } from '@application/contracts/Controller';
import { ListBrandsUseCase } from '@application/useCases/brands/ListBrandsUseCase';

@Injectable()
export class ListBrandsController extends Controller<'private', ListBrandsController.Response> {
  protected override readonly routeType = 'private';

  constructor(private readonly listBrandsUseCase: ListBrandsUseCase) {
    super();
  }

  protected override async handle(): Promise<Controller.Response<ListBrandsController.Response>> {
    const { brands } = await this.listBrandsUseCase.execute();

    return { statusCode: 200, body: { brands } };
  }
}

export namespace ListBrandsController {
  export type Brand = {
    id: string;
    name: string;
    active: boolean;
  };

  export type Response = {
    brands: Brand[];
  };
}
