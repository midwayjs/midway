import {
  Cascade,
  Collection,
  OptionalProps,
  type Rel,
} from '@mikro-orm/core';
import {
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/decorators/legacy';

import { Book } from './Book.js';
import { BaseEntity } from './BaseEntity.js';

@Entity()
export class Author extends BaseEntity {

  [OptionalProps]?: 'termsAccepted';

  @Property()
  name: string;

  @Property()
  email: string;

  @Property({ nullable: true })
  age?: number;

  @Property()
  termsAccepted: boolean = false;

  @Property({ nullable: true })
  born?: Date;

  @OneToMany(() => Book, b => b.author, { cascade: [Cascade.ALL] })
  books = new Collection<Book>(this);

  @ManyToOne(() => Book, { nullable: true })
  favouriteBook?: Rel<Book>;

  constructor(name: string, email: string) {
    super();
    this.name = name;
    this.email = email;
  }

}
