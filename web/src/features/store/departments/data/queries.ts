import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import type { Department } from '@/features/store/departments/model/types';
import { isRequestFailure } from '@/lib/http';
import { pendingRoute } from '@/lib/route';

import { type DepartmentDto, fetchDepartments } from './api';

function toDepartment({ slug, name, productCount, imageUrl }: DepartmentDto): Department {
  return { slug, name, productCount, imageUrl, href: pendingRoute(`/${slug}`) };
}

// Conteúdo público, igual para todo visitante: entra no shell estático. Com a API fora do ar, a seção some, e a
// entrada vale minutos, para ela voltar logo.
export async function listDepartments(): Promise<Department[]> {
  'use cache';
  cacheTag('catalog');

  try {
    const departments = await fetchDepartments();

    cacheLife('hours');

    return departments.map(toDepartment);
  } catch (error) {
    if (!isRequestFailure(error)) {
      throw error;
    }

    cacheLife('minutes');

    return [];
  }
}
