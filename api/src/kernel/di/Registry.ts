import 'reflect-metadata';

import type { Constructor } from '@shared/types/Constructor';

// O que o TS emite em design:paramtypes para interface, primitivo ou `import type`.
const NON_INJECTABLE_TYPES = new Set<unknown>([Object, String, Number, Boolean, Symbol, BigInt, Array, Function, Promise]);

export class Registry {
  private static instance: Registry | undefined;

  static getInstance(): Registry {
    if (!this.instance) {
      this.instance = new Registry();
    }

    return this.instance;
  }

  private constructor() {}

  private readonly providers = new Map<Constructor, Registry.Provider>();
  private readonly singletons = new Map<Constructor, unknown>();
  private readonly resolving: Constructor[] = [];

  register(impl: Constructor): void {
    if (this.providers.has(impl)) {
      return;
    }

    this.providers.set(impl, { impl, deps: Registry.readDependencies(impl) });
  }

  resolve<TImpl extends Constructor>(impl: TImpl): InstanceType<TImpl> {
    if (this.singletons.has(impl)) {
      return this.singletons.get(impl) as InstanceType<TImpl>;
    }

    if (this.resolving.includes(impl)) {
      const cycle = [...this.resolving.slice(this.resolving.indexOf(impl)), impl];
      throw new Error(`Circular dependency detected: ${cycle.map((dep) => dep.name).join(' -> ')}.`);
    }

    this.register(impl);
    const provider = this.providers.get(impl)!;

    this.resolving.push(impl);

    try {
      const instance = new provider.impl(...provider.deps.map((dep) => this.resolve(dep)));
      this.singletons.set(impl, instance);

      return instance as InstanceType<TImpl>;
    } finally {
      this.resolving.pop();
    }
  }

  private static readDependencies(impl: Constructor): Constructor[] {
    const paramTypes: unknown = Reflect.getMetadata('design:paramtypes', impl);

    if (!Array.isArray(paramTypes)) {
      return [];
    }

    return paramTypes.map((dep: unknown, index) => {
      if (typeof dep !== 'function' || NON_INJECTABLE_TYPES.has(dep)) {
        const received = typeof dep === 'function' ? dep.name : String(dep);

        throw new Error(
          `Cannot inject parameter #${index} of ${impl.name}: expected an injectable class, received ${received}. ` +
          'Use a concrete class imported as a value (not "import type"); "undefined" usually means a circular import.',
        );
      }

      return dep as Constructor;
    });
  }
}

export namespace Registry {
  export type Provider = {
    impl: Constructor;
    deps: Constructor[];
  };
}
