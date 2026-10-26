import { count, eq } from 'drizzle-orm';

import { Injectable } from '@kernel/decorators/Injectable';
import { Account } from '@application/entities/Account';
import { DrizzleClient } from '@infra/database/drizzle/DrizzleClient';
import { accounts } from '@infra/database/drizzle/schema';

@Injectable()
export class AccountRepository {
  constructor(private readonly drizzle: DrizzleClient) {}

  async findById(id: string): Promise<Account | null> {
    const [row] = await this.drizzle.db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id))
      .limit(1);

    return row ? new Account(row) : null;
  }

  async findByEmail(email: string): Promise<Account | null> {
    const [row] = await this.drizzle.db
      .select()
      .from(accounts)
      .where(eq(accounts.email, email))
      .limit(1);

    return row ? new Account(row) : null;
  }

  async count(): Promise<number> {
    const [row] = await this.drizzle.db.select({ total: count() }).from(accounts);

    return row?.total ?? 0;
  }

  async create(account: Account, tx?: DrizzleClient.Transaction): Promise<void> {
    if (!account.externalId) {
      throw new Error(`Account ${account.id} has no externalId and cannot be persisted.`);
    }

    const executor = tx ?? this.drizzle.db;

    await executor.insert(accounts).values({
      id: account.id,
      externalId: account.externalId,
      email: account.email,
      createdAt: account.createdAt,
    });
  }

  async delete(id: string, tx?: DrizzleClient.Transaction): Promise<void> {
    const executor = tx ?? this.drizzle.db;

    await executor.delete(accounts).where(eq(accounts.id, id));
  }
}
