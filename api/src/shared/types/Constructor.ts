// eslint-disable-next-line @typescript-eslint/no-explicit-any -- única exceção permitida: só `any[]` aceita qualquer construtor
export type Constructor<T = unknown> = new (...args: any[]) => T;
