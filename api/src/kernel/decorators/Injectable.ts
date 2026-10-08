import { Registry } from '@kernel/di/Registry.js';
import type { Constructor } from '@shared/types/Constructor.js';

export function Injectable(): ClassDecorator {
  return (target) => {
    Registry.getInstance().register(target as unknown as Constructor);
  };
}
