import 'server-only';

import type { DepartmentDto } from './api';

// PRÉVIA (não commitar): os departamentos do design, sem foto, até a rota existir. O queries.ts importa daqui em vez
// do api.ts.

const DEPARTMENTS: DepartmentDto[] = [
  { slug: 'streetwear', name: 'Streetwear', productCount: 8, imageUrl: null },
  { slug: 'sneakers', name: 'Sneakers', productCount: 4, imageUrl: null },
  { slug: 'eyewear', name: 'Eyewear', productCount: 4, imageUrl: null },
];

export async function fetchDepartments(): Promise<DepartmentDto[]> {
  return DEPARTMENTS;
}
