import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { FormAction } from '@/lib/action-result';

import { type QuickSizeOption, QuickSizes } from './quick-sizes';

const options = [
  { size: '37', variantId: null },
  { size: '38', variantId: 'tenis-38' },
];

const chip = (name: string) => screen.getByRole<HTMLButtonElement>('button', { name, hidden: true });

function renderInCard(sizes: readonly QuickSizeOption[], action: FormAction) {
  const view = render(<article><QuickSizes options={sizes} action={action} /></article>);

  return { ...view, card: view.container.querySelector('article') as HTMLElement };
}

function renderSizes(action: FormAction = vi.fn(async () => ({ ok: true as const, data: undefined }))) {
  const view = renderInCard(options, action);

  fireEvent.pointerEnter(view.card);

  return { action, ...view };
}

describe('QuickSizes', () => {
  it('builds the panel only when the pointer reaches the card', () => {
    const { card, container } = renderInCard(options, vi.fn());

    expect(container.querySelector('form')).toBeNull();

    fireEvent.pointerEnter(card);

    expect(container.querySelector('form')).not.toBeNull();
  });

  it('builds the panel for a pointer that was already over the card', () => {
    const { card, container } = renderInCard(options, vi.fn());

    fireEvent.pointerMove(card);

    expect(container.querySelector('form')).not.toBeNull();
  });

  it('stays out of the page on touch', () => {
    const { card, container } = renderInCard(options, vi.fn());

    fireEvent.pointerEnter(card, { pointerType: 'touch' });

    expect(container.querySelector('form')).toBeNull();
  });

  it('disables only the sold out sizes', () => {
    renderSizes();

    expect(chip('37').disabled).toBe(true);
    expect(chip('38').disabled).toBe(false);
  });

  it('shows the one-size grid by name', () => {
    fireEvent.pointerEnter(renderInCard([{ size: 'U', variantId: 'oculos-u' }], vi.fn()).card);

    expect(chip('Único').value).toBe('oculos-u');
  });

  it('sends the variant of the clicked size and confirms it', async () => {
    const { action } = renderSizes();

    fireEvent.click(chip('38'));

    await screen.findByText('Adicionado à sacola');

    expect(vi.mocked(action).mock.calls[0]?.[1].get('variantId')).toBe('tenis-38');
  });

  it('shows the error returned by the action', async () => {
    renderSizes(vi.fn(async () => ({ ok: false as const, error: 'Esse tamanho acabou de esgotar.' })));

    fireEvent.click(chip('38'));

    expect(await screen.findByText('Esse tamanho acabou de esgotar.')).toBeTruthy();
  });

  it('clears the confirmation when the pointer leaves', async () => {
    const { container } = renderSizes();

    fireEvent.click(chip('38'));
    await screen.findByText('Adicionado à sacola');

    fireEvent.pointerLeave(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(screen.getByText('Adicionar tamanho')).toBeTruthy());
  });
});
