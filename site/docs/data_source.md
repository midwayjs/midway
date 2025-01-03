# 数据源管理

在使用数据库包过程中，我们经常会有多库连接和管理的需求，不同数据库的连接池管理，连接状态，以及使用的方式都有一定的差异。

虽然我们可以使用服务工厂来进行抽象，但是不管是语义，还是部分功能，和服务工厂还是略有不同，比如实体类的加载等能力，这都是数据源特有的。

为此，Midway 提供了 `DataSourceManager` 的抽象，方便数据源的管理。

我们以 `mysql2` 来举例，实现一个 `mysql2` 的连接池管理类。

下面是 `mysql2` 官方的示例，作为准备工作。

```typescript
// get the client
const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'test'
});

// simple query
connection.query(
  'SELECT * FROM `table` WHERE `name` = "Page" AND `age` > 45',
  function(err, results, fields) {
    console.log(results); // results contains rows returned by server
    console.log(fields); // fields contains extra meta data about results, if available
  }
);
```

和服务工厂类似，我们需要实现一些固定的方法。

- 1、创建数据源的方法
- 2、检查连接的方法



## 实现数据源管理器

数据源管理器在 midway 中也是一个普通的导出类，比如我们也可以把他放到 `src/manager/mysqlDataSourceManager.ts` 中。



### 1、实现创建数据源接口

我们只需要继承内置的 `DataSourceManager` 类，就能实现一个数据源管理器。

`DataSourceManager` 包含一个泛型类型，需要声明该数据源的数据类型。

```typescript
import { Provide, Scope, ScopeEnum, DataSourceManager } from '@midwayjs/core';
import * as mysql from 'mysql2';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MySqlDataSourceManager extends DataSourceManager<mysql.Connection> {
  // ...
}

```

由于是抽象类，我们需要实现其中的几个基本方法。

```typescript
import { Provide, Scope, ScopeEnum, DataSourceManager } from '@midwayjs/core';
import * as mysql from 'mysql2';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MySqlDataSourceManager extends DataSourceManager<mysql.Connection> {
	// 创建单个实例
  protected async createDataSource(config: any, dataSourceName: string): Promise<mysql.Connection> {
    return mysql.createConnection(config);
  }

  getName(): string {
    return 'mysql';
  }

  async checkConnected(dataSource: mysql.Connection): Promise<boolean> {
    // 伪代码
    return dataSource.status === 'connected';
  }

  async destroyDataSource(dataSource: mysql.Connection): Promise<void> {
    if (await this.checkConnected(dataSource)) {
      await dataSource.destroy();
    }
  }
}

```



### 2、提供初始化配置

我们可以利用 `@Init` 装饰器和 `@Config` 装饰器提供初始化配置。

```typescript
import { Provide, Scope, ScopeEnum, Init, Config, DataSourceManager } from '@midwayjs/core';
import * as mysql from 'mysql2';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MySqlDataSourceManager extends DataSourceManager<mysql.Connection> {

  @Config('mysql')
  mysqlConfig;

  @Init()
  async init() {
    await this.initDataSource(this.mysqlConfig, {
      concurrent: true
    });
  }

  // ...
}

```

从 v4.0.0 开始，`initDataSource` 方法支持第二个参数，用于传递初始化选项。

可选的值有：

- `baseDir`: 实体类扫描起始地址，可选，默认是 `src` 或者 `dist`
- `entitiesConfigKey`: 实体类配置键，框架会从配置中的这个 key 获取实体类，可选，默认是 `entities`
- `concurrent`: 是否并发初始化，可选，为了向前兼容，默认是 `false`。


在 `src/config/config.default` 中，我们可以提供多数据源的配置，来创建多个数据源。

比如：

```typescript
// config.default.ts
export const mysql = {
  dataSource: {
    dataSource1: {
      host: 'localhost',
      user: 'root',
      database: 'test'
    },
    dataSource2: {
      host: 'localhost',
      user: 'root',
      database: 'test'
    },
    dataSource3: {
      host: 'localhost',
      user: 'root',
      database: 'test'
    },
  }
  // 其他配置
}
```

数据源天然就是为了多个实例而设计的，和服务工厂不同，没有单个和多个的配置区别。

### 3、实例化数据源管理器

为了方便用户使用，我们还需要提前将数据源管理器创建，一般来说，只需要在组件或者项目的 `onReady` 生命周期中实例化，在 `onStop` 生命周期中销毁。

