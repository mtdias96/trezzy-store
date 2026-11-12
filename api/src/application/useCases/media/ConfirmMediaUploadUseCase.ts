import { Injectable } from '@kernel/decorators/Injectable';
import { MEDIA_SIGNATURE_MAX_BYTES } from '@application/entities/Media';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import { MediaRepository } from '@infra/database/repositories/MediaRepository';
import { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

@Injectable()
export class ConfirmMediaUploadUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly mediaStorageGateway: MediaStorageGateway,
  ) {}

  async execute({ mediaId }: ConfirmMediaUploadUseCase.Input): Promise<ConfirmMediaUploadUseCase.Output> {
    const media = await this.mediaRepository.findById(mediaId);

    if (!media) {
      throw new ApplicationError(ErrorCode.NOT_FOUND, 'Media not found.');
    }

    // Idempotente: o front pode repetir a confirmação depois de uma falha de rede.
    if (media.uploadedAt) {
      return;
    }

    const stored = await this.mediaStorageGateway.readObjectStart(media.key, MEDIA_SIGNATURE_MAX_BYTES);

    if (!stored) {
      throw new ApplicationError(ErrorCode.CONFLICT, 'File has not been uploaded yet.');
    }

    const isExpectedFile =
      stored.contentType === media.contentType &&
      stored.sizeBytes === media.sizeBytes &&
      media.matchesSignature(stored.firstBytes);

    // Só o arquivo sai: a linha fica pendente. A limpeza das pendentes ainda não existe (AGENTS.md, Pendências).
    if (!isExpectedFile) {
      await this.mediaStorageGateway.deleteObject(media.key);

      throw new ApplicationError(ErrorCode.CONFLICT, 'Uploaded file is not a valid image of the requested type.');
    }

    await this.mediaRepository.markUploaded(media.id);
  }
}

export namespace ConfirmMediaUploadUseCase {
  export type Input = {
    mediaId: string;
  };

  export type Output = void;
}
