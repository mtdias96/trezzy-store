import { DeleteObjectCommand, GetObjectCommand, NoSuchKey, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';
import { minutesToSeconds } from '@shared/utils/minutesToSeconds';
import { S3Client } from '@infra/clients/s3/S3Client';

const UPLOAD_URL_TTL_SECONDS = minutesToSeconds(5);

@Injectable()
export class MediaStorageGateway {
  constructor(
    private readonly s3Client: S3Client,
    private readonly appConfig: AppConfig,
  ) {}

  // Tipo e tamanho entram na assinatura: o S3 recusa um PUT diferente do que foi pedido.
  async createUploadUrl({ key, contentType, sizeBytes }: MediaStorageGateway.CreateUploadUrlParams): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.appConfig.storage.s3.mediaBucket,
      Key: key,
      ContentType: contentType,
      ContentLength: sizeBytes,
    });

    return getSignedUrl(this.s3Client.client, command, {
      expiresIn: UPLOAD_URL_TTL_SECONDS,
      // Sem isto, o presigner deixa o Content-Type fora da assinatura.
      signableHeaders: new Set(['content-type']),
    });
  }

  // Lê só o começo do arquivo. Com Range, o ContentLength é o do trecho; o tamanho total vem do Content-Range.
  async readObjectStart(key: string, bytes: number): Promise<MediaStorageGateway.ObjectStart | null> {
    try {
      const { ContentType, ContentRange, Body } = await this.s3Client.client.send(
        new GetObjectCommand({
          Bucket: this.appConfig.storage.s3.mediaBucket,
          Key: key,
          Range: `bytes=0-${bytes - 1}`,
        }),
      );

      const totalSize = ContentRange?.match(/\/(\d+)$/)?.[1];

      return {
        contentType: ContentType ?? null,
        sizeBytes: totalSize ? Number(totalSize) : null,
        firstBytes: Body ? await Body.transformToByteArray() : new Uint8Array(),
      };
    } catch (error) {
      if (error instanceof NoSuchKey) {
        return null;
      }

      throw error;
    }
  }

  async deleteObject(key: string): Promise<void> {
    await this.s3Client.client.send(
      new DeleteObjectCommand({ Bucket: this.appConfig.storage.s3.mediaBucket, Key: key }),
    );
  }
}

export namespace MediaStorageGateway {
  export type CreateUploadUrlParams = {
    key: string;
    contentType: string;
    sizeBytes: number;
  };

  export type ObjectStart = {
    contentType: string | null;
    sizeBytes: number | null;
    firstBytes: Uint8Array;
  };
}
