'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRightIcon, type LucideIcon, PlusIcon, ReceiptTextIcon, SearchIcon } from 'lucide-react';

import { OrderStatusBadge } from '@/components/admin/data-display/order-status-badge';
import {
  Combobox,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';
import { type CommandGroup, type CommandItem, matchesCommand } from '@/features/admin/search/model/commands';
import { useClientValue } from '@/hooks/use-client-value';

type CommandPaletteProps = {
  groups: CommandGroup[];
};

const KIND_ICONS = {
  create: PlusIcon,
  go: ChevronRightIcon,
  order: ReceiptTextIcon,
} satisfies Record<CommandItem['kind'], LucideIcon>;

// Combobox do Base UI com a lista inline, dentro de um Dialog: abre pelo campo do cabeçalho ou pelo ⌘K/Ctrl+K.
export function CommandPalette({ groups }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // O servidor não sabe o sistema: mostra o atalho do Mac até o browser trocar.
  const shortcut = useClientValue(() => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl K'), '⌘K');

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      setOpen((current) => !current);
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function openItem(item: CommandItem | null) {
    if (item) {
      setOpen(false);
      router.push(item.href);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-keyshortcuts="Meta+K Control+K"
        className="hidden h-ctl w-70 items-center gap-2.5 rounded-pill bg-gray-50 pr-1.5 pl-4 text-gray-600 transition-colors duration-base hover:bg-gray-100 lg:flex"
      >
        <SearchIcon aria-hidden className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left text-body-sm">Buscar pedidos, produtos…</span>
        <Kbd className="bg-card">{shortcut}</Kbd>
      </DialogTrigger>
      <DialogTrigger
        aria-label="Buscar"
        className="flex size-11 shrink-0 items-center justify-center rounded-pill border border-gray-250 text-ink transition-colors duration-base hover:bg-gray-100 md:size-10 lg:hidden"
      >
        <SearchIcon aria-hidden className="size-4.5" />
      </DialogTrigger>
      {/* O portal renderiza fora do container do painel: o data-area devolve as superfícies do admin. */}
      <DialogContent
        data-area="admin"
        showCloseButton={false}
        className="top-4 translate-y-0 gap-0 overflow-hidden rounded-2xl p-0 shadow-modal sm:top-24 sm:max-w-160"
      >
        <DialogTitle className="sr-only">Buscar no painel</DialogTitle>
        {/* open ligado ao do Dialog: ao fechar, o Combobox limpa a busca e o destaque. */}
        <Combobox
          inline
          open={open}
          onOpenChange={setOpen}
          items={groups}
          value={null}
          onValueChange={openItem}
          filter={matchesCommand}
          itemToStringLabel={(item: CommandItem) => item.label}
          autoHighlight
        >
          <div className="flex h-14 items-center gap-3 border-b border-border px-4">
            <SearchIcon aria-hidden className="size-5 shrink-0 text-gray-600" />
            <ComboboxChipsInput
              aria-label="Buscar no painel"
              placeholder="Nº do pedido, produto, SKU ou ação…"
              className="h-full bg-transparent text-ink placeholder:text-gray-500 md:text-body-lg"
            />
            <Kbd className="border border-border bg-card">esc</Kbd>
          </div>
          <ComboboxEmpty className="flex px-4 py-10 empty:hidden">Nada encontrado.</ComboboxEmpty>
          <ComboboxList className="max-h-96 p-2">
            {(group: CommandGroup) => (
              <ComboboxGroup key={group.value} items={group.items}>
                <ComboboxLabel className="px-3 pt-3 pb-1.5 font-semibold tracking-wide uppercase">
                  {group.value}
                </ComboboxLabel>
                <ComboboxCollection>
                  {(item: CommandItem) => <CommandRow key={item.id} item={item} />}
                </ComboboxCollection>
              </ComboboxGroup>
            )}
          </ComboboxList>
          <div className="flex items-center gap-4 border-t border-border bg-gray-25 px-4 py-2.5 text-caption text-gray-700">
            <span className="flex items-center gap-1.5">
              <Kbd className="border border-border bg-card">↑↓</Kbd>
              navegar
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd className="border border-border bg-card">↵</Kbd>
              abrir
            </span>
            <span aria-hidden className="ml-auto type-display text-display-xs text-ink">Trezzy</span>
          </div>
        </Combobox>
      </DialogContent>
    </Dialog>
  );
}

function CommandRow({ item }: { item: CommandItem }) {
  const Icon = KIND_ICONS[item.kind];

  return (
    <ComboboxItem value={item} className="gap-3 rounded-xl py-2 pr-3 pl-2 data-highlighted:bg-brand-50">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-gray-50 text-ink">
        <Icon aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={item.kind === 'order' ? 'truncate font-mono font-semibold text-ink' : 'truncate font-semibold text-ink'}>
          {item.label}
        </span>
        <span className="truncate text-caption text-gray-700">{item.description}</span>
      </span>
      {item.status ? <OrderStatusBadge status={item.status} /> : null}
    </ComboboxItem>
  );
}
