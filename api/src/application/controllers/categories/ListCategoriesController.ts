import { Injectable } from '@kernel/decorators/Injectable';
import { Controller } from '@application/contracts/Controller';
import { ListCategoriesUseCase } from '@application/useCases/categories/ListCategoriesUseCase';

@Injectable()
export class ListCategoriesController extends Controller<'private', ListCategoriesController.Response> {
  protected override readonly routeType = 'private';

  constructor(private readonly listCategoriesUseCase: ListCategoriesUseCase) {
    super();
  }

  protected override async handle(): Promise<Controller.Response<ListCategoriesController.Response>> {
    const { categories } = await this.listCategoriesUseCase.execute();

    return { statusCode: 200, body: { categories } };
  }
}

export namespace ListCategoriesController {
  export type Category = {
    id: string;
    name: string;
    grid: 'num' | 'apparel' | 'one';
    active: boolean;
  };

  export type Response = {
    categories: Category[];
  };
}
