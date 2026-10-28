import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon, ImageIcon } from 'lucide-react';

import { productCountLabel } from '@/features/store/catalog/model/departments';
import type { Department } from '@/features/store/catalog/model/types';

type DepartmentCardProps = {
  department: Department;
};

// A sombra é uma camada (::after) que só troca a opacidade, porque animar o box-shadow repinta a cada quadro; fica
// fora da moldura com overflow-hidden, que a cortaria.
export function DepartmentCard({ department }: DepartmentCardProps) {
  return (
    <Link
      href={department.href}
      className="group relative block rounded-card transition-transform duration-slow ease-out after:pointer-events-none after:absolute after:inset-0 after:rounded-card after:opacity-0 after:shadow-pop after:transition-opacity after:duration-slow hover:-translate-y-1 hover:after:opacity-100 focus-visible:-translate-y-1 focus-visible:after:opacity-100 active:translate-y-0"
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-card bg-paper-stone md:aspect-3/4">
        <div className="absolute inset-0 transition-transform duration-slow ease-out group-hover:scale-105 group-focus-visible:scale-105">
          {department.imageUrl
            ? (
                <Image
                  src={department.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1440px) 448px, (min-width: 960px) 33vw, 100vw"
                  className="object-cover"
                />
              )
            : <ImageIcon aria-hidden className="absolute inset-0 m-auto size-8 text-gray-500" />}
        </div>
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-2xl bg-gray-0 py-2 pr-2 pl-5">
          <div className="min-w-0">
            <h3 className="truncate type-display text-display-sm not-italic lg:text-display-md">{department.name}</h3>
            <p className="text-caption text-gray-700">{productCountLabel(department.productCount)}</p>
          </div>
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-gray-0 transition-colors duration-base group-hover:bg-brand-600 group-focus-visible:bg-brand-600"
          >
            <ArrowRightIcon className="size-4.5 transition-transform duration-slow ease-out group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
