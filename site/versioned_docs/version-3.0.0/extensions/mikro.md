import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MikroORM

本章节介绍用户如何在 midway 中使用 MikroORM。 MikroORM 是基于数据映射器、工作单元和身份映射模式的 Node.js 的 TypeScript ORM。

MikroORM 的官网文档在 [这里](https://mikro-orm.io/docs)。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ✅    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |



## 关于升级

* 从 `v3.14.0` 版本的组件开始，支持 mikro v5/v6 版本，由于 mikro v5 到 v6 有较大的变化，如从 mikro 老版本升级请提前阅读 [Upgrading from v5 to v6](https://mikro-orm.io/docs/upgrading-v5-to-v6)
* 组件示例已更新为 v6 版本



## 安装组件


安装 mikro 组件，提供接入 mikro-orm 的能力。


```bash
$ npm i @midwayjs/mikro@3 @mikro-orm/core --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

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

同时，还需要引入对应数据库的适配包。

比如：

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

更多驱动程序请查看 [官方文档](https://mikro-orm.io/docs/usage-with-sql/)。



## 引入组件


在 `src/configuration.ts` 引入 mikro 组件，示例如下。

```typescript
// configuration.ts
import { Configuration } from '@midwayjs/core';
import * as mikro from '@midwayjs/mikro';
import { join } from 'path';

@Configuration({
  imports: [
    // ...
    mikro				// 加载 mikro 组件
  ],
  importConfigs: [
  	join(__dirname, './config')
  ]
})
export class MainConfiguration {

}
```



## 基础使用

和其他 orm 框架类似，都是分为几个步骤：

- 1、定义 Entity
- 2、配置数据源
- 3、获取 EntityModel 进行调用

下面的更多 Entity 代码请查看 [示例](https://github.com/midwayjs/midway/tree/main/packages/mikro/test/fixtures/base-fn-origin)。



### 目录结构

一个基础的参考目录结构如下。

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



### 定义 Entity

定义基础的 Entity。

```typescript
// src/entity/BaseEntity.ts
import { PrimaryKey, Property } from '@mikro-orm/core';

export abstract class BaseEntity {

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

}
```

定义实际的 Entity，包含一对多，多对多等关系。

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



### 配置数据源

mikro v5 和 v6 略有不同。

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
          driver: SqliteDriver,		// 这里使用了 sqlite 做示例
          allowGlobalContext: true,
          // 实体形式
          entities: [Author, Book, BookTag, Publisher, BaseEntity],
          // 支持如下的扫描形式，为了兼容我们可以同时进行.js和.ts匹配️
          entities: [
            'entity',                        // 指定目录
            '**/entity/*.entity.{j,t}s',     // 通配加后缀匹配
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
          dbName: join(__dirname, '../../test.sqlite'),
          type: 'sqlite',			// 这里使用了 sqlite 做示例
          allowGlobalContext: true,
          // 实体形式
          entities: [Author, Book, BookTag, Publisher, BaseEntity],
          // 支持如下的扫描形式，为了兼容我们可以同时进行.js和.ts匹配️
          entities: [
            'entity',                        // 指定目录
            '**/entity/*.entity.{j,t}s',     // 通配加后缀匹配
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

mikro 的 `entities` 字段配置已经经过框架处理，该字段配置请不要参考原始文档。

:::



### 增删查改

在业务代码中，可以使用 `InjectRepository` 注入 `Repository` 对象执行简单的查询操作。其它的增删改操作可以通过配合`EntityManger ` 的 `persist` 和 `flush` 接口来实现，使用 `InjectEntityManager` 可以直接注入 `EntityManager` 对象，也可以通过`repository.getEntityManager()`获取。

:::caution

* 1、从 5.7 版本开始，MikroORM 将原来 `Repository` 上 `persist` 和 `flush` 等接口标为*弃用*，并计划在 v6 版本中 [彻底移除](https://github.com/mikro-orm/mikro-orm/discussions/3989)，建议直接调用`EntityManager`上的相关接口
* 2、v6 已经彻底 [弃用](https://mikro-orm.io/docs/upgrading-v5-to-v6#removed-methods-from-entityrepository) 上述接口

:::

```typescript
// src/service/book.service.ts
import { Book } from './entity/book.entity';
import { Provide } from '@midwayjs/core';
import { InjectEntityManager, InjectRepository } from '@midwayjs/mikro';
import { QueryOrder } from '@mikro-orm/core';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql'; // 需要使用数据库驱动对应的类来执行操作

@Provide()
export class BookService {

  @InjectRepository(Book)
  bookRepository: EntityRepository<Book>;

  @InjectEntityManager()
  em: EntityManager;

  async queryByRepo() {
    // 使用Repository查询
    const books = await this.bookRepository.findAll({
      populate: ['author'],
      orderBy: { title: QueryOrder.DESC },
      limit: 20,
    });
    return books;
  }

  async createBook() {
    const book = new Book({ title: 'b1', author: { name: 'a1', email: 'e1' } });
    // 标记保存Book
    this.em.persist(book);
    // 执行所有变更
    await this.em.flush();
    return book;
  }
}
```

## 高级功能

### 获取数据源

数据源即创建出的数据源对象，我们可以通过注入内置的数据源管理器来获取。

```typescript
import { Configuration } from '@midwayjs/core';
import { MikroDataSourceManager } from '@midwayjs/mikro';

@Configuration({
  // ...
})
export class MainConfiguration {

  async onReady(container: IMidwayContainer) {
    const dataSourceManager = await container.getAsync(MikroDataSourceManager);
    const orm = dataSourceManager.getDataSource('default');
    const connection = orm.em.getConnection();
    // ...
  }
}
```

从 v3.8.0 开始，也可以通过装饰器注入。

```typescript
import { Configuration } from '@midwayjs/core';
import { InjectDataSource } from '@midwayjs/mikro';
import { MikroORM, IDatabaseDriver, Connection } from '@mikro-orm/core';

@Configuration({
  // ...
})
export class MainConfiguration {

  // 注入默认数据源
  @InjectDataSource()
  defaultDataSource: MikroORM<IDatabaseDriver<Connection>>;

  // 注入自定义数据源
  @InjectDataSource('default1')
  customDataSource: MikroORM<IDatabaseDriver<Connection>>;

  async onReady(container: IMidwayContainer) {
    // ...
  }
}
```



### 日志

可以通过配置将 midway 的 logger 添加到 mikro 中，用于记录 sql 等信息。

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

默认情况下  mikro 自带颜色，也会将其写入文件，可以通过配置关闭。

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



## 常见问题



### 1、Node 版本

Mikro-orm 对 Node 版本有一些限制，必须为 `>=14.0.0` ，所以 `@midwayjs/mikro` 组件的使用规则也如此。



### 2、Identity Map

Mikro-orm 内部查询有一个 [Identity Map](https://mikro-orm.io/docs/identity-map) 的概念，Midway 已经在所有的内置 Framework 的中间件内置加入了该功能，如果在非请求链路调用场景下使用，比如 `src/configuration` 中，可以开启 `allowGlobalContext` 选项。



### 3、多库的支持

和其他数据库一样，Midway 支持多数据源的配置。

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

注意在使用时，需要传递来自哪个数据源。

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

