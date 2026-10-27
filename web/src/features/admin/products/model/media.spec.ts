import { describe, expect, it } from 'vitest';

import { formatImageCount, MEDIA_MAX_BYTES, type MediaItem, moveMedia, updateMedia, validateMediaFile } from './media';

describe('validateMediaFile', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])('accepts %s', (type) => {
    expect(validateMediaFile({ type, size: 1024 })).toBeNull();
  });

  it.each(['image/gif', 'image/svg+xml', 'application/pdf', ''])('refuses %j', (type) => {
    expect(validateMediaFile({ type, size: 1024 })).toBe('formato não aceito (use JPG, PNG ou WEBP)');
  });

  it('accepts a file of exactly 10 MB', () => {
    expect(validateMediaFile({ type: 'image/png', size: MEDIA_MAX_BYTES })).toBeNull();
  });

  it('refuses a file over 10 MB', () => {
    expect(validateMediaFile({ type: 'image/png', size: MEDIA_MAX_BYTES + 1 })).toBe('passa de 10 MB');
  });
});

describe('formatImageCount', () => {
  it.each([
    [0, 'Nenhuma imagem'],
    [1, '1 imagem'],
    [3, '3 imagens'],
  ])('describes %i images as %s', (count, text) => {
    expect(formatImageCount(count)).toBe(text);
  });
});

function item(id: string): MediaItem {
  return { id, name: `${id}.png`, previewUrl: `blob:${id}`, status: 'uploading', progress: 0 };
}

describe('updateMedia', () => {
  it('patches only the item with the id', () => {
    const items = [item('a'), item('b')];

    expect(updateMedia(items, 'b', { progress: 40 })).toEqual([item('a'), { ...item('b'), progress: 40 }]);
  });
});

describe('moveMedia', () => {
  const ids = (items: readonly MediaItem[]) => items.map(({ id }) => id);

  it('moves an item forward and shifts the ones in between back', () => {
    expect(ids(moveMedia([item('a'), item('b'), item('c')], 'a', 'c'))).toEqual(['b', 'c', 'a']);
  });

  it('moves an item backward and shifts the ones in between forward', () => {
    expect(ids(moveMedia([item('a'), item('b'), item('c')], 'c', 'a'))).toEqual(['c', 'a', 'b']);
  });

  it.each([
    ['an unknown item', 'x', 'a'],
    ['an unknown target', 'a', 'x'],
    ['the same position', 'a', 'a'],
  ])('keeps the same list for %s', (_case, activeId, overId) => {
    const items = [item('a'), item('b')];

    expect(moveMedia(items, activeId, overId)).toBe(items);
  });
});
