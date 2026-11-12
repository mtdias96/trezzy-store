import { describe, expect, it, vi } from 'vitest';

import { Media } from '@application/entities/Media';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import type { MediaRepository } from '@infra/database/repositories/MediaRepository';
import type { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

import { ConfirmMediaUploadUseCase } from './ConfirmMediaUploadUseCase';

const WEBP_START = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x10, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);

const pending = new Media({
  id: 'm-1',
  key: 'uploads/m-1.webp',
  contentType: 'image/webp',
  sizeBytes: 1024,
  uploadedAt: null,
});

const validObject: MediaStorageGateway.ObjectStart = { contentType: 'image/webp', sizeBytes: 1024, firstBytes: WEBP_START };

function makeSut(media: Media | null = pending) {
  const mediaRepository = {
    findById: vi.fn<MediaRepository['findById']>().mockResolvedValue(media),
    markUploaded: vi.fn<MediaRepository['markUploaded']>().mockResolvedValue(),
  };
  const mediaStorageGateway = {
    readObjectStart: vi.fn<MediaStorageGateway['readObjectStart']>().mockResolvedValue(validObject),
    deleteObject: vi.fn<MediaStorageGateway['deleteObject']>().mockResolvedValue(),
  };
  const sut = new ConfirmMediaUploadUseCase(
    mediaRepository as unknown as MediaRepository,
    mediaStorageGateway as unknown as MediaStorageGateway,
  );

  return { sut, mediaRepository, mediaStorageGateway };
}

const errorCode = async (promise: Promise<unknown>) => {
  const error = await promise.catch((reason: unknown) => reason);

  expect(error).toBeInstanceOf(ApplicationError);

  return (error as ApplicationError).code;
};

describe('ConfirmMediaUploadUseCase', () => {
  it('marks the media as uploaded when the stored file is the requested image', async () => {
    const { sut, mediaRepository, mediaStorageGateway } = makeSut();

    await sut.execute({ mediaId: 'm-1' });

    expect(mediaStorageGateway.readObjectStart).toHaveBeenCalledWith('uploads/m-1.webp', 12);
    expect(mediaRepository.markUploaded).toHaveBeenCalledWith('m-1');
    expect(mediaStorageGateway.deleteObject).not.toHaveBeenCalled();
  });

  it('throws NOT_FOUND for an unknown media', async () => {
    const { sut } = makeSut(null);

    await expect(errorCode(sut.execute({ mediaId: 'missing' }))).resolves.toBe(ErrorCode.NOT_FOUND);
  });

  it('does nothing when the media is already confirmed', async () => {
    const { sut, mediaRepository, mediaStorageGateway } = makeSut(new Media({ ...pending, uploadedAt: new Date() }));

    await sut.execute({ mediaId: 'm-1' });

    expect(mediaStorageGateway.readObjectStart).not.toHaveBeenCalled();
    expect(mediaRepository.markUploaded).not.toHaveBeenCalled();
  });

  it('throws CONFLICT when the file is not in the bucket', async () => {
    const { sut, mediaRepository, mediaStorageGateway } = makeSut();
    mediaStorageGateway.readObjectStart.mockResolvedValue(null);

    await expect(errorCode(sut.execute({ mediaId: 'm-1' }))).resolves.toBe(ErrorCode.CONFLICT);
    expect(mediaRepository.markUploaded).not.toHaveBeenCalled();
    expect(mediaStorageGateway.deleteObject).not.toHaveBeenCalled();
  });

  it.each([
    { case: 'another type', stored: { ...validObject, contentType: 'image/png' } },
    { case: 'another size', stored: { ...validObject, sizeBytes: 2048 } },
    { case: 'no type or size', stored: { ...validObject, contentType: null, sizeBytes: null } },
    { case: 'bytes that are not a WebP', stored: { ...validObject, firstBytes: new TextEncoder().encode('<html><body>') } },
  ])('deletes the file and throws CONFLICT when it has $case', async ({ stored }) => {
    const { sut, mediaRepository, mediaStorageGateway } = makeSut();
    mediaStorageGateway.readObjectStart.mockResolvedValue(stored);

    await expect(errorCode(sut.execute({ mediaId: 'm-1' }))).resolves.toBe(ErrorCode.CONFLICT);
    expect(mediaStorageGateway.deleteObject).toHaveBeenCalledWith('uploads/m-1.webp');
    expect(mediaRepository.markUploaded).not.toHaveBeenCalled();
  });
});
