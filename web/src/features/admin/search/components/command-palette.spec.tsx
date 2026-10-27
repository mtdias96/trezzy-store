import type { Route } from 'next';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CommandPalette } from '@/features/admin/search/components/command-palette';
import { buildCommandGroups, type CommandItem } from '@/features/admin/search/model/commands';

const push = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const action = (id: string, label: string, description: string, href: string): CommandItem => ({
  id,
  kind: 'create',
  label,
  description,
  href: href as Route,
});

const groups = buildCommandGroups(
  [
    action('new-product', 'Novo produto', 'Cadastrar produto, variantes e estoque', '/admin/produtos/novo'),
    action('new-coupon', 'Novo cupom', 'Criar código de desconto', '/admin/cupons/novo'),
    action('pending-orders', 'Ver pedidos pendentes', 'Aguardando PIX ou boleto', '/admin/pedidos'),
  ],
  [{ code: 'TZ-10854', customer: 'Isabela Ramos', totalInCents: 196987, status: 'pending', href: '/admin' }],
);

// Digitação como a do browser: o Base UI só destaca o primeiro resultado sozinho quando o evento traz o inputType
// (o fireEvent.change não traz).
function type(input: HTMLElement, value: string) {
  fireEvent.input(input, { target: { value }, inputType: 'insertText' });
}

function openPalette() {
  render(<CommandPalette groups={groups} />);
  fireEvent.click(screen.getByRole('button', { name: /Buscar pedidos, produtos/ }));

  return screen.getByRole('combobox', { name: 'Buscar no painel' });
}

describe('CommandPalette', () => {
  beforeEach(() => {
    push.mockClear();
  });

  it('opens from the header field with the quick actions and recent orders', () => {
    openPalette();

    expect(screen.getByText('Ações rápidas')).toBeTruthy();
    expect(screen.getByRole('option', { name: /Novo produto/ })).toBeTruthy();
    expect(screen.getByRole('option', { name: /#TZ-10854/ })).toBeTruthy();
  });

  it('opens with Ctrl+K', () => {
    render(<CommandPalette groups={groups} />);

    act(() => {
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    });

    expect(screen.getByRole('combobox', { name: 'Buscar no painel' })).toBeTruthy();
  });

  it('filters by label and description and shows the empty state', () => {
    const input = openPalette();

    type(input, 'isabela');

    expect(screen.getByRole('option', { name: /#TZ-10854/ })).toBeTruthy();
    expect(screen.queryByRole('option', { name: /Novo produto/ })).toBeNull();

    type(input, 'xyz');

    expect(screen.getByText('Nada encontrado.')).toBeTruthy();
  });

  it('opens the first match with Enter after typing', () => {
    const input = openPalette();

    act(() => {
      input.focus();
    });
    type(input, 'pix');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(push).toHaveBeenCalledWith('/admin/pedidos');
    expect(screen.queryByRole('combobox', { name: 'Buscar no painel' })).toBeNull();
  });

  it('navigates to the chosen item and closes', () => {
    openPalette();

    fireEvent.click(screen.getByRole('option', { name: /Novo cupom/ }));

    expect(push).toHaveBeenCalledWith('/admin/cupons/novo');
  });
});
