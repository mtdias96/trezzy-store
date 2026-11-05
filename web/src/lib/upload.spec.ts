import { afterEach, describe, expect, it, vi } from 'vitest';

import { uploadWithProgress } from './upload';

type Listener = (event: { lengthComputable?: boolean; loaded?: number; total?: number }) => void;

class FakeRequest {
  static last: FakeRequest | undefined;
  status = 0;
  method = '';
  url = '';
  headers: Record<string, string> = {};
  body: unknown;
  listeners: Record<string, Listener> = {};
  upload = { addEventListener: (type: string, listener: Listener) => (this.listeners[`upload:${type}`] = listener) };

  constructor() {
    FakeRequest.last = this;
  }

  addEventListener(type: string, listener: Listener) {
    this.listeners[type] = listener;
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }

  send(body: unknown) {
    this.body = body;
  }

  abort() {
    this.listeners.abort?.({});
  }

  emit(type: string, event: Parameters<Listener>[0] = {}) {
    this.listeners[type]?.(event);
  }
}

function request(): FakeRequest {
  if (!FakeRequest.last) {
    throw new Error('Nenhuma requisição foi aberta.');
  }

  return FakeRequest.last;
}

const file = new File(['x'], 'capa.webp', { type: 'image/webp' });

describe('uploadWithProgress', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends the file with a PUT and its content type, reporting the progress', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeRequest);
    const onProgress = vi.fn();
    const done = uploadWithProgress('https://s3.example/upload', file, { onProgress, signal: new AbortController().signal });

    request().emit('upload:progress', { lengthComputable: true, loaded: 50, total: 100 });
    request().status = 200;
    request().emit('load');

    await expect(done).resolves.toBeUndefined();
    expect(request()).toMatchObject({ method: 'PUT', url: 'https://s3.example/upload', body: file });
    expect(request().headers['Content-Type']).toBe('image/webp');
    expect(onProgress).toHaveBeenCalledWith(50);
  });

  it('fails when the storage refuses the file', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeRequest);
    const done = uploadWithProgress('https://s3.example/upload', file, { onProgress: vi.fn(), signal: new AbortController().signal });

    request().status = 403;
    request().emit('load');

    await expect(done).rejects.toThrow('HTTP 403');
  });

  it('aborts the request when the signal fires', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeRequest);
    const controller = new AbortController();
    const done = uploadWithProgress('https://s3.example/upload', file, { onProgress: vi.fn(), signal: controller.signal });

    controller.abort();

    await expect(done).rejects.toThrow('Envio cancelado.');
  });
});
