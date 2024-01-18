import { Entity, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class Book {
  @PrimaryKey()
  id!: number;
}
