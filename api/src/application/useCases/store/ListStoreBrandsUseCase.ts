import { Injectable } from '@kernel/decorators/Injectable';
import { BrandRepository } from '@infra/database/repositories/BrandRepository';
import { MediaStorageGateway } from '@infra/gateways/MediaStorageGateway';

const byName = new Intl.Collator('pt-BR', { sensitivity: 'base' });

@Injectable()
export class ListStoreBrandsUseCase {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly mediaStorageGateway: MediaStorageGateway,
  ) {}

  // Sem curadoria no painel ainda: as marcas com mais produtos vêm primeiro.
  async execute({ limit }: ListStoreBrandsUseCase.Input): Promise<ListStoreBrandsUseCase.Output> {
    const brands = await this.brandRepository.findStorefront();
    const ranked = brands
      .sort((a, b) => b.productCount - a.productCount || byName.compare(a.name, b.name))
      .slice(0, limit);

    return { brands: ranked.map((brand) => this.toBrand(brand)) };
  }

  private toBrand({ slug, name, productCount, logoKey }: BrandRepository.StorefrontItem): ListStoreBrandsUseCase.Brand {
    return { slug, name, productCount, imageUrl: logoKey ? this.mediaStorageGateway.getPublicUrl(logoKey) : null };
  }
}

export namespace ListStoreBrandsUseCase {
  export type Input = {
    limit: number;
  };

  export type Brand = { slug: string; name: string; productCount: number; imageUrl: string | null };

  export type Output = {
    brands: Brand[];
  };
}
