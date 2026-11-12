import { describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@application/errors/ValidationError';
import type { ConfirmMediaUploadUseCase } from '@application/useCases/media/ConfirmMediaUploadUseCase';

import { ConfirmMediaUploadController } from './ConfirmMediaUploadController';

const MEDIA_ID = '3f2b8c1d-4e5a-4b6c-9d7e-8f9a0b1c2d3e';

function makeSut() {
  const confirmMediaUploadUseCase = {
    execute: vi.fn<ConfirmMediaUploadUseCase['execute']>().mockResolvedValue(),
  };
  const sut = new ConfirmMediaUploadController(confirmMediaUploadUseCase as unknown as ConfirmMediaUploadUseCase);

  return { sut, confirmMediaUploadUseCase };
}

const request = (params: Record<string, unknown>) => ({
  body: undefined,
  params,
  queryParams: {},
  accountId: 'admin-1',
  permissions: ['media:write' as const],
});

describe('ConfirmMediaUploadController', () => {
  it('confirms the media from the path and returns 204', async () => {
    const { sut, confirmMediaUploadUseCase } = makeSut();

    await expect(sut.execute(request({ id: MEDIA_ID }))).resolves.toEqual({ statusCode: 204 });
    expect(confirmMediaUploadUseCase.execute).toHaveBeenCalledWith({ mediaId: MEDIA_ID });
  });

  it('rejects an id that is not a UUID before reaching the use case', async () => {
    const { sut, confirmMediaUploadUseCase } = makeSut();

    await expect(sut.execute(request({ id: 'm-1' }))).rejects.toBeInstanceOf(ValidationError);
    expect(confirmMediaUploadUseCase.execute).not.toHaveBeenCalled();
  });
});
