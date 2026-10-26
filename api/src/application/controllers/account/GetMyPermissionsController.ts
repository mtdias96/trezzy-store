import { Injectable } from '@kernel/decorators/Injectable';
import type { Permission } from '@application/authorization/Permission';
import { Controller } from '@application/contracts/Controller';

// Sem use case: as permissões já chegam resolvidas pelo adapter (as mesmas que ele usa para barrar as rotas).
// O front monta o menu do painel por elas; quem protege de fato é a rota.
@Injectable()
export class GetMyPermissionsController extends Controller<'private', GetMyPermissionsController.Response> {
  protected override readonly routeType = 'private';

  protected override async handle({
    permissions,
  }: Controller.Request<'private'>): Promise<Controller.Response<GetMyPermissionsController.Response>> {
    return { statusCode: 200, body: { permissions } };
  }
}

export namespace GetMyPermissionsController {
  export type Response = { permissions: readonly Permission[] };
}
