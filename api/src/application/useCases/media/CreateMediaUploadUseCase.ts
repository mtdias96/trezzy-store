import { Injectable } from '@kernel/decorators/Injectable';
import { Media } from '@application/entities/Media';
import { MediaRepository } from '@infra/database/repositories/MediaRepository';
import { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

@Injectable()
export class CreateMediaUploadUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly mediaStorageGateway: MediaStorageGateway,
  ) {}

  // Assina antes de gravar: se a assinatura falhar, não sobra linha sem arquivo.
  async execute({ contentType, sizeBytes }: CreateMediaUploadUseCase.Input): Promise<CreateMediaUploadUseCase.Output> {
    const media = Media.create({ contentType, sizeBytes });

    const uploadUrl = await this.mediaStorageGateway.createUploadUrl({ key: media.key, contentType, sizeBytes });

    await this.mediaRepository.create(media);

    return { id: media.id, uploadUrl };
  }
}

export namespace CreateMediaUploadUseCase {
  export type Input = {
    contentType: Media.ContentType;
    sizeBytes: number;
  };

  export type Output = {
    id: string;
    uploadUrl: string;
  };
}
