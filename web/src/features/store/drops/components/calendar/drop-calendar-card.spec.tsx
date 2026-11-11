import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import type { CalendarDrop } from '@/features/store/drops/model/types';

import { DropCalendarCard } from './drop-calendar-card';

const drop: CalendarDrop = {
  number: 7,
  numberLabel: 'Drop 07',
  dateLabel: 'Sex, 13 nov · 19h',
  title: 'Runner 03',
  subtitle: 'Forte Athletics · R$ 1.199,90',
  imageUrl: null,
  href: '/produtos',
  status: 'upcoming',
  stockLabel: '400 pares',
};

function renderCard(status: CalendarDrop['status']) {
  render(<DropCalendarCard drop={{ ...drop, status }} imageSizes="25vw" />);
}

describe('DropCalendarCard', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('offers a reminder before the drop starts', () => {
    renderCard('upcoming');

    expect(screen.getByRole('button', { name: 'Ativar lembrete' })).toBeTruthy();
    expect(screen.getByText('Em breve')).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('links to the purchase while it is available', () => {
    renderCard('available');

    expect(screen.getByRole('link', { name: 'Comprar agora: Runner 03' }).getAttribute('href')).toBe('/produtos');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('has no action once it is sold out', () => {
    renderCard('sold-out');

    expect(screen.getAllByText('Esgotado')).toHaveLength(2);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
