import { Injectable } from '@kernel/decorators/Injectable';

// Stateless de propósito: o Registry entrega um singleton por container, então as compensações
// vivem só dentro de cada run(). Guardadas na instância, vazariam para a próxima invocação.
@Injectable()
export class Saga {
  async run<TResult>(fn: (context: Saga.Context) => Promise<TResult>): Promise<TResult> {
    const compensations: Saga.Compensation[] = [];

    try {
      return await fn({
        addCompensation: (compensation) => {
          compensations.unshift(compensation);
        },
      });
    } catch (error) {
      await Saga.compensate(compensations);
      throw error;
    }
  }

  private static async compensate(compensations: Saga.Compensation[]): Promise<void> {
    for (const compensation of compensations) {
      try {
        await compensation();
      } catch (error) {
        // eslint-disable-next-line no-console -- a falha de uma compensação é logada e não pode mascarar o erro original
        console.error('Saga compensation failed', error);
      }
    }
  }
}

export namespace Saga {
  export type Compensation = () => Promise<void>;

  export type Context = {
    addCompensation(compensation: Compensation): void;
  };
}
