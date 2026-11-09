import { PageContainer } from '@/components/store/layout/page-container';
import { SectionHeading } from '@/components/store/layout/section-heading';
import type { Department } from '@/features/store/catalog/model/types';

import { DepartmentCard } from './department-card';

type DepartmentShowcaseProps = {
  eyebrow: string;
  title: string;
  description: string;
  departments: readonly Department[];
};

export function DepartmentShowcase({ eyebrow, title, description, departments }: DepartmentShowcaseProps) {
  return (
    <section aria-labelledby="departments-title">
      <PageContainer>
        <SectionHeading id="departments-title" eyebrow={eyebrow} title={title} description={description} />
        <ul className="mt-5 grid gap-8 sm:grid-cols-3 sm:gap-4 lg:mt-8">
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
