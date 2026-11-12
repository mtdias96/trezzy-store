import { describe, expect, it } from 'vitest';

import { Media, MEDIA_SIGNATURE_MAX_BYTES } from './Media';

describe('Media.create', () => {
  it('starts as not uploaded, under a key made from its id and the extension of its type', () => {
    const media = Media.create({ contentType: 'image/webp', sizeBytes: 1024 });

    expect(media).toEqual({
      id: expect.any(String),
      key: `uploads/${media.id}.webp`,
      contentType: 'image/webp',
      sizeBytes: 1024,
      uploadedAt: null,
    });
  });

  it('uses jpg for JPEG and png for PNG', () => {
    expect(Media.create({ contentType: 'image/jpeg', sizeBytes: 1 }).key).toMatch(/\.jpg$/);
    expect(Media.create({ contentType: 'image/png', sizeBytes: 1 }).key).toMatch(/\.png$/);
  });

  it('generates a new id for each media', () => {
    const first = Media.create({ contentType: 'image/png', sizeBytes: 1 });
    const second = Media.create({ contentType: 'image/png', sizeBytes: 1 });

    expect(first.id).not.toBe(second.id);
  });
});

describe('Media.matchesSignature', () => {
  const bytes = (...values: number[]) => new Uint8Array(values);
  const media = (contentType: Media.ContentType) => Media.create({ contentType, sizeBytes: 1024 });

  const JPEG = bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01);
  const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d);
  const WEBP = bytes(0x52, 0x49, 0x46, 0x46, 0x24, 0x08, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50);

  it.each([
    { contentType: 'image/jpeg' as const, firstBytes: JPEG },
    { contentType: 'image/png' as const, firstBytes: PNG },
    { contentType: 'image/webp' as const, firstBytes: WEBP },
  ])('accepts the real start of a $contentType file', ({ contentType, firstBytes }) => {
    expect(media(contentType).matchesSignature(firstBytes)).toBe(true);
  });

  it('rejects a file whose bytes belong to another format', () => {
    expect(media('image/png').matchesSignature(JPEG)).toBe(false);
    expect(media('image/jpeg').matchesSignature(WEBP)).toBe(false);
  });

  it('rejects HTML or a script sent as an image', () => {
    expect(media('image/jpeg').matchesSignature(new TextEncoder().encode('<script>alert(1)</script>'))).toBe(false);
  });

  it('rejects a RIFF file that is not WebP (e.g. WAV audio)', () => {
    const wav = bytes(0x52, 0x49, 0x46, 0x46, 0x24, 0x08, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45);

    expect(media('image/webp').matchesSignature(wav)).toBe(false);
  });

  it('rejects a file shorter than the signature', () => {
    expect(media('image/png').matchesSignature(bytes(0x89, 0x50))).toBe(false);
  });

  it('reads at most the longest signature (WebP, 12 bytes)', () => {
    expect(MEDIA_SIGNATURE_MAX_BYTES).toBe(12);
  });
});
