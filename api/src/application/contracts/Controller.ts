import type { z } from 'zod';

import { getSchema } from '@kernel/decorators/Schema';
import { ValidationError } from '@application/errors/ValidationError';

export type RouteType = 'public' | 'private';

export interface IController<TBody = unknown> {
  execute(request: Controller.ExecuteRequest): Promise<Controller.Response<TBody>>;
}

export abstract class Controller<TType extends RouteType, TBody = undefined>
  implements IController<TBody> {
  protected abstract handle(request: Controller.Request<TType>): Promise<Controller.Response<TBody>>;

  public async execute(request: Controller.ExecuteRequest): Promise<Controller.Response<TBody>> {
    const schema = getSchema(this);
    const body = schema ? this.validate(schema, request.body) : request.body;

    return this.handle({
      ...request,
      body,
    } as unknown as Controller.Request<TType>);
  }

  protected validate<TSchema extends z.ZodType>(schema: TSchema, value: unknown): z.infer<TSchema> {
    const result = schema.safeParse(value);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => ({
          field: issue.path.map(String).join('.'),
          error: issue.message,
        })),
      );
    }

    return result.data;
  }
}

export namespace Controller {
  export type ExecuteRequest = {
    body: unknown;
    headers?: Record<string, string | undefined>;
    params: Record<string, unknown>;
    queryParams: Record<string, unknown>;
    accountId?: string | null;
  };

  type BaseRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = {
    body: TBody;
    headers?: Record<string, string | undefined>;
    params: TParams;
    queryParams: TQueryParams;
  };

  type PublicRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = BaseRequest<TBody, TParams, TQueryParams> & {
    accountId: null;
  };

  type PrivateRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = BaseRequest<TBody, TParams, TQueryParams> & {
    accountId: string;
  };

  export type Request<
    TType extends RouteType,
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = TType extends 'public'
    ? PublicRequest<TBody, TParams, TQueryParams>
    : PrivateRequest<TBody, TParams, TQueryParams>;

  export type Response<TBody = undefined> = {
    statusCode: number;
    body?: TBody;
    headers?: Record<string, string>;
  };
}
