import { describe, expect, it, vi } from 'vitest';

import { Saga } from './Saga';

describe('Saga', () => {
  it('returns the result and runs no compensation on success', async () => {
    const saga = new Saga();
    const compensation = vi.fn(async () => {});

    const result = await saga.run(async ({ addCompensation }) => {
      addCompensation(compensation);
      return 'ok';
    });

    expect(result).toBe('ok');
    expect(compensation).not.toHaveBeenCalled();
  });

  it('runs the compensations in reverse order and rethrows the original error', async () => {
    const saga = new Saga();
    const calls: string[] = [];
    const error = new Error('step 3 failed');

    await expect(
      saga.run(async ({ addCompensation }) => {
        addCompensation(async () => {
          calls.push('undo 1');
        });
        addCompensation(async () => {
          calls.push('undo 2');
        });
        throw error;
      }),
    ).rejects.toBe(error);

    expect(calls).toEqual(['undo 2', 'undo 1']);
  });

  it('keeps compensating and preserves the original error when a compensation fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const saga = new Saga();
    const lastCompensation = vi.fn(async () => {});
    const error = new Error('original');

    await expect(
      saga.run(async ({ addCompensation }) => {
        addCompensation(lastCompensation);
        addCompensation(async () => {
          throw new Error('compensation failed');
        });
        throw error;
      }),
    ).rejects.toBe(error);

    expect(lastCompensation).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });

  // O Registry entrega a mesma instância para todas as invocações de um container aquecido.
  it('does not leak compensations from a successful run into a later failed one (singleton)', async () => {
    const saga = new Saga();
    const deletePreviousUser = vi.fn(async () => {});
    const deleteCurrentUser = vi.fn(async () => {});

    await saga.run(async ({ addCompensation }) => {
      addCompensation(deletePreviousUser);
    });

    await expect(
      saga.run(async ({ addCompensation }) => {
        addCompensation(deleteCurrentUser);
        throw new Error('fail');
      }),
    ).rejects.toThrow('fail');

    expect(deleteCurrentUser).toHaveBeenCalledOnce();
    expect(deletePreviousUser).not.toHaveBeenCalled();
  });
});
