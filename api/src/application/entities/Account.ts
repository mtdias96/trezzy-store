import { randomUUID } from 'node:crypto';

export class Account {
  readonly id: string;
  readonly email: string;
  externalId: string | undefined;
  readonly createdAt: Date;

  constructor(attr: Account.Attributes) {
    this.id = attr.id ?? randomUUID();
    this.email = attr.email;
    this.externalId = attr.externalId;
    this.createdAt = attr.createdAt ?? new Date();
  }
}

export namespace Account {
  export type Attributes = {
    email: string;
    id?: string;
    externalId?: string;
    createdAt?: Date;
  };
}
