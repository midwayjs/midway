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
    "@mikro-orm/core": "^5.3.1",
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
    "@mikro-orm/sqlite": "^5.3.1",

    // mysql
    "@mikro-orm/mysql": "^5.3.1",
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
import { Configuration } from '@midwayjs/decorator';
import * as mikro from '@midwayjs/mikro';
import { join } from 'path';

@Configuration({
  imports: [
    // ...
    mikro  														// 加载 mikro 组件
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



### 配置数据源

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
          entities: [Author, Book, BookTag, Publisher, BaseEntity],
          dbName: join(__dirname, '../../test.sqlite'),
          type: 'sqlite',			// 这里使用了 sqlite 做示例
          highlighter: new SqlHighlighter(),
          debug: true,
          allowGlobalContext: true,
        }
      }
    }
  }
}

```

如需以目录扫描形式关联，请参考 [数据源管理](../data_source)。



### 调用 Repository

在业务代码中使用 `InjectRepository` 注入 `repository` 对象，执行数据库操作。

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
      populate: ['author'],
      orderBy: { title: QueryOrder.DESC },
      limit: 20,
    });

  }
}
```



## 高级功能

### 获取数据源

数据源即创建出的数据源对象，我们可以通过注入内置的数据源管理器来获取。

```typescript
import { Configuration } from '@midwayjs/decorator';
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
import { Configuration } from '@midwayjs/decorator';
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

