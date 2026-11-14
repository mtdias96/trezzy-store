import { randomUUID } from 'node:crypto';

import { Injectable } from '@kernel/decorators/Injectable';
import { colorNameIssues, type ColorwayProduct, familyLinkIssues } from '@application/entities/colorway';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import { ValidationError } from '@application/errors/ValidationError';
import { DrizzleClient } from '@infra/database/drizzle/DrizzleClient';
import { ProductFamilyRepository } from '@infra/database/repositories/ProductFamilyRepository';
import { ProductRepository } from '@infra/database/repositories/ProductRepository';

// A família onde o produto termina. O produto de origem ainda sem família ganha uma nova.
function destinationFamily(product: ColorwayProduct, familyOf: string | null | undefined, target: ColorwayProduct | null): string | null {
  if (familyOf === undefined) {
    return product.familyId;
  }

  if (!target) {
    return null;
  }

  return target.familyId ?? randomUUID();
}

@Injectable()
export class SetProductColorwayUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productFamilyRepository: ProductFamilyRepository,
    private readonly drizzle: DrizzleClient,
  ) {}

  async execute({ productId, colorName, familyOf }: SetProductColorwayUseCase.Input): Promise<void> {
    const [product, target] = await Promise.all([
      this.productRepository.findColorway(productId),
      familyOf ? this.productRepository.findColorway(familyOf) : null,
    ]);

    if (!product) {
      throw new ApplicationError(ErrorCode.NOT_FOUND, 'Product not found.');
    }

    const familyIssues = familyOf ? familyLinkIssues(product, target) : [];

    if (familyIssues.length > 0) {
      throw new ValidationError(familyIssues);
    }

    const familyId = destinationFamily(product, familyOf, target);
    const siblings = familyId === null ? null : await this.siblingsIn(familyId, product.id, target);
    const colorIssues = colorNameIssues(colorName, siblings);

    if (colorIssues.length > 0) {
      throw new ValidationError(colorIssues);
    }

    await this.drizzle.transaction(async (tx) => {
      if (target && familyId && target.familyId === null) {
        await this.productFamilyRepository.create(familyId, tx);
        await this.productRepository.setColorway(target.id, { familyId, colorName: target.colorName }, tx);
      }

      await this.productRepository.setColorway(product.id, { familyId, colorName }, tx);

      if (product.familyId && product.familyId !== familyId) {
        await this.productFamilyRepository.deleteIfAlone(product.familyId, tx);
      }
    });
  }

  // As outras cores da família de destino. Família nova: só o produto de origem.
  private async siblingsIn(familyId: string, productId: string, target: ColorwayProduct | null) {
    if (target && target.familyId === null) {
      return [target];
    }

    const members = await this.productRepository.findFamilyMembers(familyId);

    return members.filter(({ id }) => id !== productId);
  }
}

export namespace SetProductColorwayUseCase {
  export type Input = {
    productId: string;
    colorName: string | null;
    // undefined: fica na família atual. null: sai dela. Um id: entra na família desse produto.
    familyOf?: string | null;
  };
}
