# Sequelize

本文档介绍如何在 Midway 中使用 Sequelize。

:::tip

当前模块从 v3.4.0 开始已经重构，历史写法兼容，如果查询历史文档，请参考 [这里](../legacy/sequelize)。

:::

相关信息：

| 描述              |     |
| ----------------- | --- |
| 可用于标准项目    | ✅  |
| 可用于 Serverless | ✅  |
| 可用于一体化      | ✅  |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |



## 和老写法的区别

如果想使用新版本的用法，请参考下面的流程，将老代码进行修改，新老代码不能混用。

升级方法：

- 1、请在业务依赖中显式添加 `sequelize` 和 `sequelize-typescript`
- 2、不再使用 `BaseTable` 装饰器，而直接使用 `sequelize-typescript` 包导出的 `Table` 装饰器
- 3、在 `src/config.default` 的 `sequelize` 部分配置调整，参考下面的数据源配置部分
  - 3.1 修改为数据源的形式 `sequelize.dataSource`
  - 3.2 将实体模型在数据源的 `entities` 字段中声明

## 安装依赖

```bash
$ npm i @midwayjs/sequelize@3 sequelize sequelize-typescript --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/sequelize": "^3.0.0",
    "sequelize": "^6.21.3",
    "sequelize-typescript": "^2.1.0"
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```

## 安装数据库 Driver

常用数据库驱动如下，选择你对应连接的数据库类型安装：

```bash
# for MySQL or MariaDB，也可以使用 mysql2 替代
npm install mysql --save
npm install mysql2 --save

# for PostgreSQL or CockroachDB
npm install pg --save

# for SQLite
npm install sqlite3 --save

# for Microsoft SQL Server
npm install mssql --save

# for sql.js
npm install sql.js --save

# for Oracle
npm install oracledb --save

# for MongoDB(experimental)
npm install mongodb --save
```

下面的文档，我们将以 `mysql2` 作为示例。

## 启用组件

在 `src/configuration.ts` 文件中启用组件。

```typescript
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { join } from 'path';
import * as sequelize from '@midwayjs/sequelize';

@Configuration({
  imports: [
    // ...
    sequelize,
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration implements ILifeCycle {
  // ...
}
```

## 模型定义

### 1、创建 Model（Entity）

我们通过模型和数据库关联，在应用中的模型就是数据库表，在 Sequelize 中，模型是和实体绑定的，每一个实体（Entity) 文件，即是 Model，也是实体（Entity）。

在示例中，需要一个实体，我们这里拿 `person` 举例。新建 entity 目录，在其中添加实体文件 `person.ts` ，一个简单的实体如下。

```typescript
// src/entity/person.ts
import { Table, Model, Column, HasMany } from 'sequelize-typescript';

@Table
class Hobby extends Model {
  @Column
  name: string;
}

@Table
class Person extends Model {
  @Column
  name: string;

  @Column
  birthday: Date;

  @HasMany(() => Hobby)
  hobbies: Hobby[];
}
```

要注意，这里的实体文件的每一个属性，其实是和数据库表一一对应的，基于现有的数据库表，我们往上添加内容。

