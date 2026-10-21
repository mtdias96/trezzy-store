import { describe, expect, it } from 'vitest';

import { Injectable } from '@kernel/decorators/Injectable';

import { Registry } from './Registry';

describe('Registry', () => {
  it('resolves a class with no dependencies as a singleton', () => {
    class SimpleService {}

    const registry = Registry.getInstance();
    const instance1 = registry.resolve(SimpleService);
    const instance2 = registry.resolve(SimpleService);

    expect(instance1).toBeInstanceOf(SimpleService);
    expect(instance1).toBe(instance2);
  });

  it('autowires dependencies using @Injectable and design:paramtypes', () => {
    @Injectable()
    class DatabaseConnection {
      connected = true;
    }

    @Injectable()
    class UserRepository {
      constructor(public db: DatabaseConnection) {}
    }

    @Injectable()
    class UserService {
      constructor(public userRepo: UserRepository) {}
    }

    const registry = Registry.getInstance();
    const service = registry.resolve(UserService);

    expect(service).toBeInstanceOf(UserService);
    expect(service.userRepo).toBeInstanceOf(UserRepository);
    expect(service.userRepo.db).toBeInstanceOf(DatabaseConnection);
    expect(service.userRepo.db.connected).toBe(true);
  });

  it('is idempotent when a class is registered multiple times', () => {
    class DuplicateService {}

    const registry = Registry.getInstance();
    registry.register(DuplicateService);
    registry.register(DuplicateService);

    const instance = registry.resolve(DuplicateService);
    expect(instance).toBeInstanceOf(DuplicateService);
  });

  it('keeps distinct classes with the same name isolated', () => {
    const makeService = (module: string) => {
      class ListService {
        readonly module = module;
      }

      return ListService;
    };
    const OrdersListService = makeService('orders');
    const ProductsListService = makeService('products');

    const registry = Registry.getInstance();

    expect(registry.resolve(OrdersListService).module).toBe('orders');
    expect(registry.resolve(ProductsListService).module).toBe('products');
  });

  it('fails fast when a constructor parameter is not an injectable class', () => {
    type Clock = { now(): Date };

    expect(() => {
      @Injectable()
      class BrokenService {
        constructor(public clock: Clock) {}
      }

      return BrokenService;
    }).toThrow('Cannot inject parameter #0 of BrokenService: expected an injectable class, received Object.');
  });

  it('detects circular dependencies', () => {
    class ServiceA {}
    class ServiceB {}
    Reflect.defineMetadata('design:paramtypes', [ServiceB], ServiceA);
    Reflect.defineMetadata('design:paramtypes', [ServiceA], ServiceB);

    expect(() => Registry.getInstance().resolve(ServiceA)).toThrow(
      'Circular dependency detected: ServiceA -> ServiceB -> ServiceA.',
    );
  });
});

