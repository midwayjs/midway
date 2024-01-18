import { Entity, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class Author {
  @PrimaryKey()
  id!: number;
}
