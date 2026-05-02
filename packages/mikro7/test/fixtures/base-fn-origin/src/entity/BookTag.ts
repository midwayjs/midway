import { Collection } from '@mikro-orm/core';
import {
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy';
import { Book } from './Book.js';

@Entity()
export class BookTag {

  @PrimaryKey()
  id!: number;

  @Property()
  name: string;

  @ManyToMany(() => Book, b => b.tags)
  books: Collection<Book> = new Collection<Book>(this);

  constructor(name: string) {
    this.name = name;
  }

}