`@Table` 装饰器可以在不传递任何参数的情况下使用，更多参数请查看 [定义选项](https://sequelize.org/v5/manual/models-definition.html#configuration) 。

```typescript
@Table({
  timestamps: true,
  ...
})
class Person extends Model {}
```

这些实体列也可以使用 [sequelize_generator](/docs/tool/sequelize_generator) 工具生成。

### 2、主键

主键 (id) 将从基类 Model 继承。 一般来说主键是 Integer 类型并且是自增的。

主键设置有两种方法，设置 `@Column({primaryKey: true})` 或者 `@PrimaryKey`。

比如：

```typescript
import { Table, Model, PrimaryKey } from 'sequelize-typescript';

@Table
class Person extends Model {
  @PrimaryKey
  name: string;
}
```

### 3、时间列

主要指代的是 `@CreatedAt`, `@UpdatedAt`, `@DeletedAt` 单个装饰器标注的列。

比如：

```typescript
import { Table, Model, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';

@Table
class Person extends Model {
  @CreatedAt
  creationDate: Date;

  @UpdatedAt
  updatedOn: Date;

  @DeletedAt
  deletionDate: Date;
}
```

| 装饰器       | 描述                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| `@CreatedAt` | 会设置 `timestamps=true` 和 `createdAt='creationDate'`                  |
| `@UpdatedAt` | 会设置 `timestamps=true` 和 `updatedAt='updatedOn'`                     |
| `@DeletedAt` | 会设置 `timestamps=true`, `paranoid=true` 和 `deletedAt='deletionDate'` |

### 4、普通列

@Column 装饰器用于标注普通列，可以在不传递任何参数的情况下使用。 但是因此需要能够自动推断 js 类型（详见[类型推断](https://github.com/sequelize/sequelize-typescript#type-inference)）。

```typescript
import { Table, Model, Column } from 'sequelize-typescript';

@Table
class Person extends Model {
  @Column
  name: string;
}
```

或者指定列类型。

```typescript
import { Table, Column, DataType } from 'sequelize-typescript';

@Table
class Person extends Model {
  @Column(DataType.TEXT)
  name: string;
}
```

更多类型描述，请参考 [这里](https://sequelize.org/v5/manual/models-definition.html#configuration)。

比如：

```typescript
import { Table, Model, Column, DataType } from 'sequelize-typescript'

@Table
class Person extends Model {
  @Column({
    type: DataType.FLOAT,
    comment: 'Some value',
    ...
  })
  value: number;
}
```

| 装饰器                               | 描述                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `@Column`                            | 使用推导的 [dataType](https://sequelize.org/v5/manual/models-definition.html#data-types) 作为类型 |
| `@Column(dataType: DataType)`        | 显式设置 [dataType](https://sequelize.org/v5/manual/models-definition.html#data-types)            |
| `@Column(options: AttributeOptions)` | 设置 [attribute options](https://sequelize.org/v5/manual/models-definition.html#configuration)    |

## 数据源配置

新版本我们启用了 [数据源机制](../data_source)，在 `src/config.default.ts` 中配置：

```typescript
// src/config/config.default.ts

import { Person } from '../entity/person';

export default {
  // ...
  sequelize: {
    dataSource: {
      // 第一个数据源，数据源的名字可以完全自定义
      default: {
        database: 'test4',
        username: 'root',
        password: '123456',
        host: '127.0.0.1',
        port: 3306,
        encrypt: false,
        dialect: 'mysql',
        define: { charset: 'utf8' },
        timezone: '+08:00',
        entities: [Person],
        // 本地的时候，可以通过 sync: true 直接 createTable
        sync: false,
      },

      // 第二个数据源
      default2: {
        // ...
      },
    },
  },
};
```

如需以目录扫描形式关联，请参考 [数据源管理](../data_source)。



## 模型关联

可以通过 `HasMany` 、`@HasOne` 、`@BelongsTo`、`@BelongsToMany` 和 `@ForeignKey` 装饰器在模型中直接描述关系。

### 一对多

```typescript
import { Table, Model, Column, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';

@Table
export class Player extends Model {
  @Column
  name: string;

  @Column
  num: number;

  @ForeignKey(() => Team)
  @Column
  teamId: number;

  @BelongsTo(() => Team)
  team: Team;
}

@Table
export class Team extends Model {
  @Column
  name: string;

  @HasMany(() => Player)
  players: Player[];
}
```

`sequelize-typescript` 会在内部进行关联，会自动查询出相关的依赖。

比如通过 `find` 查询。

```typescript
const team = await Team.findOne({ include: [Player] });

team.players.forEach((player) => {
  console.log(`Player ${player.name}`);
});
```

### 多对多

```typescript
import { Table, Model, Column, ForeignKey, BelongsToMany } from 'sequelize-typescript';

@Table
export class Book extends Model {
  @BelongsToMany(() => Author, () => BookAuthor)
  authors: Author[];
}

@Table
export class Author extends Model {
  @BelongsToMany(() => Book, () => BookAuthor)
  books: Book[];
}

@Table
export class BookAuthor extends Model {
  @ForeignKey(() => Book)
  @Column
  bookId: number;

  @ForeignKey(() => Author)
  @Column
  authorId: number;
}
```

上面的类型，在某些场景下是不安全的，比如上面的 `BookAuthor`，`Author` 的 `books` 的类型，可能会丢失某些属性，需要手动设置。

```typescript
@BelongsToMany(() => Book, () => BookAuthor)
books: Array<Book & {BookAuthor: BookAuthor}>;
```

### 一对一

对于一对一，使用 `@HasOne(...)`（关系的外键存在于另一个模型上）和 `@BelongsTo(...)`（关系的外键存在于此模型上）。

比如：

```typescript
import { Table, Column, Model, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';

@Table
export class Photo extends Model {
  @ForeignKey(() => User)
  @Column({
    comment: '用户Id',
  })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    comment: '名字',
  })
  name: string;
}

@Table
export class User extends Model {
  @Column
  name: string;
}
```



## 静态操作方法

如果是单个数据源，可以使用下面的静态方法。

### 保存

在需要调用的地方，使用实体模型来操作。

```typescript
import { Provide } from '@midwayjs/decorator';
import { Person } from '../entity/person';

@Provide()
export class PersonService {
  async createPerson() {
    const person = new Person({ name: 'bob', age: 99 });
    await person.save();
  }
}
```

### 查找和更新

```typescript
import { Provide } from '@midwayjs/decorator';
import { Person } from '../entity/person';

@Provide()
export class PersonService {
  async updatePerson() {
    const person = await Person.findOne();
    // 更新
    person.age = 100;
    await person.save();

    await Person.update(
      {
        name: 'bobby',
      },
      {
        where: { id: 1 },
      }
    );
  }
}
```

## Repository 模式

Repository 模式可以将查找、创建等静态操作从模型定义中分离出来。它还支持与多个 sequelize 实例（多数据源）一起使用。

### 启动 Repository 模式

和数据源配置相同，只是多了一个属性。

```typescript
// src/config/config.default.ts

import { Person } from '../entity/person';

export default {
  // ...
  sequelize: {
    dataSource: {
      default: {
        // ...
        entities: [Person],

        // 多了这一个
        repositoryMode: true,
      },
    },
    sync: false,
  },
};
```

如果是多个数据源，务必在每个数据源都开启该属性，开启后，原有的静态操作方法不再可用。

你需要使用 `Repository` 的操作方式。

### 使用 Repository 模式

基本 API 和静态操作相同，Midway 对其进行了一些简单包裹，使用 `InjectRepository` 装饰器可以在服务中注入 `Repository`。

```typescript
import { Controller, Get } from '@midwayjs/decorator';
import { InjectRepository } from '@midwayjs/sequelize';
import { Photo } from '../entity/photo';
import { User } from '../entity/user';
import { Op } from 'sequelize';

@Controller('/')
export class HomeController {
  @InjectRepository(User)
  userRepository: Repository<User>;

  @InjectRepository(Photo)
  photoRepository: Repository<Photo>;

  @Get('/')
  async home() {
    // 查询
    let result = await this.photoRepository.findAll();
    console.log(result);

    // 新增
    await this.photoRepository.create({
      name: '123',
    });

    // 删除
    await this.photoRepository.destroy({
      where: {
        name: '123',
      },
    });

    // 联合查询
    // SELECT * FROM photo WHERE name = "23" OR name = "34";
    let result = await this.photoRepository.findAll({
      where: {
        [Op.or]: [{ name: '23' }, { name: '34' }],
      },
    });
    // => result

    // 连表查询
    let result = await this.userRepository.findAll({ include: [Photo] });
    // => result
  }
}
```

关于 OP 的更多用法：[https://sequelize.org/v5/manual/querying.html](https://sequelize.org/v5/manual/querying.html)

### 多库的支持

在 Repository 模式下，我们可以在 `InjectRepository` 参数中指定特定的数据源。

```typescript
import { Controller } from '@midwayjs/decorator';
import { InjectRepository } from '@midwayjs/sequelize';
import { Photo } from '../entity/photo';
import { User } from '../entity/user';

@Controller('/')
export class HomeController {
  // 指定某个数据源
  @InjectRepository(User, 'default')
  userRepository: Repository<User>;
  // ...
}
```


## 高级功能

### 数据源同步配置

sequelize 在同步数据源时可以添加 sync 的参数。

```typescript
export default {
  // ...
  sequelize: {
    dataSource: {
      default: {
        sync: true,
        syncOptions: {
          force: false,
          alter: true,
        },
      },
    },
    // 多个数据源时可以用这个指定默认的数据源
    defaultDataSourceName: 'default',
  },
};
```

### 指定默认数据源

在包含多个数据源时，可以指定默认的数据源。

```typescript
export default {
  // ...
  sequelize: {
    dataSource: {
      default1: {
        // ...
      },
      default2: {
        // ...
      },
    },
    // 多个数据源时可以用这个指定默认的数据源
    defaultDataSourceName: 'default1',
  },
};
```



### 获取数据源

数据源即创建出的 sequelize 对象，我们可以通过注入内置的数据源管理器来获取。

```typescript
import { Configuration } from '@midwayjs/decorator';
import { SequelizeDataSourceManager } from '@midwayjs/sequelize';

@Configuration({
  // ...
})
export class MainConfiguration {

  async onReady(container: IMidwayContainer) {
    const dataSourceManager = await container.getAsync(SequelizeDataSourceManager);
    const conn = dataSourceManager.getDataSource('default');
    await conn.authenticate();
  }
}
```

从 v3.8.0 开始，也可以通过装饰器注入。

```typescript
import { Configuration } from '@midwayjs/decorator';
import { InjectDataSource } from '@midwayjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

@Configuration({
  // ...
})
export class MainConfiguration {
  
  // 注入默认数据源
  @InjectDataSource()
  defaultDataSource: Sequelize;
  
  // 注入自定义数据源
  @InjectDataSource('default1')
  customDataSource: Sequelize;

  async onReady(container: IMidwayContainer) {
    // ...
  }
}
```



## 常见问题

### 1、Dialect needs to be explicitly supplied as of v4.0.0

原因为配置中数据源没有指定 `dialect` 字段，确认数据源的结构，格式以及配置合并的结果。



## 其他

- 上面的文档，翻译自 sequelize-typescript，更多 API ，请参考 [英文文档](<(https://github.com/sequelize/sequelize-typescrip)>)
- 一些 [案例](https://github.com/ddzyan/midway-practice)
- 如果遇到比较复杂的，可以使用 [raw query 方法](https://sequelize.org/v5/manual/raw-queries.html)
