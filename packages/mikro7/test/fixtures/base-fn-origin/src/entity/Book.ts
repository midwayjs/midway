import { Cascade, Collection, type Rel } from '@mikro-orm/core';
import {
  Entity,
  ManyToMany,
  ManyToOne,
  Property,
} from '@mikro-orm/decorators/legacy';
import { Author } from './Author.js';
import { BookTag } from './BookTag.js';
import { Publisher } from './Publisher.js';
import { BaseEntity } from './BaseEntity.js';

@Entity()
export class Book extends BaseEntity {

  @Property()
  title: string;

  @ManyToOne(() => Author)
  author: Rel<Author>;

  @ManyToOne(() => Publisher, { cascade: [Cascade.PERSIST, Cascade.REMOVE], nullable: true })
  publisher?: Rel<Publisher>;

  @ManyToMany(() => BookTag)
  tags = new Collection<BookTag>(this);

  @Property({ nullable: true })
  metaObject?: object;

  @Property({ nullable: true })
  metaArray?: any[];

  @Property({ nullable: true })
  metaArrayOfStrings?: string[];

  constructor(title: string, author: Rel<Author>) {
    super();
    this.title = title;
    this.author = author;
  }

}
