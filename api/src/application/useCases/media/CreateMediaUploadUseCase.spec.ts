import { describe, expect, it, vi } from 'vitest';

import { Media } from '@application/entities/Media';
import type { MediaRepository } from '@infra/database/repositories/MediaRepository';
import type { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

import { CreateMediaUploadUseCase } from './CreateMediaUploadUseCase';

function makeSut() {
  const mediaRepository = {
    create: vi.fn<MediaRepository['create']>().mockResolvedValue(),
  };
  const mediaStorageGateway = {
    createUploadUrl: vi.fn<MediaStorageGateway['createUploadUrl']>().mockResolvedValue('https://s3.test/upload'),
  };
  const sut = new CreateMediaUploadUseCase(
    mediaRepository as unknown as MediaRepository,
    mediaStorageGateway as unknown as MediaStorageGateway,
  );

  return { sut, mediaRepository, mediaStorageGateway };
}

describe('CreateMediaUploadUseCase', () => {
  it('saves a pending media and returns its id with an upload URL for its key', async () => {
    const { sut, mediaRepository, mediaStorageGateway } = makeSut();

    const output = await sut.execute({ contentType: 'image/webp', sizeBytes: 1024 });

    const [media] = mediaRepository.create.mock.calls[0]!;
    expect(media).toBeInstanceOf(Media);
    expect(media).toMatchObject({ id: output.id, contentType: 'image/webp', sizeBytes: 1024, uploadedAt: null });
    expect(mediaStorageGateway.createUploadUrl).toHaveBeenCalledWith({
      key: media.key,
      contentType: 'image/webp',
      sizeBytes: 1024,
    });
    expect(output).toEqual({ id: media.id, uploadUrl: 'https://s3.test/upload' });
  });

  it('saves nothing when the URL cannot be signed', async () => {
    const { sut, mediaRepository, mediaStorageGateway } = makeSut();
    mediaStorageGateway.createUploadUrl.mockRejectedValue(new Error('no credentials'));

    await expect(sut.execute({ contentType: 'image/png', sizeBytes: 1024 })).rejects.toThrow('no credentials');
    expect(mediaRepository.create).not.toHaveBeenCalled();
  });
});
