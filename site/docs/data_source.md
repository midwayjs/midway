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
import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { DataSourceManager } from '@midwayjs/core';
import * as mysql from 'mysql2';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MySqlDataSourceManager extends DataSourceManager<mysql.Connection> {
  // ...
}

```

由于是抽象类，我们需要实现其中的几个基本方法。

```typescript
import { DataSourceManager } from '@midwayjs/core';
import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
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
import { Provide, Scope, ScopeEnum, Init, Config } from '@midwayjs/decorator';
import { DataSourceManager } from '@midwayjs/core';
import * as mysql from 'mysql2';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MySqlDataSourceManager extends DataSourceManager<mysql.Connection> {
  
  @Config('mysql')
  mysqlConfig;

  @Inject()
  baseDir: string;

  @Init()
  async init() {
    // 需要注意的是，这里第二个参数需要传入一个实体类扫描地址
    await this.initDataSource(this.mysqlConfig, this.baseDir);
  }

  // ...
}


```

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



## 实体绑定

数据源最重要的一环是实体类，每个数据源都可以拥有自己的实体类。比如 typeorm 等 orm 框架，都是基于此来设计的。



### 1、显式关联实体类

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



### 2、目录扫描关联实体

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

- 1、填写目录字符串时，以 initDataSource 方法的第二个参数作为相对路径查找，默认为 baseDir（src 或者 dist）
- 2、如果匹配后缀，entities 的路径注意包括 js 和 ts 后缀，否则编译后会找不到实体
- 3、字符串路径的写法不支持 [单文件构建部署](./deployment#单文件构建部署)（bundle模式）

:::



### 2、根据实体获取数据源

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



## 获取数据源

通过注入数据源管理器，我们可以通过其上面的方法来拿到数据源。

```typescript
import { MySqlDataSourceManager } from './manager/mysqlDataSourceManager`;
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

