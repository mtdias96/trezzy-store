import { Activity } from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MediaUploader } from '@/features/admin/products/model/media';

import { useMediaUploads } from './use-media-uploads';

type PendingUpload = {
  progress: (percent: number) => void;
  resolve: () => void;
  reject: () => void;
  signal: AbortSignal;
};

function controlledUploader() {
  const pending: PendingUpload[] = [];
  const upload: MediaUploader = (_file, { onProgress, signal }) =>
    new Promise((resolve, reject) => {
      pending.push({ progress: onProgress, resolve, reject: () => reject(new Error('falhou')), signal });
    });

  return { upload, pending };
}

function image(name: string, type = 'image/png'): File {
  return new File(['x'], name, { type });
}

describe('useMediaUploads', () => {
  // O jsdom não implementa as prévias (blob:) do URL.
  beforeEach(() => {
    let next = 0;

    URL.createObjectURL = vi.fn(() => `blob:preview-${next++}`);
    URL.revokeObjectURL = vi.fn();
  });

  it('adds valid photos as uploading and lists the rejected ones', () => {
    const { upload } = controlledUploader();
    const { result } = renderHook(() => useMediaUploads(upload));

    act(() => result.current.addFiles([image('a.png'), image('b.gif', 'image/gif')]));

    expect(result.current.items).toMatchObject([{ name: 'a.png', status: 'uploading', progress: 0 }]);
    expect(result.current.rejections).toEqual([{ name: 'b.gif', reason: 'formato não aceito (use JPG, PNG ou WEBP)' }]);
  });

  it('tracks the progress until the upload finishes', async () => {
    const { upload, pending } = controlledUploader();
    const { result } = renderHook(() => useMediaUploads(upload));

    act(() => result.current.addFiles([image('a.png')]));
    act(() => pending[0]?.progress(67));

    expect(result.current.items[0]).toMatchObject({ status: 'uploading', progress: 67 });

    await act(async () => pending[0]?.resolve());

    expect(result.current.items[0]).toMatchObject({ status: 'done', progress: 100 });
  });

  it('marks a failed upload', async () => {
    const { upload, pending } = controlledUploader();
    const { result } = renderHook(() => useMediaUploads(upload));

    act(() => result.current.addFiles([image('a.png')]));
    await act(async () => pending[0]?.reject());

    expect(result.current.items[0]?.status).toBe('error');
  });

  it('cancels the upload and frees the preview of a removed photo', () => {
    const { upload, pending } = controlledUploader();
    const { result } = renderHook(() => useMediaUploads(upload));

    act(() => result.current.addFiles([image('a.png')]));
    const [item] = result.current.items;
    act(() => result.current.remove(item?.id ?? ''));

    expect(result.current.items).toEqual([]);
    expect(pending[0]?.signal.aborted).toBe(true);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(item?.previewUrl);
  });

  it('moves a photo to the position of another', () => {
    const { upload } = controlledUploader();
    const { result } = renderHook(() => useMediaUploads(upload));

    act(() => result.current.addFiles([image('a.png'), image('b.png'), image('c.png')]));
    const [first, , third] = result.current.items;
    act(() => result.current.reorder(third?.id ?? '', first?.id ?? ''));

    expect(result.current.items.map(({ name }) => name)).toEqual(['c.png', 'a.png', 'b.png']);
  });

  // Com o cacheComponents, o Next esconde a página com <Activity> ao navegar e roda os cleanups dos effects.
  it('keeps the previews and the uploads while the page is hidden', async () => {
    const { upload, pending } = controlledUploader();
    let mode: 'visible' | 'hidden' = 'visible';
    const { result, rerender } = renderHook(() => useMediaUploads(upload), {
      wrapper: ({ children }) => <Activity mode={mode}>{children}</Activity>,
    });

    act(() => result.current.addFiles([image('a.png')]));
    mode = 'hidden';
    rerender();
    mode = 'visible';
    rerender();

    expect(pending[0]?.signal.aborted).toBe(false);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    await act(async () => pending[0]?.resolve());

    expect(result.current.items[0]?.status).toBe('done');
  });
});
