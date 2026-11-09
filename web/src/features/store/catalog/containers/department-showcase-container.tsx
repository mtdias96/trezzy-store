import { DepartmentShowcase } from '@/features/store/catalog/components/departments/department-showcase';
import { listDepartments } from '@/features/store/catalog/data/queries';

type DepartmentShowcaseContainerProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export async function DepartmentShowcaseContainer({ eyebrow, title, description }: DepartmentShowcaseContainerProps) {
  const departments = await listDepartments();

  return departments.length > 0
    ? <DepartmentShowcase eyebrow={eyebrow} title={title} description={description} departments={departments} />
    : null;
}
