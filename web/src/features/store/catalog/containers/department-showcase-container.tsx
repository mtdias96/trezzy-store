import { DepartmentShowcase } from '@/features/store/catalog/components/departments/department-showcase';
import { listDepartments } from '@/features/store/catalog/data/queries';

type DepartmentShowcaseContainerProps = {
  title: string;
};

export async function DepartmentShowcaseContainer({ title }: DepartmentShowcaseContainerProps) {
  const departments = await listDepartments();

  return departments.length > 0 ? <DepartmentShowcase title={title} departments={departments} /> : null;
}
