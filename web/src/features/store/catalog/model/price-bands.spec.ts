import { describe, expect, it } from 'vitest';

import { priceRanges } from './listing';
import { type PriceBandResult, toPriceBands } from './price-bands';

const [upTo300, from300To700, above700] = priceRanges([300, 700]);

function result(range: PriceBandResult['range'] | undefined, total: number, photoCount = 0): PriceBandResult {
  if (!range) {
    throw new Error('faixa inexistente');
  }

  return { range, total, photos: Array.from({ length: photoCount }, (_, index) => ({ id: `p${index}`, imageUrl: null })) };
}

describe('toPriceBands', () => {
  it.each([
    ['the first range', upTo300, 'Até', 'R$ 300'],
    ['a middle range', from300To700, 'De R$ 300 a', 'R$ 700'],
    ['the last range', above700, 'Acima de', 'R$ 700'],
  ])('words %s', (_name, range, caption, amount) => {
    expect(toPriceBands([result(range, 1)])[0]).toMatchObject({ caption, amount });
  });

  it('opens the listing already filtered by the range', () => {
    expect(toPriceBands([result(from300To700, 2)])[0]?.href).toBe('/produtos?preco=300-700');
  });

  it('keeps the total of the range and at most three photos', () => {
    const [band] = toPriceBands([result(upTo300, 9, 5)]);

    expect(band?.productCount).toBe(9);
    expect(band?.photos.map(({ id }) => id)).toEqual(['p0', 'p1', 'p2']);
  });

  it('skips ranges without products', () => {
    expect(toPriceBands([result(upTo300, 0), result(above700, 1)]).map(({ caption }) => caption)).toEqual(['Acima de']);
  });
});
