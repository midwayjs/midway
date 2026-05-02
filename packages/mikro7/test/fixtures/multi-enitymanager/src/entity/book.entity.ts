import { Entity, PrimaryKey } from '@mikro-orm/decorators/legacy';

@Entity()
export class Book {
  @PrimaryKey()
  id!: number;
}
