import { Collection, Entity, ManyToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Book } from '.';

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
