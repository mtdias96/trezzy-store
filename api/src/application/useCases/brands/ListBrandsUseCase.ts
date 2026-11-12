import { Injectable } from '@kernel/decorators/Injectable';
import { BrandRepository } from '@infra/database/repositories/BrandRepository';

// O ORDER BY do banco compara bytes: "Óculos" iria para depois do "z" e "adidas" para depois do "Vans".
const byName = new Intl.Collator('pt-BR', { sensitivity: 'base' });

@Injectable()
export class ListBrandsUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(): Promise<ListBrandsUseCase.Output> {
    const brands = await this.brandRepository.findAll();

    return { brands: brands.sort((a, b) => byName.compare(a.name, b.name)) };
  }
}

export namespace ListBrandsUseCase {
  export type Output = {
    brands: { id: string; name: string; active: boolean }[];
  };
}
