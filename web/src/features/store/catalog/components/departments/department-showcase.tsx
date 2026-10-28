import { PageContainer } from '@/components/store/layout/page-container';
import type { Department } from '@/features/store/catalog/model/types';

import { DepartmentCard } from './department-card';

type DepartmentShowcaseProps = {
  title: string;
  departments: readonly Department[];
};

export function DepartmentShowcase({ title, departments }: DepartmentShowcaseProps) {
  return (
    <section aria-labelledby="departments-title">
      <PageContainer className="pt-2 pb-12 lg:pb-20">
        <h2 id="departments-title" className="type-display text-display-lg not-italic sm:text-display-xl lg:text-display-2xl">
          {title}
        </h2>
        <ul className="mt-5 grid gap-3 md:grid-cols-3 md:gap-4 lg:mt-6">
          {departments.map((department) => (
            <li key={department.slug}>
              <DepartmentCard department={department} />
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
