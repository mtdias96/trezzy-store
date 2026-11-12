import { and, eq, isNull } from 'drizzle-orm';

import { Injectable } from '@kernel/decorators/Injectable';
import { Media } from '@application/entities/Media';
import { DrizzleClient } from '@infra/database/drizzle/DrizzleClient';
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
