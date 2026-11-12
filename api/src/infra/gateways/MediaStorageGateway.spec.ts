import { DeleteObjectCommand, GetObjectCommand, NoSuchKey, S3ServiceException } from '@aws-sdk/client-s3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppConfig } from '@shared/config/AppConfig';
import { S3Client } from '@infra/clients/s3/S3Client';

import { MediaStorageGateway } from './MediaStorageGateway';

const appConfig = {
  storage: { s3: { region: 'sa-east-1', mediaBucket: 'trezzy-api-test-media' } },
} as unknown as AppConfig;

function makeSut() {
  const send = vi.fn();
  const s3Client = { client: { send } } as unknown as S3Client;
  const sut = new MediaStorageGateway(s3Client, appConfig);

  return { sut, send };
}

describe('MediaStorageGateway.createUploadUrl', () => {
  // A assinatura é local: com credenciais falsas, o S3Client real gera a URL sem rede.
  beforeEach(() => {
    vi.stubEnv('AWS_ACCESS_KEY_ID', 'AKIATEST');
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'test-secret');
    // Com um perfil ou um token de sessão no shell, o SDK ignora as chaves acima e usa as credenciais reais.
    vi.stubEnv('AWS_PROFILE', '');
    vi.stubEnv('AWS_SESSION_TOKEN', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const createUploadUrl = async () => {
    const sut = new MediaStorageGateway(new S3Client(appConfig), appConfig);
    const url = await sut.createUploadUrl({ key: 'uploads/m-1.webp', contentType: 'image/webp', sizeBytes: 1024 });

    return new URL(url);
  };

  it('signs a PUT to the media bucket that expires in 5 minutes', async () => {
    const url = await createUploadUrl();

    expect(url.host).toBe('trezzy-api-test-media.s3.sa-east-1.amazonaws.com');
    expect(url.pathname).toBe('/uploads/m-1.webp');
    expect(url.searchParams.get('x-id')).toBe('PutObject');
    expect(url.searchParams.get('X-Amz-Expires')).toBe('300');
  });

  it('signs the content type and the size, so S3 rejects a different file', async () => {
    const url = await createUploadUrl();

    expect(url.searchParams.get('X-Amz-SignedHeaders')).toBe('content-length;content-type;host');
  });

  it('leaves the checksum out of the URL', async () => {
    const url = await createUploadUrl();

    expect([...url.searchParams.keys()].filter((key) => key.toLowerCase().includes('checksum'))).toEqual([]);
  });
});

describe('MediaStorageGateway.readObjectStart', () => {
  const body = (bytes: number[]) => ({ transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array(bytes)) });

  it('reads only the first bytes and takes the total size from the Content-Range', async () => {
    const { sut, send } = makeSut();
    send.mockResolvedValue({ ContentType: 'image/png', ContentRange: 'bytes 0-11/1024', Body: body([0x89, 0x50]) });

    await expect(sut.readObjectStart('uploads/m-1.png', 12)).resolves.toEqual({
      contentType: 'image/png',
      sizeBytes: 1024,
      firstBytes: new Uint8Array([0x89, 0x50]),
    });

    const [command] = send.mock.calls[0]!;
    expect(command).toBeInstanceOf(GetObjectCommand);
    expect(command.input).toEqual({ Bucket: 'trezzy-api-test-media', Key: 'uploads/m-1.png', Range: 'bytes=0-11' });
  });

  it('returns no size when S3 sends no Content-Range', async () => {
    const { sut, send } = makeSut();
    send.mockResolvedValue({ ContentType: 'image/png', Body: body([]) });

    await expect(sut.readObjectStart('uploads/m-1.png', 12)).resolves.toMatchObject({ sizeBytes: null });
  });

  it('returns null when the object does not exist', async () => {
    const { sut, send } = makeSut();
    send.mockRejectedValue(new NoSuchKey({ message: 'The specified key does not exist.', $metadata: {} }));

    await expect(sut.readObjectStart('uploads/m-1.png', 12)).resolves.toBeNull();
  });

  it('propagates any other S3 error', async () => {
    const { sut, send } = makeSut();
    const error = new S3ServiceException({ name: 'AccessDenied', $fault: 'client', message: 'denied', $metadata: {} });
    send.mockRejectedValue(error);

    await expect(sut.readObjectStart('uploads/m-1.png', 12)).rejects.toBe(error);
  });
});

describe('MediaStorageGateway.deleteObject', () => {
  it('deletes the key from the media bucket', async () => {
    const { sut, send } = makeSut();
    send.mockResolvedValue({});

    await sut.deleteObject('uploads/m-1.png');

    const [command] = send.mock.calls[0]!;
    expect(command).toBeInstanceOf(DeleteObjectCommand);
    expect(command.input).toEqual({ Bucket: 'trezzy-api-test-media', Key: 'uploads/m-1.png' });
  });
});
