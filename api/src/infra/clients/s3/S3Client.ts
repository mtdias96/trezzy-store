import { S3Client as AwsS3Client } from '@aws-sdk/client-s3';

import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class S3Client {
  public readonly client: AwsS3Client;

  constructor(private readonly appConfig: AppConfig) {
    this.client = new AwsS3Client({
      region: this.appConfig.storage.s3.region,
      // O padrão (WHEN_SUPPORTED) põe na URL pré-assinada o CRC32 de um corpo vazio, e o S3 recusa o PUT do browser.
      requestChecksumCalculation: 'WHEN_REQUIRED',
    });
  }
}
