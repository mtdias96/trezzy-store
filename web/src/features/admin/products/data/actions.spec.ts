import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '@/lib/http';

import { finishMediaUpload, startMediaUpload } from './actions';
import { confirmMediaUpload, createMediaUpload } from './api';

vi.mock('@/config/env', () => ({ env: { API_URL: 'https://api.test' } }));
vi.mock('./api', () => ({ createMediaUpload: vi.fn(), confirmMediaUpload: vi.fn() }));
vi.mock('@/features/shared/auth/session/session', () => ({ requireAdminSession: vi.fn() }));

describe('startMediaUpload', () => {
  beforeEach(() => {
    vi.mocked(createMediaUpload).mockReset();
  });

  it('refuses a file the API would refuse, without calling it', async () => {
    await expect(startMediaUpload({ contentType: 'image/gif', sizeBytes: 1024 })).resolves.toEqual({
      ok: false,
      error: 'Use JPG, PNG ou WEBP de até 10 MB.',
    });
    expect(createMediaUpload).not.toHaveBeenCalled();
  });

  it('returns the media id and the presigned URL', async () => {
    vi.mocked(createMediaUpload).mockResolvedValue({ id: 'm1', uploadUrl: 'https://s3.example/m1' });

    await expect(startMediaUpload({ contentType: 'image/png', sizeBytes: 1024 })).resolves.toEqual({
      ok: true,
      data: { mediaId: 'm1', uploadUrl: 'https://s3.example/m1' },
    });
  });

  it('explains a failure from the API', async () => {
    vi.mocked(createMediaUpload).mockRejectedValue(new HttpError(503, null));

    await expect(startMediaUpload({ contentType: 'image/png', sizeBytes: 1024 })).resolves.toMatchObject({ ok: false });
  });
});

describe('finishMediaUpload', () => {
  it('confirms the upload with the API', async () => {
    vi.mocked(confirmMediaUpload).mockResolvedValue();

    await expect(finishMediaUpload('m1')).resolves.toEqual({ ok: true, data: undefined });
    expect(confirmMediaUpload).toHaveBeenCalledWith('m1');
  });
});
