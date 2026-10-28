import { DepartmentShowcase } from '@/features/store/departments/components/department-showcase';
import { listDepartments } from '@/features/store/departments/data/queries';

type DepartmentShowcaseContainerProps = {
  title: string;
};

// Sem departamentos (ou com a API fora do ar), a seção não aparece.
export async function DepartmentShowcaseContainer({ title }: DepartmentShowcaseContainerProps) {
  const departments = await listDepartments();

  return departments.length > 0 ? <DepartmentShowcase title={title} departments={departments} /> : null;
}
