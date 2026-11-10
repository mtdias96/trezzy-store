import { Activity } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BestSellersCarousel } from './best-sellers-carousel';

const panels = [
  { id: 'all', label: 'Tudo', pageCount: 3, items: <li>Tênis</li> },
  { id: 'eyewear', label: 'Eyewear', pageCount: 1, items: <li>Óculos</li> },
];

const previous = () => screen.getByRole<HTMLButtonElement>('button', { name: 'Página anterior' });
const next = () => screen.getByRole<HTMLButtonElement>('button', { name: 'Próxima página' });

function renderCarousel() {
  render(<BestSellersCarousel titleId="title" eyebrow="Top 10" title="Mais vendidos" panels={panels} />);
}

function scrollRail(scrollLeft: number) {
  const rail = screen.getByText('Tênis').closest('ol');

  if (!rail) {
    throw new Error('rail not found');
  }

  Object.defineProperties(rail, {
    clientWidth: { configurable: true, value: 1000 },
    scrollWidth: { configurable: true, value: 2500 },
    scrollLeft: { configurable: true, value: scrollLeft },
  });
  fireEvent.scroll(rail);

  return rail;
}

describe('BestSellersCarousel', () => {
  const scrollTo = vi.fn();

  beforeEach(() => {
    scrollTo.mockClear();
    Element.prototype.scrollTo = scrollTo;
  });

  it('opens on the first page with only the next button enabled', () => {
    renderCarousel();

    expect(screen.queryByText('Página 1 de 3')).not.toBeNull();
    expect(previous().disabled).toBe(true);
    expect(next().disabled).toBe(false);
  });

  it('follows the rail scroll', () => {
    renderCarousel();
    scrollRail(1000);

    expect(screen.queryByText('Página 2 de 3')).not.toBeNull();
    expect(previous().disabled).toBe(false);
  });

  it('disables the next button at the end of the rail', () => {
    renderCarousel();
    scrollRail(1500);

    expect(screen.queryByText('Página 3 de 3')).not.toBeNull();
    expect(next().disabled).toBe(true);
  });

  it('moves the rail one page at a time', () => {
    renderCarousel();
    scrollRail(0);

    fireEvent.click(next());

    expect(scrollTo).toHaveBeenCalledWith({ left: 1000 });
  });

  it('goes back to the first page when the department changes', () => {
    renderCarousel();
    scrollRail(1000);

    fireEvent.click(screen.getByRole('tab', { name: 'Eyewear' }));

    expect(screen.queryByText('Página 1 de 1')).not.toBeNull();
    expect(next().disabled).toBe(true);
    expect(screen.queryByText('Tênis')).toBeNull();
    expect(screen.queryByText('Óculos')).not.toBeNull();
  });

  it('puts the rail back where it was when the page returns', () => {
    const carousel = <BestSellersCarousel titleId="title" eyebrow="Top 10" title="Mais vendidos" panels={panels} />;
    const { rerender } = render(<Activity mode="visible">{carousel}</Activity>);

    scrollRail(1000);
    scrollTo.mockClear();

    rerender(<Activity mode="hidden">{carousel}</Activity>);
    rerender(<Activity mode="visible">{carousel}</Activity>);

    expect(scrollTo).toHaveBeenCalledWith({ left: 1000, behavior: 'instant' });
    expect(screen.queryByText('Página 2 de 3')).not.toBeNull();
  });

  it('links to the full best sellers list', () => {
    renderCarousel();

    expect(screen.getByRole('link', { name: /Ver todos/ }).getAttribute('href')).toBe('/produtos?ordem=mais-vendidos');
  });
});
