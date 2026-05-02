import { PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

export abstract class BaseEntity {

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

}
