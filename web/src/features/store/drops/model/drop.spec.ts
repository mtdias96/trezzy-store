import { describe, expect, it } from 'vitest';

import { formatPrice } from '@/lib/money';

import { dropCaption, dropLongLabel, dropNumberLabel, dropShortLabel, dropStockLabel, dropSubtitle, withLiveStock } from './drop';
import type { CalendarDrop } from './types';

// 19h em São Paulo (UTC-3) de sexta, 30/10/2026.
const friday = new Date('2026-10-30T22:00:00Z');

describe('dropShortLabel', () => {
  it('pads the drop number and shows the short weekday and hour', () => {
    expect(dropShortLabel(7, friday)).toBe('Drop 07 · Sex 19h');
  });
});

describe('dropLongLabel', () => {
  it('pads the drop number and shows the long weekday and hour', () => {
    expect(dropLongLabel(7, friday)).toBe('Drop 07 · Sexta, 19h');
  });

  it('keeps numbers above 99 whole', () => {
    expect(dropLongLabel(120, friday)).toBe('Drop 120 · Sexta, 19h');
  });
});

describe('dropCaption', () => {
  it('joins the brand, the padded number and the edition', () => {
    expect(dropCaption('Forte Athletics', 7)).toBe('Forte Athletics · Nº07 · Edição limitada');
  });
});

describe('dropNumberLabel', () => {
  it('pads the drop number', () => {
    expect(dropNumberLabel(7)).toBe('Drop 07');
  });
});

describe('dropStockLabel', () => {
  it.each([
    [{ status: 'upcoming', quantity: 400, unit: 'pair' }, '400 pares'],
    [{ status: 'upcoming', quantity: 1, unit: 'pair' }, '1 par'],
    [{ status: 'upcoming', quantity: 12, unit: 'piece' }, '12 peças'],
    [{ status: 'upcoming', quantity: 1, unit: 'piece' }, '1 peça'],
    [{ status: 'available', remaining: 38 }, 'Restam 38'],
    [{ status: 'available', remaining: 1 }, 'Resta 1'],
    [{ status: 'sold-out', soldOutAfterMinutes: 6 }, 'Esgotou em 6 min'],
    [{ status: 'sold-out', soldOutAfterMinutes: 120 }, 'Esgotou em 2 h'],
  ] as const)('describes %o as %s', (stock, label) => {
    expect(dropStockLabel(stock)).toBe(label);
  });
});

describe('withLiveStock', () => {
  const available: CalendarDrop = {
    number: 6,
    numberLabel: 'Drop 06',
    dateLabel: 'Sex, 30 out · 19h',
    title: 'Órbita',
    subtitle: 'Lente Crua · R$ 1.099,90',
    imageUrl: null,
    href: '/produtos',
    status: 'available',
    stockLabel: 'Restam 38',
  };
  const upcoming: CalendarDrop = { ...available, number: 7, status: 'upcoming', stockLabel: '400 pares' };

  it('replaces only the status and the stock of the matching drop', () => {
    const [first, second] = withLiveStock([available, upcoming], [{ number: 6, status: 'sold-out', stockLabel: 'Esgotou em 6 min' }]);

    expect(first).toEqual({ ...available, status: 'sold-out', stockLabel: 'Esgotou em 6 min' });
    expect(second).toBe(upcoming);
  });

  it('keeps the cached drops when there is no live stock', () => {
    expect(withLiveStock([available], [])).toEqual([available]);
  });
});

describe('dropSubtitle', () => {
  it('joins the brand and the price', () => {
    expect(dropSubtitle('Forte Athletics', 119990, false)).toBe(`Forte Athletics · ${formatPrice(119990)}`);
  });

  it('marks a starting price', () => {
    expect(dropSubtitle('Pátio 9 × Vândalo', 24990, true)).toBe(`Pátio 9 × Vândalo · A partir de ${formatPrice(24990)}`);
  });
});
