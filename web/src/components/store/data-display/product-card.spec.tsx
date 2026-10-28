import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { formatPrice } from '@/lib/money';

import { ProductCard, type ProductCardData } from './product-card';

const base: ProductCardData = {
  id: 'moletom-patio',
  name: 'Moletom Heavyweight “Pátio”',
  brand: 'Pátio 9',
  href: '/',
  imageUrl: null,
  priceInCents: 48990,
  compareAtPriceInCents: null,
  installments: { count: 10, valueInCents: 4899 },
  pixPriceInCents: 44091,
  rating: 4.9,
  tag: null,
};

function renderCard(product: Partial<ProductCardData> = {}) {
  return render(<ProductCard product={{ ...base, ...product }} imageSizes="25vw" />);
}

describe('ProductCard', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('links the product name to its page', () => {
    renderCard();

    expect(screen.getByRole('link', { name: 'Moletom Heavyweight “Pátio”' }).getAttribute('href')).toBe('/');
  });

  it.each([
    [{ tag: 'drop', compareAtPriceInCents: 58990 }, 'Drop'],
    [{ tag: 'last-units', compareAtPriceInCents: 58990 }, '-17%'],
    [{ tag: 'last-units' }, 'Últimas unidades'],
    [{ tag: 'new' }, 'Novo'],
  ] as const)('shows one badge by priority (%o → %s)', (product, label) => {
    renderCard(product);

    expect(screen.getByText(label)).toBeTruthy();
  });

  it('shows no badge without tag or discount', () => {
    // Sem o Pix, o único "-N%" possível seria o do selo.
    renderCard({ pixPriceInCents: null });

    expect(screen.queryByText(/^(Drop|Novo|Últimas unidades|-\d+%)$/)).toBeNull();
  });

  it('strikes the old price only when it is higher', () => {
    const { container, rerender } = renderCard({ compareAtPriceInCents: 58990 });

    expect(container.querySelector('del')?.textContent).toBe(`De ${formatPrice(58990)}`);

    rerender(<ProductCard product={{ ...base, compareAtPriceInCents: 48990 }} imageSizes="25vw" />);

    expect(container.querySelector('del')).toBeNull();
  });

  it('shows installments, the Pix price with its discount and the rating', () => {
    renderCard();

    expect(screen.getByText('10x de R$ 48,99 sem juros')).toBeTruthy();
    expect(screen.getByText('R$ 440,91')).toBeTruthy();
    expect(screen.getByText('-10%')).toBeTruthy();
    expect(screen.getByText(/4,9/).textContent).toBe('Nota 4,9 de 5');
  });

  it('toggles the favorite and remembers it', () => {
    renderCard();
    const favorite = screen.getByRole('button', { name: 'Favoritar Moletom Heavyweight “Pátio”' });

    fireEvent.click(favorite);

    expect(favorite.getAttribute('aria-pressed')).toBe('true');
    expect(window.localStorage.getItem('favorite:moletom-patio')).toBe('1');
  });
});
