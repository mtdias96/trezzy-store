import { describe, expect, it } from 'vitest';

import { buildCommandGroups, type CommandItem, matchesCommand, type RecentOrder } from './commands';

const action: CommandItem = {
  id: 'pending-orders',
  kind: 'go',
  label: 'Ver pedidos pendentes',
  description: 'Aguardando PIX ou boleto',
  href: '/admin',
};

const order: RecentOrder = {
  code: 'TZ-10854',
  customer: 'Isabela Ramos',
  totalInCents: 196987,
  status: 'pending',
  href: '/admin',
};

describe('buildCommandGroups', () => {
  it('turns a recent order into a command with the customer and the total', () => {
    const [, orders] = buildCommandGroups([action], [order]);

    expect(orders?.value).toBe('Pedidos recentes');
    expect(orders?.items[0]).toMatchObject({
      label: '#TZ-10854',
      description: 'Isabela Ramos · R$ 1.969,87',
      status: 'pending',
    });
  });

  it('drops the groups without items', () => {
    expect(buildCommandGroups([action], []).map(({ value }) => value)).toEqual(['Ações rápidas']);
    expect(buildCommandGroups([], [])).toEqual([]);
  });
});

describe('matchesCommand', () => {
  it('matches the description too', () => {
    expect(matchesCommand(action, 'pix')).toBe(true);
  });

  it('ignores case and accents', () => {
    expect(matchesCommand({ ...action, label: 'João' }, 'JOAO')).toBe(true);
  });

  it('needs every typed word, in any order', () => {
    expect(matchesCommand(action, 'boleto pedidos')).toBe(true);
    expect(matchesCommand(action, 'boleto cupom')).toBe(false);
  });

  it('matches everything with an empty query', () => {
    expect(matchesCommand(action, '  ')).toBe(true);
  });
});
