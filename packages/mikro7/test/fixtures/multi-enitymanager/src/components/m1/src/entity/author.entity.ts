import { Entity, PrimaryKey } from '@mikro-orm/decorators/legacy';

@Entity()
export class Author {
  @PrimaryKey()
  id!: number;
}
