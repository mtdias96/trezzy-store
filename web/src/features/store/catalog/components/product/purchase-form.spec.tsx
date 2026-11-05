import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProductDetail } from '@/features/store/catalog/model/types';

import { PurchaseForm } from './purchase-form';

const product: ProductDetail = {
  id: 'camiseta-boxy',
  slug: 'camiseta-boxy',
  name: 'Camiseta Boxy',
  brand: 'Mormaço',
  href: '/',
  priceInCents: 22990,
  compareAtPriceInCents: null,
  installments: null,
  pixPriceInCents: null,
  rating: null,
  reviewCount: 0,
  reviewSummary: { distribution: [0, 0, 0, 0, 0], fit: null },
  tag: null,
  description: [],
  composition: [],
  department: { name: 'Streetwear', href: '/' },
  category: null,
  images: [],
  colors: [
    { id: 'preto', name: 'Preto', swatch: 'black' },
    { id: 'branco', name: 'Branco', swatch: 'white' },
  ],
  sizes: ['P', 'M', 'G'],
  variants: [
    { id: 'preto-p', colorId: 'preto', size: 'P', inStock: true },
    { id: 'preto-g', colorId: 'preto', size: 'G', inStock: true },
    { id: 'branco-p', colorId: 'branco', size: 'P', inStock: true },
  ],
  sizeChart: null,
};

function renderForm(action = vi.fn()) {
  render(<PurchaseForm product={product} sizeChart={null} action={action} pending={false} result={null} />);

  return action;
}

describe('PurchaseForm', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('marks out of stock sizes as unavailable', () => {
    renderForm();

    const medium = screen.getByRole<HTMLInputElement>('radio', { name: /^M\b/ });

    expect(medium.disabled).toBe(true);
    expect(medium.labels?.[0]?.textContent).toBe('M (esgotado)');
  });

  it('asks for a size instead of submitting without one', () => {
    const action = renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Selecione um tamanho' }));

    expect(screen.getByRole('alert').textContent).toBe('Escolha um tamanho para continuar.');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'P' }));
    expect(action).not.toHaveBeenCalled();
  });

  it('sends the chosen variant and keeps the choice on screen', () => {
    const action = renderForm();

    fireEvent.click(screen.getByRole('radio', { name: 'G' }));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à sacola' }));

    expect((action.mock.calls[0]?.[0] as FormData).get('variantId')).toBe('preto-g');
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'G' }).checked).toBe(true);
  });

  it('drops the size when the new color does not have it', () => {
    renderForm();

    fireEvent.click(screen.getByRole('radio', { name: 'G' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Branco' }));

    expect(screen.getByRole('button', { name: 'Selecione um tamanho' })).toBeTruthy();
  });
});