```typescript
import { Configuration } from '@midwayjs/core';

@Configuration({
  imports: [
    // ...
  ]
})
export class ContainerConfiguration {
  private mysqlDataSourceManager: MySqlDataSourceManager;

  async onReady(container) {
    // 实例化数据源管理器
    this.mysqlDataSourceManager = await container.getAsync(MySqlDataSourceManager);
  }

  async onStop() {
    // 销毁数据源管理器
    if (this.mysqlDataSourceManager) {
      await this.mysqlDataSourceManager.stop();
    }
  }
}
```

## 数据源配置

在 `src/config/config.default` 中，多个数据源配置格式和 [服务工厂](./service_factory) 类似。

默认的配置，我们约定为 `default` 属性。

在创建数据源时，普通的数据源配置以及动态创建的数据源配置都会和 `default` 配置合并。

和服务工厂略有不同，数据源天然就是为了多个实例而设计的，没有单个配置的情况。

完整结构如下：

```typescript
// config.default.ts
export const mysql = {
  default: {
    // 默认数据源配置
  }
  dataSource: {
    dataSource1: {
      entities: [],
      validateConnection: false,
      // 数据源配置
    },
    dataSource2: {
      // 数据源配置
    },
    dataSource3: {
      // 数据源配置
    },
  }
  // 其他配置
}
```

:::tip
- `entities` 是框架提供的特有的配置，用于指定实体类。
- `validateConnection` 是框架提供的特有的配置，用于指定是否通过 `checkConnected` 方法验证连接。
:::



## 绑定实体类

数据源最重要的一环是实体类，每个数据源都可以拥有自己的实体类。比如 typeorm 等 orm 框架，都是基于此来设计的。


### 显式关联实体类

实体类一般是和表结构相同的类。

比如：

```typescript
// src/entity/user.entity.ts
// 这里是伪代码，装饰器需要自行实现
@Entity()
export class SimpleUser {
  @Column()
  name: string;
}

@Entity()
export class User {
  @Column()
  name: string;

  @Column()
  age: number;
}
```

数据源管理器通过固定的配置，将这些实体类和数据源进行绑定。

```typescript
// config.default.ts
import { User, SimpleUser } from '../entity/user.entity';

export default {
  mysql: {
    dataSource: {
      dataSource1: {
        host: 'localhost',
        user: 'root',
        database: 'test',
        entities: [User]
      },
      dataSource2: {
        host: 'localhost',
        user: 'root',
        database: 'test',
        entities: [SimpleUser]
      },
      // ...
    }
  }
}
```

每个数据源的 `entities` 配置，都可以添加各自的实体类。



### 目录扫描关联实体

在某些情况下，我们也可以通过通配的路径来替代，比如：

```typescript
// config.default.ts
import { User, SimpleUser } from '../entity/user.entity';

export default {
  mysql: {
    dataSource: {
      dataSource1: {
        host: 'localhost',
        user: 'root',
        database: 'test',
        entities: [
          User,
          SimpleUser,
          'entity',             // 特定目录（等价于目录通配）
          '**/abc/**',          // 仅获取包含 abc 字符的目录下的文件
          'abc/**/*.ts',        // 特定目录 + 通配
          'abc/*.entity.ts',    // 匹配后缀
          '**/*.entity.ts',     // 通配加后缀匹配
          '**/*.{j,t}s',        // 后缀匹配
        ]
      },
      // ...
      // ...
    }
  }
}
```

:::caution

注意

