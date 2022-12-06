# MikroORM

This section describes how users use MikroORM in midway.  MikroORM is the TypeScript ORM of Node.js based on data mapper, working unit and identity mapping mode.

The MikroORM official website document is [here](https://mikro-orm.io/docs).

Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |


## Installation Components


Install mikro components to provide access to mikro-orm.


```bash
$ npm i @midwayjs/mikro@3 @mikro-orm/core --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/mikro": "^3.0.0",
    "@mikro-orm/core": "^5.3.1 ",
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```

At the same time, it is also necessary to introduce the adaptation package of the corresponding database.

For example:

```typescript
{
  "dependencies": {
    // sqlite
    "@mikro-orm/sqlite": "^5.3.1 ",

    // mysql
    "@mikro-orm/mysql": "^5.3.1 ",
  },
  "devDependencies": {
    // ...
  }
}
```

For more information about drivers, see [Official documentation](https://mikro-orm.io/docs/usage-with-sql/).



## Introducing components


The mikro component is introduced in `src/configuration.ts`, as an example.

```typescript
// configuration.ts
import { Configuration } from '@midwayjs/decorator';
import * as mikro from '@midwayjs/mikro';
import { join } from 'path';

@Configuration({
  imports: [
    // ...
    Mikro // load mikro components
  ],
  importConfigs: [
  	join(__dirname, './config')
  ]
})
export class MainConfiguration {

}
```



## Basic use

Similar to other orm frameworks, they are divided into several steps:

- 1. Define Entity
- 2. Configure the data source
- 3. Get the EntityModel to call

For more information about Entity code, see [Example](https://github.com/midwayjs/midway/tree/main/packages/mikro/test/fixtures/base-fn-origin).



### Define Entity

Entity that defines the basis.

```typescript
// src/entity/BaseEntity.ts
import { PrimaryKey, Property } from '@mikro-orm/core';

export abstract class BaseEntity {

  @PrimaryKey()
  id! : number;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

}
```

Define the actual Entity, including one-to-many, many-to-many relationships.

```typescript
import { Cascade, Collection, Entity, ManyToMany, ManyToOne, Property } from '@mikro-orm/core';
import { Author, BookTag, Publisher } from './index';
import { BaseEntity } from './BaseEntity';

@Entity()
export class Book extends BaseEntity {

  @Property()
  title: string;

  @ManyToOne(() => Author)
  author: Author;

  @ManyToOne(() => Publisher, { cascade: [Cascade.PERSIST, Cascade.REMOVE], nullable: true })
  publisher?: Publisher;

  @ManyToMany(() => BookTag)
  tags = new Collection<BookTag>(this);

  @Property({ nullable: true })
  metaObject?: object;

  @Property({ nullable: true })
  metaArray?: any[];

  @Property({ nullable: true })
  metaArrayOfStrings?: string[];

  constructor(title: string, author: Author) {
    super();
    this.title = title;
    this.author = author;
  }

}
```



### Configure the data source

```typescript

// src/config/config.default
import { Author, BaseEntity, Book, BookTag, Publisher } from '../entity';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { join } from 'path';

export default (appInfo) => {
  return {
    mikro: {
      dataSource: {
        default: {
          entities: [Author, Book, BookTag, Publisher, BaseEntity]
          dbName: join(__dirname, '../../test.sqlite')
          Type: 'sqlite', // SQLite is used as an example here.
          highlighter: new SqlHighlighter()
          debug: true
          allowGlobalContext: true
        }
      }
    }
  }
}

```

For association in the form of a directory scan, please refer to [Data Source Management](../data_source).



### Call Repository

Use `InjectRepository` injection `repository` objects in business code to perform database operations.

```typescript
import { Book } from './entity';
import { Provide } from '@midwayjs/decorator';
import { InjectRepository } from '@midwayjs/mikro';
import { EntityRepository, QueryOrder, wrap } from '@mikro-orm/core';

@Provide()
export class BookController {

  @InjectRepository(Book)
  bookRepository: EntityRepository<Book>;

  async findBookAndQuery() {
    const book = this.bookRepository.create({ title: 'b1', author: { name: 'a1', email: 'e1' } });
    wrap(book.author, true).__initialized = true;
    await this.bookRepository.persist(book).flush();

    const findResult = await this.bookRepository.findAll({
      populate: ['author']
      orderBy: { title: QueryOrder.DESC}
      limit: 20
    });

  }
}
```

## Advanced Features

### Get data source

The data source is the created data source object, which we can obtain by injecting the built-in data source manager.

```typescript
import { Configuration } from '@midwayjs/decorator';
import { MikroDataSourceManager } from '@midwayjs/mikro';

@Configuration({
  //...
})
export class MainConfiguration {

  async onReady(container: IMidwayContainer) {
    const dataSourceManager = await container. getAsync(MikroDataSourceManager);
    const orm = dataSourceManager.getDataSource('default');
    const connection = orm.em.getConnection();
    //...
  }
}
```

Starting with v3.8.0, it is also possible to inject via a decorator.

```typescript
import { Configuration } from '@midwayjs/decorator';
import { InjectDataSource } from '@midwayjs/mikro';
import { MikroORM, IDatabaseDriver, Connection } from '@mikro-orm/core';

@Configuration({
  //...
})
export class MainConfiguration {
  
  // Inject the default data source
  @InjectDataSource()
  defaultDataSource: MikroORM<IDatabaseDriver<Connection>>;
  
  // inject custom data source
  @InjectDataSource('default1')
  customDataSource: MikroORM<IDatabaseDriver<Connection>>;

  async onReady(container: IMidwayContainer) {
    //...
  }
}
```



## Frequently Asked Questions



### 1. Node version

Mikro-orm there are some restrictions on Node version, it must be `>= 14.0.0`, so do the usage rules of `@midwayjs/mikro` components.



### 2. Identity Map

Mikro-orm internal query has a concept of [Identity Map](https://mikro-orm.io/docs/identity-map). Midway has added this function to all built-in Framework middleware. If it is used in non-requesting link call scenarios, such as `src/configuration`, the `allowGlobalContext` option can be turned on.



### 3. Multi-dataSource support

Like other databases, Midway supports the configuration of multiple data sources.

```typescript
// src/config/config.default
import { Author, BaseEntity, Book, BookTag, Publisher } from '../entity';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { join } from 'path';

export default (appInfo) => {
  return {
    mikro: {
      dataSource: {
        custom1: {
          // ...
        },
        custom2: {
          // ...
        }
      }
    }
  }
}
```

Note which data source you need to pass from when using.

```typescript
// ...

@Provide()
export class BookController {

  @InjectRepository(Book, 'custom1')
  bookRepository: EntityRepository<Book>;

  async findBookAndQuery() {
    // ...
  }
}
```

