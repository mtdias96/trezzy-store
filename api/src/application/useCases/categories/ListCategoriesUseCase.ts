import { Injectable } from '@kernel/decorators/Injectable';
import type { SizeGrid } from '@application/entities/sizeGrids';
import { CategoryRepository } from '@infra/database/repositories/CategoryRepository';

// O ORDER BY do banco compara bytes: "Óculos" iria para depois do "z".
const byName = new Intl.Collator('pt-BR', { sensitivity: 'base' });

@Injectable()
export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(): Promise<ListCategoriesUseCase.Output> {
    const categories = await this.categoryRepository.findAll();

    return { categories: categories.sort((a, b) => byName.compare(a.name, b.name)) };
  }
}

export namespace ListCategoriesUseCase {
  export type Output = {
    categories: { id: string; name: string; grid: SizeGrid; active: boolean }[];
  };
}
