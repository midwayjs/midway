import { Entity, PrimaryKey } from '@mikro-orm/decorators/legacy';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;
}
