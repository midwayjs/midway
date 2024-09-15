import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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



## About upgrade

* Starting from the `v3.14.0` version of the component, mikro v5/v6 versions are supported. Since there are major changes from mikro v5 to v6, if you want to upgrade from an old version of mikro, please read [Upgrading from v5 to v6](https:/ /mikro-orm.io/docs/upgrading-v5-to-v6)
* Component examples updated to v6



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
    "@mikro-orm/core": "^6.0.2",
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
    "@mikro-orm/sqlite": "^6.0.2",

    // mysql
    "@mikro-orm/mysql": "^6.0.2",
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
import { Configuration } from '@midwayjs/core';
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


### Directory structure

A basic reference directory structure is as follows.


```
MyProject
├── src
│   ├── config
│   │   └── config.default.ts
│   ├── entity
│   │   ├── book.entity.ts
│   │   ├── index.ts
│   │   └── base.ts
│   ├── configuration.ts
│   └── service
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```


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
// src/entity/book.entity.ts
import { Cascade, Collection, Entity, ManyToMany, ManyToOne, Property } from '@mikro-orm/core';
import { Author, BookTag, Publisher } from './index';
import { BaseEntity } from './base';

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

mikro v5 and v6 are slightly different.

<Tabs>
<TabItem value="v6" label="mikro v6">

```typescript
// src/config/config.default
import { Author, BaseEntity, Book, BookTag, Publisher } from '../entity';
import { join } from 'path';
import { SqliteDriver } from '@mikro-orm/sqlite';

export default (appInfo) => {
  return {
    mikro: {
      dataSource: {
        default: {
          dbName: join(__dirname, '../../test.sqlite'),
          driver: SqliteDriver,		// SQLite is used as an example here.
          allowGlobalContext: true,
          // Object format
          entities: [Author, Book, BookTag, Publisher, BaseEntity],
          // The following scanning form is supported. For compatibility, we can match both .js and .ts files at the same time
          entities: [
            'entity',                        // Specify the directory
            '**/entity/*.entity.{j,t}s',     // Wildcard with suffix matching
          ],
        }
      }
    }
  }
}
```

</TabItem>

<TabItem value="v5" label="mikro v5">

```typescript

// src/config/config.default
import { Author, BaseEntity, Book, BookTag, Publisher } from '../entity';
import { join } from 'path';

export default (appInfo) => {
  return {
    mikro: {
      dataSource: {
        default: {
          dbName: join(__dirname, '../../test.sqlite')
          Type: 'sqlite', // SQLite is used as an example here.
          allowGlobalContext: true,
          // Object format
          entities: [Author, Book, BookTag, Publisher, BaseEntity],
          // The following scanning form is supported. For compatibility, we can match both .js and .ts files at the same time
          entities: [
            'entity',                        // Specify the directory
            '**/entity/*.entity.{j,t}s',     // Wildcard with suffix matching
          ],
        }
      }
    }
  }
}

```

</TabItem>
</Tabs>

:::tip

The `entities` field configuration of mikro has been processed by the framework, please do not refer to the original document.

:::



### CRUD Operations

Use `InjectRepository` to inject `Repository` to perform simple query operations. And use `InjectEntityManager` to get the instance of `EntityManager`, to perform creating, updating and deleting operations.
You can also get `EntityManager` by calling `repository.getEntityManger()`.

:::caution

* 1. Since v5.7, `persist` and `flush` etc. on `Repository` (shortcuts to methods on `EntityManager`) were marked as *deprecated*, and [planned to remove them in v6](https://github.com/mikro-orm/mikro-orm/discussions/3989). Please use those APIs on `EntityManger` directly instead of on `Repository`.
* 2. v6 has been completely [deprecated](https://mikro-orm.io/docs/upgrading-v5-to-v6#removed-methods-from-entityrepository) the above interface

:::

```typescript
// src/service/book.service.ts
import { Book } from './entity/book.entity';
import { Provide } from '@midwayjs/core';
import { InjectEntityManager, InjectRepository } from '@midwayjs/mikro';
import { QueryOrder } from '@mikro-orm/core';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql'; // should be imported from driver specific packages

@Provide()
export class BookService {

  @InjectRepository(Book)
  bookRepository: EntityRepository<Book>;

  @InjectEntityManager()
  em: EntityManager;

  async queryByRepo() {
    // query with Repository
    const books = await this.bookRepository.findAll({
      populate: ['author'],
      orderBy: { title: QueryOrder.DESC },
      limit: 20,
    });
    return books;
  }

  async createBook() {
    const book = new Book({ title: 'b1', author: { name: 'a1', email: 'e1' } });
    // mark book as persisted
    this.em.persist(book);
    // persist all changes to database
    await this.em.flush();
    return book;
  }
}
```

## Advanced Features

### Get data source

The data source is the created data source object, which we can obtain by injecting the built-in data source manager.

```typescript
import { Configuration } from '@midwayjs/core';
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
import { Configuration } from '@midwayjs/core';
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



### Logging

Midway's logger can be added to mikro through configuration to record SQL and other information.

```typescript
// src/config/config.default.ts
exporg default {
	midwayLogger: {
    clients: {
      mikroLogger: {
        // ...
      }
    }
  },
  mikro: {
    dataSource: {
      default: {
        entities: [Author, Book, BookTag, Publisher, BaseEntity],
        // ...
        logger: 'mikroLogger',
      }
    },
  }
}
```

By default mikro comes with colors and also writes them to files, which can be turned off through configuration.

```typescript
// src/config/config.default.ts
exporg default {
	midwayLogger: {
    clients: {
      mikroLogger: {
        transports: {
          console: {
            autoColors: false,
          }，
          file: {
            fileLogName: 'mikro.log'，
          },
        },
      }
    }
  },
  mikro: {
    dataSource: {
      default: {
        entities: [Author, Book, BookTag, Publisher, BaseEntity],
        // ...
        logger: 'mikroLogger',
        colors: false,
      }
    },
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

