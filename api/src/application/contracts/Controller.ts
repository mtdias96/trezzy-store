import { getSchema } from '@kernel/decorators/Schema.js';

export type RouteType = 'public' | 'private';

export interface IController<TResponseBody = unknown> {
  execute(
    request: Controller.ExecuteRequest,
  ): Promise<Controller.Response<TResponseBody>>;
}

export abstract class Controller<
  TRouteType extends RouteType = 'public',
  TResponseBody = undefined,
> implements IController<TResponseBody> {
  protected abstract handle(
    request: Controller.Request<TRouteType, never>,
  ): Promise<Controller.Response<TResponseBody>>;

  public execute(
    request: Controller.ExecuteRequest,
  ): Promise<Controller.Response<TResponseBody>> {
    const body = this.validateBody(request.body);

    return this.handle({
      ...request,
      body,
    } as unknown as Controller.Request<TRouteType, never>);
  }

  private validateBody(body: unknown) {
    const schema = getSchema(this);

    if (!schema) {
      return body;
    }

    return schema.parse(body);
  }
}

export namespace Controller {
  export type ExecuteRequest = {
    body: unknown;
    headers: Record<string, string | undefined>;
    params: Record<string, string>;
    queryParams: Record<string, string>;
    accountId?: string;
  };

  type BaseRequest<
    TBody = unknown,
    TParams = Record<string, string>,
    TQueryParams = Record<string, string>,
  > = {
    body: TBody;
    headers: Record<string, string | undefined>;
    params: TParams;
    queryParams: TQueryParams;
  };

  export type Request<
    TRouteType extends RouteType = 'public',
    TBody = unknown,
    TParams = Record<string, string>,
    TQueryParams = Record<string, string>,
  > = BaseRequest<TBody, TParams, TQueryParams> &
    (TRouteType extends 'private' ? { accountId: string } : { accountId?: never });

  export type Response<TBody = undefined> = {
    statusCode: number;
    body?: TBody;
    headers?: Record<string, string>;
  };
}
