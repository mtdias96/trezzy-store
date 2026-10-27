import { CommandPalette } from '@/features/admin/search/components/command-palette';
import { buildCommandGroups, QUICK_ACTIONS } from '@/features/admin/search/model/commands';

// Os pedidos recentes chegam com a API de pedidos: aí o container busca, fica assíncrono e entra num Suspense.
export function CommandPaletteContainer() {
  return <CommandPalette groups={buildCommandGroups(QUICK_ACTIONS, [])} />;
}
