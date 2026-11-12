import { and, eq, inArray, isNull } from 'drizzle-orm';

import { Injectable } from '@kernel/decorators/Injectable';
import { Media } from '@application/entities/Media';
import { DrizzleClient } from '@infra/database/drizzle/DrizzleClient';
import { brands, productMedia } from '@infra/database/drizzle/schema/catalog';
import { media } from '@infra/database/drizzle/schema/media';

@Injectable()
export class MediaRepository {
  constructor(private readonly drizzle: DrizzleClient) {}

  async findById(id: string): Promise<Media | null> {
    const [row] = await this.drizzle.db
      .select({
        id: media.id,
        key: media.key,
        contentType: media.contentType,
        sizeBytes: media.sizeBytes,
        uploadedAt: media.uploadedAt,
      })
      .from(media)
      .where(eq(media.id, id))
      .limit(1);

    return row ? new Media(row) : null;
  }

  // "Em uso" cobre todo lugar que aponta para `media`: recurso novo com foto entra nesta consulta.
  // Join, e não subconsulta com sql``: numa subconsulta o Drizzle solta o nome da tabela, e o "id" passaria a ser o dela.
  async findUsage(ids: readonly string[]): Promise<MediaRepository.Usage[]> {
    if (ids.length === 0) {
      return [];
    }

    const rows = await this.drizzle.db
      .select({
        id: media.id,
        uploadedAt: media.uploadedAt,
        productId: productMedia.productId,
        brandId: brands.id,
      })
      .from(media)
      .leftJoin(productMedia, eq(productMedia.mediaId, media.id))
      .leftJoin(brands, eq(brands.logoMediaId, media.id))
      .where(inArray(media.id, [...ids]));

    // O mesmo logo pode estar em mais de uma marca: uma linha por mídia.
    const usageById = new Map<string, MediaRepository.Usage>();

    for (const { id, uploadedAt, productId, brandId } of rows) {
      const inUse = productId !== null || brandId !== null || usageById.get(id)?.inUse === true;

      usageById.set(id, { id, uploadedAt, inUse });
    }

    return [...usageById.values()];
  }

  async create(item: Media, tx?: DrizzleClient.Transaction): Promise<void> {
    await (tx ?? this.drizzle.db).insert(media).values({
      id: item.id,
      key: item.key,
      contentType: item.contentType,
      sizeBytes: item.sizeBytes,
    });
  }

  // Só a primeira confirmação grava a data.
  async markUploaded(id: string, tx?: DrizzleClient.Transaction): Promise<void> {
    await (tx ?? this.drizzle.db)
      .update(media)
      .set({ uploadedAt: new Date() })
      .where(and(eq(media.id, id), isNull(media.uploadedAt)));
  }
}

export namespace MediaRepository {
  export type Usage = {
    id: string;
    uploadedAt: Date | null;
    inUse: boolean;
  };
}
