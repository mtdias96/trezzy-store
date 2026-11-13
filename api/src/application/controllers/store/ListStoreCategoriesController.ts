import { Injectable } from '@kernel/decorators/Injectable';
import { Controller } from '@application/contracts/Controller';
import { ListStoreCategoriesUseCase } from '@application/useCases/store/ListStoreCategoriesUseCase';

// O nome e a árvore (departamentos) da vitrine moram no front: a rota manda só o slug, a contagem e a capa.
@Injectable()
export class ListStoreCategoriesController extends Controller<'public', ListStoreCategoriesController.Response> {
  protected override readonly routeType = 'public';

  constructor(private readonly listStoreCategoriesUseCase: ListStoreCategoriesUseCase) {
    super();
  }

  protected override async handle(): Promise<Controller.Response<ListStoreCategoriesController.Response>> {
    const { categories } = await this.listStoreCategoriesUseCase.execute();

    return { statusCode: 200, body: { categories } };
  }
}

export namespace ListStoreCategoriesController {
  export type Category = {
    slug: string;
    productCount: number;
    // Capa do produto mais novo da categoria.
    coverUrl: string | null;
  };

  export type Response = {
    categories: Category[];
  };
}
