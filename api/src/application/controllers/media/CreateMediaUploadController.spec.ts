import { describe, expect, it, vi } from 'vitest';

import { mbToBytes } from '@shared/utils/mbToBytes';
import { ValidationError } from '@application/errors/ValidationError';
import type { CreateMediaUploadUseCase } from '@application/useCases/media/CreateMediaUploadUseCase';

import { CreateMediaUploadController } from './CreateMediaUploadController';

function makeSut() {
  const createMediaUploadUseCase = {
    execute: vi.fn<CreateMediaUploadUseCase['execute']>().mockResolvedValue({
      id: 'm-1',
      uploadUrl: 'https://s3.test/upload',
    }),
  };
  const sut = new CreateMediaUploadController(createMediaUploadUseCase as unknown as CreateMediaUploadUseCase);

  return { sut, createMediaUploadUseCase };
}

const request = (body: unknown) => ({
  body,
  params: {},
  queryParams: {},
  accountId: 'admin-1',
  permissions: ['media:write' as const],
});

const validationFields = async (promise: Promise<unknown>) => {
  const error = await promise.catch((reason: unknown) => reason);

  expect(error).toBeInstanceOf(ValidationError);

  return (error as ValidationError).issues.map(({ field }) => field);
};

describe('CreateMediaUploadController', () => {
  it('returns 201 with the media id and the upload URL', async () => {
    const { sut, createMediaUploadUseCase } = makeSut();

    const response = await sut.execute(request({ contentType: 'image/webp', sizeBytes: 1024, extra: true }));

    expect(response).toEqual({ statusCode: 201, body: { media: { id: 'm-1', uploadUrl: 'https://s3.test/upload' } } });
    expect(createMediaUploadUseCase.execute).toHaveBeenCalledWith({ contentType: 'image/webp', sizeBytes: 1024 });
  });

  it('accepts a file of exactly 10 MB', async () => {
    const { sut } = makeSut();

    await expect(sut.execute(request({ contentType: 'image/png', sizeBytes: mbToBytes(10) }))).resolves.toMatchObject({
      statusCode: 201,
    });
  });

  it.each([
    { contentType: 'image/gif', sizeBytes: 1024, field: 'contentType' },
    { contentType: 'image/jpeg', sizeBytes: 0, field: 'sizeBytes' },
    { contentType: 'image/jpeg', sizeBytes: mbToBytes(10) + 1, field: 'sizeBytes' },
    { contentType: 'image/jpeg', sizeBytes: 1.5, field: 'sizeBytes' },
  ])('rejects $field = $contentType / $sizeBytes before reaching the use case', async ({ field, ...body }) => {
    const { sut, createMediaUploadUseCase } = makeSut();

    await expect(validationFields(sut.execute(request(body)))).resolves.toEqual([field]);
    expect(createMediaUploadUseCase.execute).not.toHaveBeenCalled();
  });
});
