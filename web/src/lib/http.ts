import 'server-only';

import type * as z from 'zod';

import { env } from '@/config/env';

const TIMEOUT_MS = 10_000;

// Caminho da API, sempre começando por barra: '/products'.
export type ApiPath = `/${string}`;

export type HttpOptions<TSchema extends z.ZodType> = Omit<RequestInit, 'body'> & {
  // Toda resposta passa por um schema: nada da API chega ao app sem validação.
  schema: TSchema;
  body?: unknown;
};

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly payload: unknown,
  ) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
  }
}

// Resposta sem corpo vira undefined, e corpo que não é JSON (ex: 502 do gateway) fica como texto.
function parseBody(text: string): unknown {
  if (text === '') {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Cliente HTTP do servidor para a api/: envia JSON, valida a resposta e lança HttpError em 4xx/5xx.
export async function http<TSchema extends z.ZodType>(
  path: ApiPath,
  { schema, body, headers, signal, ...init }: HttpOptions<TSchema>,
): Promise<z.infer<TSchema>> {
  const requestHeaders = new Headers(headers);

  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${env.API_URL}${path}`, {
    ...init,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: signal ?? AbortSignal.timeout(TIMEOUT_MS),
  });

  const payload = parseBody(await response.text());

  if (!response.ok) {
    throw new HttpError(response.status, payload);
  }

  return schema.parse(payload);
}
