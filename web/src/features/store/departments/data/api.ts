import 'server-only';

import * as z from 'zod';

import { http } from '@/lib/http';

// Contrato da rota pública dos departamentos da vitrine. Ainda não existe na API (web/AGENTS.md, Pendências).

const departmentSchema = z.object({
  // Vira a URL do departamento (/streetwear): só minúsculas, números e hífen.
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  productCount: z.number().int().nonnegative(),
  imageUrl: z.url().nullable(),
});

export type DepartmentDto = z.infer<typeof departmentSchema>;

// GET /store/departments → { departments }, na ordem da vitrine
export async function fetchDepartments(): Promise<DepartmentDto[]> {
  const { departments } = await http('/store/departments', {
    schema: z.object({ departments: z.array(departmentSchema) }),
  });

  return departments;
}
