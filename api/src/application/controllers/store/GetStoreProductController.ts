import { Injectable } from '@kernel/decorators/Injectable';
import { Controller } from '@application/contracts/Controller';
import { GetStoreProductUseCase } from '@application/useCases/store/GetStoreProductUseCase';

import { storeProductParamsSchema } from './schemas/storeProductParamsSchema';

@Injectable()
export class GetStoreProductController extends Controller<'public', GetStoreProductController.Response> {
  protected override readonly routeType = 'public';

  constructor(private readonly getStoreProductUseCase: GetStoreProductUseCase) {
    super();
  }

  protected override async handle({
    params,
  }: Controller.Request<'public'>): Promise<Controller.Response<GetStoreProductController.Response>> {
    const { slug } = this.validate(storeProductParamsSchema, params);
    const product = await this.getStoreProductUseCase.execute({ slug });

    return { statusCode: 200, body: { product } };
  }
}

export namespace GetStoreProductController {
  export type Product = {
    id: string;
    slug: string;
    title: string;
    // Texto puro, com parágrafos separados por linha em branco.
    description: string;
    brandName: string;
    categorySlug: string;
    // A variante ativa mais barata.
    priceInCents: number;
    installments: { count: number; valueInCents: number };
    pixPriceInCents: number;
    // Na ordem da galeria: a primeira é a capa.
    imageUrls: string[];
    // Os tamanhos das variantes ativas, na ordem da grade.
    sizes: string[];
    // Só as ativas, por cor e na ordem da grade. color '' = variante sem cor.
    variants: { id: string; color: string; size: string; inStock: boolean }[];
    // Nome comercial da cor ("Reflective Black"). null: produto sem outras cores.
    colorName: string | null;
    // As cores do mesmo modelo que a vitrine mostra, a atual incluída, em ordem alfabética. Vazio: produto sem família.
    colorways: {
      slug: string;
      colorName: string;
      coverUrl: string | null;
      inStock: boolean;
      current: boolean;
    }[];
  };

  export type Response = {
    product: Product;
  };
}
