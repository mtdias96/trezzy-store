import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { CalendarDrop } from '@/features/store/drops/model/types';

import { DropCalendarListContainer } from './drop-calendar-list-container';

vi.mock('@/hooks/use-in-view', () => ({ useInView: vi.fn(() => true) }));

const drop: CalendarDrop = {
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

describe('DropCalendarListContainer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the live stock over the cached one', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ drops: [{ number: 6, status: 'sold-out', stockLabel: 'Esgotou em 6 min' }] })));

    render(<DropCalendarListContainer drops={[drop]} />);

    expect(screen.getByText('Restam 38')).toBeTruthy();
    expect(await screen.findByText('Esgotou em 6 min')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Comprar agora/ })).toBeNull();
  });

  it('keeps the cached stock when the route fails', async () => {
    const fetchStock = vi.fn(async () => new Response(null, { status: 500 }));

    vi.stubGlobal('fetch', fetchStock);

    render(<DropCalendarListContainer drops={[drop]} />);

    await waitFor(() => expect(fetchStock).toHaveBeenCalledTimes(1));

    expect(screen.getByText('Restam 38')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Comprar agora/ })).toBeTruthy();
  });
});
