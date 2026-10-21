import 'reflect-metadata';

import type { Constructor } from '@shared/types/Constructor';

export class Registry {
  private static instance: Registry | undefined;

  static getInstance(): Registry {
    if (!this.instance) {
      this.instance = new Registry();
    }

    return this.instance;
  }

  private constructor() {}

  private readonly providers = new Map<string, Registry.Provider>();
  private readonly singletons = new Map<string, unknown>();

  register(impl: Constructor): void {
    const token = impl.name;

    if (this.providers.has(token)) {
      return;
    }

    const deps = Reflect.getMetadata('design:paramtypes', impl) ?? [];

    this.providers.set(token, { impl, deps });
  }

  resolve<TImpl extends Constructor>(impl: TImpl): InstanceType<TImpl> {
    const token = impl.name;

    if (this.singletons.has(token)) {
      return this.singletons.get(token) as InstanceType<TImpl>;
    }

    let provider = this.providers.get(token);

    if (!provider) {
      this.register(impl);
      provider = this.providers.get(token)!;
    }

    const deps = provider.deps.map((dep) => this.resolve(dep));
    const instance = new provider.impl(...deps);

    this.singletons.set(token, instance);
    return instance as InstanceType<TImpl>;
  }
}

export namespace Registry {
  export type Provider = {
    impl: Constructor;
    deps: Constructor[];
  };
}
