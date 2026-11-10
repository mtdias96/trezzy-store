import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon, ImageIcon } from 'lucide-react';

import { productCountLabel } from '@/features/store/catalog/model/departments';
import type { Department } from '@/features/store/catalog/model/types';

type DepartmentCardProps = {
  department: Department;
};

const CATEGORY_LIMIT = 4;

// A foto leva ao departamento, como o "Ver tudo": ela sai do teclado e do leitor de tela, que já têm o link em texto.
export function DepartmentCard({ department }: DepartmentCardProps) {
  return (
    <article className="flex flex-col">
      <Link
        href={department.href}
        tabIndex={-1}
        aria-hidden
        className="group relative block aspect-4/3 overflow-hidden rounded-tile bg-surface-media sm:aspect-10/11"
      >
        <div className="absolute inset-0 transition-transform duration-slow ease-out group-hover:scale-105">
          {department.imageUrl
            ? (
                <Image
                  src={department.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1440px) 448px, (min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
              )
            : <ImageIcon className="absolute inset-0 m-auto size-8 text-gray-500" />}
        </div>
        <span className="absolute top-3 left-3 rounded-pill bg-gray-0 px-3 py-1.5 text-caption font-bold text-ink">
          {productCountLabel(department.productCount)}
        </span>
        <span className="absolute right-3 bottom-3 flex h-ctl-lg items-center gap-3 rounded-pill bg-gray-0 pr-1.5 pl-4 text-body font-bold text-ink">
          Comprar
          <span className="flex size-8 items-center justify-center rounded-pill bg-ink text-gray-0">
            <ArrowRightIcon className="size-4 transition-transform duration-slow ease-out group-hover:translate-x-0.5" />
          </span>
        </span>
      </Link>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="truncate text-title font-bold text-ink">{department.name}</h3>
        <Link
          href={department.href}
          className="shrink-0 text-body font-bold text-ink underline underline-offset-4 hover:text-brand"
        >
          Ver tudo
          <span className="sr-only">{` em ${department.name}`}</span>
        </Link>
      </div>
      <ul aria-label={`Categorias de ${department.name}`} className="mt-3 flex flex-wrap gap-2">
        {department.categories.slice(0, CATEGORY_LIMIT).map((category) => (
          <li key={category.href}>
            <Link
              href={category.href}
              className="flex h-ctl-sm items-center rounded-pill border border-line px-3.5 text-body-sm text-ink transition-colors duration-base hover:border-ink"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
