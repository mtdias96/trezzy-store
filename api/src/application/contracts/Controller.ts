import { getSchema } from '@kernel/decorators/Schema.js';

export interface IController<TBody = unknown> {
  execute(request: Controller.Request): Promise<Controller.Response<TBody>>;
}

export abstract class Controller<
  TBody = undefined,
  TRequestBody = unknown,
  TParams = Record<string, string>,
  TQueryParams = Record<string, string>,
> implements IController<TBody> {
  protected abstract handle(
    request: Controller.Request<TRequestBody, TParams, TQueryParams>,
  ): Promise<Controller.Response<TBody>>;

  public execute(
    request: Controller.Request<unknown, unknown, unknown>,
  ): Promise<Controller.Response<TBody>> {
    const body = this.validateBody(request.body) as TRequestBody;

    return this.handle({
      ...request,
      body,
      params: request.params as TParams,
      queryParams: request.queryParams as TQueryParams,
    });
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
  export type Request<
    TBody = unknown,
    TParams = Record<string, string>,
    TQueryParams = Record<string, string>,
  > = {
    body: TBody;
    headers: Record<string, string | undefined>;
    params: TParams;
    queryParams: TQueryParams;
  };

  export type Response<TBody = undefined> = {
    statusCode: number;
    body?: TBody;
    headers?: Record<string, string>;
  };
}
