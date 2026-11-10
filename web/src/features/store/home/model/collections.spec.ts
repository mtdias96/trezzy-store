import { describe, expect, it } from 'vitest';

import { toHomeCollections } from './collections';
import type { HomeCollection } from './types';

const collection = (id: string): HomeCollection => ({ id, title: id, caption: '', imageUrl: null, href: '/' });

const five = ['a', 'b', 'c', 'd', 'e'].map(collection);

describe('toHomeCollections', () => {
  it('features the first collection and keeps the order of the others', () => {
    const collections = toHomeCollections(five);

    expect(collections?.featured.id).toBe('a');
    expect(collections?.others.map(({ id }) => id)).toEqual(['b', 'c', 'd', 'e']);
  });

  it('ignores what does not fit the mosaic', () => {
    expect(toHomeCollections([...five, collection('f')])?.others).toHaveLength(4);
  });

  it('hides the section with fewer than five collections', () => {
    expect(toHomeCollections(five.slice(0, 4))).toBeNull();
  });
});
