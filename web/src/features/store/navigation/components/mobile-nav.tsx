import Link from 'next/link';
import { ChevronDownIcon, UserIcon } from 'lucide-react';

import { MobileMenu } from '@/components/store/navigation/mobile-menu';
import type { StoreMenu } from '@/features/store/navigation/model/types';
import { pendingRoute } from '@/lib/route';

type MobileNavProps = {
  menu: StoreMenu;
};

// Departamentos em <details>: abrem e fecham sem JS. Os destaques e o drop ficam no desktop.
// A conta entra aqui porque o ícone dela sai do header no celular, para a marca caber em 360px.
export function MobileNav({ menu }: MobileNavProps) {
  return (
    <MobileMenu label="Principal">
      <ul className="flex flex-col py-2">
        {menu.entries.map((entry) =>
          entry.kind === 'link'
            ? (
                <li key={entry.href}>
                  <Link href={entry.href} className="flex h-12 items-center gap-2 px-5 text-body-lg font-semibold">
                    {entry.highlight ? <span aria-hidden className="size-1.5 rounded-pill bg-lime-700" /> : null}
                    {entry.label}
                  </Link>
                </li>
              )
            : (
                <li key={entry.id}>
                  <details className="group">
                    <summary className="flex h-12 cursor-pointer list-none items-center justify-between px-5 text-body-lg font-semibold">
                      {entry.label}
                      <ChevronDownIcon
                        aria-hidden
                        className="size-4 transition-transform duration-base group-open:rotate-180"
                      />
                    </summary>
                    <div className="flex flex-col gap-4 px-5 pb-4">
                      {entry.sections.map((section, index) => {
                        const titleId = `mobile-nav-${entry.id}-${index}`;

                        return (
                          <div key={section.title}>
                            <p id={titleId} className="text-micro font-bold text-gray-700 uppercase">
                              {section.title}
                            </p>
                            <ul aria-labelledby={titleId} className="mt-1">
                              {section.links.map((link) => (
                                <li key={link.href}>
                                  <Link href={link.href} className="flex h-11 items-center text-body">
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                      <Link href={entry.href} className="flex h-11 items-center text-body font-bold text-brand">
                        {entry.allLabel}
                      </Link>
                    </div>
                  </details>
                </li>
              ),
        )}
      </ul>
      <div className="border-t border-border px-5 py-2">
        <Link href={pendingRoute('/conta')} className="flex h-12 items-center gap-3 text-body-lg font-semibold">
          <UserIcon aria-hidden className="size-5" />
          Minha conta
        </Link>
      </div>
    </MobileMenu>
  );
}
