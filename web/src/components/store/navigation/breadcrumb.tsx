import type { Route } from 'next';
import Link from 'next/link';

type BreadcrumbProps = {
  trail: readonly { name: string; href: Route }[];
  current: string;
};

export function Breadcrumb({ trail, current }: BreadcrumbProps) {
  return (
    <nav aria-label="Trilha de navegação">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-gray-700">
        {trail.map(({ name, href }) => (
          <li key={href} className="flex items-center gap-2">
            <Link href={href} className="hover:text-ink hover:underline">
              {name}
            </Link>
            <span aria-hidden className="text-gray-500">/</span>
          </li>
        ))}
        <li aria-current="page" className="font-semibold text-ink">
          {current}
        </li>
      </ol>
    </nav>
  );
}