- 1、填写目录字符串时，以 `initDataSource` 方法的第二个参数作为相对路径查找，默认为 `baseDir`（`src` 或者 `dist`）
- 2、如果匹配后缀，`entities` 的路径注意包括 `js` 和 `ts` 后缀，否则编译后会找不到实体
- 3、字符串路径的写法不支持 [单文件构建部署](./deployment#单文件构建部署)（bundle模式）

:::


## 获取数据源


### 根据实体获取数据源

一般我们的 API 都是在数据源对象上，比如 `connection.query`。

所以在很多时候，比如自定义装饰器，都需要一个从实体获取到数据源对象的方法。

```typescript
// 下面为伪代码
import { SimpleUser } from '../entity/user.entity';

class UserService {
  // 这里一般会注入一个实体类对应的 Model，包含增删改查方法
  @InjectEntityModel(SimpleUser)
  userModel;

}
```

如果在实体类仅对应一个数据源的情况下，我们可以通过 `getDataSourceNameByModel` 来获取数据源。

```typescript
this.mysqlDataSourceManager.getDataSourceNameByModel(SimpleUser);

// => dataSource1
```

多个的情况下，该方法获取的数据源不一定准确，会拿到最后设置的一个数据源。

这种时候一般需要用户手动指定数据源，比如：

```typescript
// 下面为伪代码
import { SimpleUser } from '../entity/user.entity';

class UserService {
  @InjectEntityModel(SimpleUser, 'dataSource2')
  userModel;

}
```

也可以通过 `defaultDataSourceName` 配置显式指定默认的数据源。

```typescript
// config.default.ts
export const mysql = {
  dataSource: {
    dataSource1: {
      // ...
    },
    dataSource2: {
      // ...
    },
    dataSource3: {
      // ...
    },
  }
  defaultDataSourceName: 'dataSource2',
}
```



### 动态 API 获取数据源

通过注入数据源管理器，我们可以通过其上面的方法来拿到数据源。

```typescript
import { MySqlDataSourceManager } from './manager/mysqlDataSourceManager';
import { join } from 'path';

@Provide()
export class UserService {

  @Inject()
  mysqlDataSourceManager: MySqlDataSourceManager;

  async invoke() {

    const dataSource = this.mysqlDataSourceManager.getDataSource('dataSource1');
    // TODO

  }
}
```

此外，还有一些其他方法。

```typescript
// 数据源是否存在
this.mysqlDataSourceManager.hasDataSource('dataSource1');
// 获取所有的数据源名
this.mysqlDataSourceManager.getDataSourceNames();
// 数据源是否连接
this.mysqlDataSourceManager.isConnected('dataSource1')
```



## 动态创建数据源

除了通过配置初始化数据源外，我们还可以在运行时动态创建数据源。这在需要根据不同条件创建数据源的场景下非常有用。

使用 `createInstance` 方法可以动态创建数据源：

```typescript
import { Provide, Inject } from '@midwayjs/core';
import { MySqlDataSourceManager } from './manager/mysqlDataSourceManager';

@Provide()
export class UserService {
  @Inject()
  mysqlDataSourceManager: MySqlDataSourceManager;

  async createNewDataSource() {
    // 创建新的数据源
    const dataSource = await this.mysqlDataSourceManager.createInstance({
      host: 'localhost',
      user: 'root',
      database: 'new_db',
      entities: ['entity/user.entity.ts'],
      validateConnection: true
    }, 'dynamicDB');

    // 使用新创建的数据源
    // ...
  }
}
```

`createInstance` 方法接受两个参数：
- `config`: 数据源配置
- `dataSourceName`: 数据源名称（可选）

:::tip
- 1、`dataSourceName` 是数据源的唯一标识，用于区分不同的数据源。
- 2、如果不提供 `dataSourceName`，则数据源管理器不会缓存该数据源，返回后需要用户自行管理其生命周期。
- 3、动态创建的数据源，会和 `default` 配置合并。
:::

## 类型定义

在使用数据源时，我们需要正确定义类型。Midway 提供了两个核心类型来帮助你定义数据源配置。

#### BaseDataSourceManagerConfigOption

用于定义基础数据源配置：

```typescript
import { BaseDataSourceManagerConfigOption } from '@midwayjs/core';

// 定义你的数据源配置
interface MySQLOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

// 使用 BaseDataSourceManagerConfigOption 定义完整配置
// 第一个泛型参数是数据源配置
// 第二个泛型参数是实体配置的键名（默认为 'entities'）
type MySQLConfig = BaseDataSourceManagerConfigOption<MySQLOptions>;
```

#### DataSourceManagerConfigOption

在基础配置的基础上，增加了数据源管理相关的配置：

```typescript
import { DataSourceManagerConfigOption } from '@midwayjs/core';

interface MySQLOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

// 使用 DataSourceManagerConfigOption 定义配置
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    mysql?: DataSourceManagerConfigOption<MySQLOptions>;
  }
}
```

#### 使用示例

```typescript
// src/config/config.default.ts
export default {
  mysql: {
    // 默认数据源配置
    default: {
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'test',
      entities: ['entity/**/*.entity.ts'],
      validateConnection: true
    },
    // 多数据源配置
    dataSource: {
      db1: {
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '123456',
        database: 'db1',
        entities: ['entity/db1/**/*.entity.ts']
      }
    }
  }
}
```

:::tip
- `BaseDataSourceManagerConfigOption` 主要用于定义单个数据源的配置
- `DataSourceManagerConfigOption` 用于定义完整的数据源管理配置，包括多数据源支持
- 如果你的 ORM 使用不同的实体配置键名，可以通过第二个泛型参数指定，如：
  ```typescript
  // Sequelize 使用 models 而不是 entities
  type SequelizeConfig = DataSourceManagerConfigOption<SequelizeOptions, 'models'>;
  ```
:::

