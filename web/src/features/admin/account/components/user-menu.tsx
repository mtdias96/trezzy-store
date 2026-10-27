'use client';

import { ChevronDownIcon, LogOutIcon } from 'lucide-react';

import { Avatar, AvatarBadge, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type UserMenuProps = {
  email: string;
  initials: string;
  signOutAction: () => Promise<void>;
};

export function UserMenu({ email, initials, signOutAction }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Conta de ${email}`}
        className="flex h-ctl-lg items-center gap-1.5 rounded-pill border border-gray-250 py-1 pr-2.5 pl-1 text-gray-700 transition-colors duration-base hover:bg-gray-100 data-popup-open:bg-gray-100"
      >
        <UserAvatar initials={initials} />
        <ChevronDownIcon aria-hidden className="hidden size-4 sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void signOutAction()}>
          <LogOutIcon aria-hidden />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserAvatar({ initials }: { initials: string }) {
  return (
    <Avatar className="size-9">
      <AvatarFallback className="bg-ink font-bold text-lime">{initials}</AvatarFallback>
      <AvatarBadge aria-hidden className="bg-success-500 ring-card" />
    </Avatar>
  );
}
