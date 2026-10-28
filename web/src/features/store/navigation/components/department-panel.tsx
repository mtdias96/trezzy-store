import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { PageContainer } from '@/components/store/layout/page-container';
import { NavigationMenuLink } from '@/components/ui/navigation-menu';
import type { StoreMenuDepartment } from '@/features/store/navigation/model/types';

import { MenuProductCard } from './menu-product-card';

type DepartmentPanelProps = {
  department: StoreMenuDepartment;
  // Card no fim do painel (o drop da semana), vindo de outra feature.
  promo?: ReactNode;
};

// Os títulos das colunas não são <h*>: o painel se repete por departamento e em toda página, e encheria o
// sumário da página de títulos que não são conteúdo. A lista é nomeada pelo aria-labelledby.
export function DepartmentPanel({ department, promo }: DepartmentPanelProps) {
  return (
    <PageContainer className="flex gap-6 py-8 xl:gap-8">
      <div className="grid flex-1 grid-cols-2 gap-6">
        {department.sections.map((section, index) => {
          const titleId = `nav-${department.id}-${index}`;

          return (
            <div key={section.title}>
              <p id={titleId} className="text-micro font-bold text-gray-700 uppercase">
                {section.title}
              </p>
              <ul aria-labelledby={titleId} className="mt-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <NavigationMenuLink
                      render={<Link href={link.href} />}
                      className="block py-2.5 text-body-lg font-medium text-ink transition-colors duration-base hover:text-brand"
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
              {index === 0
                ? (
                    <NavigationMenuLink
                      render={<Link href={department.href} />}
                      className="mt-3 inline-flex items-center gap-1.5 text-body font-bold text-brand hover:text-brand-700"
                    >
                      {department.allLabel}
                      <ArrowRightIcon aria-hidden className="size-4" />
                    </NavigationMenuLink>
                  )
                : null}
            </div>
          );
        })}
      </div>
      {department.featured.map((product, index) => (
        // Em 1100px cabe um card ao lado das colunas e do drop; o segundo entra a partir do xl.
        <div key={product.id} className={index === 0 ? 'flex' : 'hidden xl:flex'}>
          <MenuProductCard product={product} />
        </div>
      ))}
      {promo}
    </PageContainer>
  );
}
