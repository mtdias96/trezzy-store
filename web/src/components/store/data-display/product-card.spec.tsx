import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { formatPrice } from '@/lib/money';

import { ProductCard, type ProductCardData } from './product-card';

const base: ProductCardData = {
  name: 'Moletom Heavyweight “Pátio”',
  brand: 'Pátio 9',
  href: '/',
  imageUrl: null,
  hoverImageUrl: null,
  priceInCents: 48990,
  compareAtPriceInCents: null,
  installments: { count: 10, valueInCents: 4899 },
  pixPriceInCents: 44091,
  rating: 4.9,
  sizeOptions: [],
};

const addToBagAction = vi.fn();

function renderCard(product: Partial<ProductCardData> = {}) {
  return render(<ProductCard product={{ ...base, ...product }} imageSizes="25vw" addToBagAction={addToBagAction} />);
}

describe('ProductCard', () => {
  it('links the product name to its page', () => {
    renderCard();

    expect(screen.getByRole('link', { name: 'Moletom Heavyweight “Pátio”' }).getAttribute('href')).toBe('/');
  });

  it('strikes the old price only when it is higher', () => {
    const { container, rerender } = renderCard({ compareAtPriceInCents: 58990 });

    expect(container.querySelector('del')?.textContent).toBe(`De ${formatPrice(58990)}`);

    rerender(<ProductCard product={{ ...base, compareAtPriceInCents: 48990 }} imageSizes="25vw" addToBagAction={addToBagAction} />);

    expect(container.querySelector('del')).toBeNull();
  });

  it('adds the second photo only when the product has one', () => {
    const { container, rerender } = renderCard({ imageUrl: '/capa.jpg', hoverImageUrl: '/costas.jpg' });

    expect(container.querySelectorAll('img')).toHaveLength(2);

    rerender(<ProductCard product={{ ...base, imageUrl: '/capa.jpg' }} imageSizes="25vw" addToBagAction={addToBagAction} />);

    expect(container.querySelectorAll('img')).toHaveLength(1);
  });

  it('offers the sizes when at least one is in stock', () => {
    const { container } = renderCard({ sizeOptions: [{ size: 'P', variantId: null }, { size: 'M', variantId: 'moletom-m' }] });

    fireEvent.pointerEnter(container.querySelector('article') as HTMLElement);

    expect(screen.getByText('Adicionar tamanho')).toBeTruthy();
  });

  it.each([
    ['every size sold out', [{ size: 'P', variantId: null }]],
    ['no sizes', []],
  ])('hides the size panel with %s', (_case, sizeOptions) => {
    const { container } = renderCard({ sizeOptions });

    fireEvent.pointerEnter(container.querySelector('article') as HTMLElement);

    expect(screen.queryByText('Adicionar tamanho')).toBeNull();
  });

  it('shows installments, the Pix price and the rating', () => {
    renderCard();

    expect(screen.getByText('10x de R$ 48,99 sem juros')).toBeTruthy();
    expect(screen.getByText('R$ 440,91 no PIX')).toBeTruthy();
    expect(screen.getByText(/4,9/).textContent).toBe('Nota 4,9 de 5');
  });
});
