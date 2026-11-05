import type { Route } from 'next';
import Link from 'next/link';
import { MoreHorizontalIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type ProductRowActionsProps = {
  href: Route;
  title: string;
};

export function ProductRowActions({ href, title }: ProductRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Ações de ${title}`} />}>
        <MoreHorizontalIcon aria-hidden />
      </DropdownMenuTrigger>
      {/* O popup renderiza no <body>, fora do container do painel, e voltaria às superfícies da loja. */}
      <DropdownMenuContent data-area="admin" align="end">
        <DropdownMenuItem render={<Link href={href} />}>Editar</DropdownMenuItem>
        <DropdownMenuItem disabled>Duplicar</DropdownMenuItem>
        <DropdownMenuItem disabled>Arquivar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
