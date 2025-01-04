# Data source management

In the process of using database packages, we often have multi-database connection and management requirements. Different databases have certain differences in connection pool management, connection status, and usage methods.

Although we can use the service factory to abstract, whether it is semantics or some functions, it is slightly different from the service factory, such as the ability to load entity classes, which is unique to the data source.

For this reason, Midway provides `DataSourceManager` abstraction to facilitate the management of data sources.

Take `mysql2` as an example to implement a `mysql2` connection pool management class.

The following is the official example of `mysql2`, as a preparatory work.

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
connection.query (
  'SELECT * FROM `table` WHERE `name` = "Page" AND `age` > 45',
  function(err, results, fields) {
    console.log(results); // results contains rows returned by server
    console.log(fields); // fields contains extra meta data about results, if available
  }
);
```

Similar to service factories, we need to implement some fixed methods.

- 1. Method of creating a data source
- 2. check the connection method



## Implement data source manager

The data source manager is also a common export class in midway, for example, we can also put it in `src/manager/mysqlDataSourceManager.ts`.



### 1. Create a data source interface

We only need to inherit the built-in `DataSourceManager` class to implement a data source manager.

`DataSourceManager` contain a generic type, you need to declare the data type of the data source.

```typescript
import { DataSourceManager, Provide, Scope, ScopeEnum } from '@midwayjs/core';
import * as mysql from 'mysql2';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MySqlDataSourceManager extends DataSourceManager<mysql.Connection> {
  // ...
}

```

Since it is an abstract class, we need to implement several basic methods.

```typescript
import { DataSourceManager, Provide, Scope, ScopeEnum } from '@midwayjs/core';
import * as mysql from 'mysql2';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MySqlDataSourceManager extends DataSourceManager<mysql.Connection> {
	// Create a single instance
  protected async createDataSource(config: any, dataSourceName: string): Promise<mysql.Connection> {
    return mysql.createConnection(config);
  }

  getName(): string {
    return 'mysql';
  }

  async checkConnected(dataSource: mysql.Connection): Promise<boolean> {
    // Pseudocode
    return dataSource.status === 'connected';
  }

  async destroyDataSource(dataSource: mysql.Connection): Promise<void> {
    if (await this.checkConnected(dataSource)) {
      await dataSource.destroy();
    }
  }
}

```



### 2. Provide initialization configuration

You can use the `@Init` decorator and the `@Config` decorator to provide initialization configurations.

```typescript
import { DataSourceManager, Provide, Scope, ScopeEnum, Init, Config } from '@midwayjs/core';
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


Starting from v4.0.0, the `initDataSource` method supports a second parameter for passing initialization options.

Optional values are:

- `baseDir`: Entity class scanning start address, optional, default is `src` or `dist`
- `entitiesConfigKey`: Entity class configuration key, the framework will get entity classes from this key in the configuration, optional, default is `entities`
- `concurrent`: Whether to initialize concurrently, optional, for backward compatibility, the default is `false`


In the `src/config/config.default`, we can provide the configuration of multiple data sources to create multiple data sources.

For example:

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
  // Other configurations
}
```

Data sources are naturally designed for multiple instances. Unlike service factories, there is no difference between single and multiple configurations.



## Data Source Configuration

In `src/config/config.default`, the configuration format for multiple data sources is similar to [service factory](./service_factory).

The default configuration is agreed to be the `default` property.

When creating a data source, both regular data source configurations and dynamically created data source configurations will be merged with the `default` configuration.

Unlike service factories, data sources are naturally designed for multiple instances, and there is no single configuration case.

The complete structure is as follows:

```typescript
// config.default.ts
export const mysql = {
  default: {
    // Default data source configuration
  }
  dataSource: {
    dataSource1: {
      entities: [],
      validateConnection: false,
      // Data source configuration
    },
    dataSource2: {
      // Data source configuration
    },
    dataSource3: {
      // Data source configuration
    },
  }
  // Other configurations
}
```

:::tip
- `entities` is a framework-specific configuration used to specify entity classes.
- `validateConnection` is a framework-specific configuration used to specify whether to validate the connection through the `checkConnected` method.
:::



## Binding Entity Classes

The most important part of the data source is the entity class, each data source can have its own entity class. For example, orm frameworks such as typeorm are designed based on this.



### Explicitly Associate Entity Classes

Entity classes are generally the same class as the table structure.

For example:

```typescript
// src/entity/user.entity.ts
// Here is the pseudo code, the decorator needs to implement it by itself.
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

The data source manager binds these entity classes to the data source through a fixed configuration.

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

The `entities` configuration of each data source can add its own entity class.



### Directory Scan Associated Entities

In some cases, we can also replace it with a matching path, such:

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
          User
          SimpleUser
           'entity', // specific directory (equivalent to directory wildcard)
           '**/abc/**', // Only get files in directories containing abc characters
           'abc/**/*.ts', // specific directory + wildcard
           'abc/*.entity.ts', // match suffix
           '**/*.entity.ts', // wildcard plus suffix match
           '**/*.{j,t}s', // suffix match
        ]
      },
      // ...
      // ...
    }
  }
}
```

:::caution

Attention

- 1. When filling in the directory string, use the `initDataSource` method's second parameter as a relative path search, and the default is baseDir (src or dist)
- 2. If the suffix is matched, the path of entities should include the js and ts suffixes, otherwise the entity will not be found after compilation
- 3. The writing method of the string path does not support [single-file build deployment](./deployment#single-file build deployment) (bundle mode)

:::


## Getting Data Sources

### Getting Data Sources by Entity

Generally, our API is on data source objects, such as `connection.query`.

So in many cases, such as custom decorators, you need a method to get data source objects from entities.

```typescript
// The following is the pseudo code
import { SimpleUser } from '../entity/user.entity';

class UserService {
  // A Model corresponding to the entity class will be injected here, including adding, deleting, modifying and checking methods.
  @InjectEntityModel(SimpleUser)
  userModel;

}
```

If the entity class corresponds to only one data source, we can obtain the data source by `getDataSourceNameByModel`.

```typescript
this.mysqlDataSourceManager.getDataSourceNameByModel(SimpleUser);

// => dataSource1
```

In the case of multiple data sources, the data source obtained by this method may not be accurate, and the last set data source will be obtained.

In this case, users are generally required to manually specify the data source, such:

```typescript
// The following is the pseudo code
import { SimpleUser } from '../entity/user.entity';

class UserService {
  @InjectEntityModel(SimpleUser, 'dataSource2')
  userModel;
}
```

The default data source can also be specified explicitly via the `defaultDataSourceName` configuration.

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



### Dynamic API to Get Data Sources

By injecting the data source manager, we can get the data source through the above methods.

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

In addition, there are some other methods.

```typescript
// Whether the data source exists
this.mysqlDataSourceManager.hasDataSource('dataSource1');
// Get all data source names
this.mysqlDataSourceManager.getDataSourceNames();
// Whether the data source is connected
this.mysqlDataSourceManager.isConnected('dataSource1')
```


## Dynamic Data Source Creation

In addition to initializing data sources through configuration, we can also dynamically create data sources at runtime. This is very useful in scenarios where data sources need to be created based on different conditions.

Use the `createInstance` method to dynamically create a data source:

```typescript
import { Provide, Inject } from '@midwayjs/core';
import { MySqlDataSourceManager } from './manager/mysqlDataSourceManager';

@Provide()
export class UserService {
  @Inject()
  mysqlDataSourceManager: MySqlDataSourceManager;

  async createNewDataSource() {
    // Create new data source
    const dataSource = await this.mysqlDataSourceManager.createInstance({
      host: 'localhost',
      user: 'root',
      database: 'new_db',
      entities: ['entity/user.entity.ts'],
      validateConnection: true
    }, 'dynamicDB');

    // Use the newly created data source
    // ...
  }
}
```

The `createInstance` method accepts two parameters:
- `config`: Data source configuration
- `dataSourceName`: Data source name (optional)

:::tip
- 1. `dataSourceName` is the unique identifier of the data source, used to distinguish different data sources.
- 2. If `dataSourceName` is not provided, the data source manager will not cache this data source, and users need to manage its lifecycle themselves after return.
- 3. Dynamically created data sources will be merged with the `default` configuration.
:::


## Type Definition

When using data sources, we need to correctly define types. Midway provides two core types to help you define data source configurations.

#### BaseDataSourceManagerConfigOption

Used to define basic data source configuration:

```typescript
import { BaseDataSourceManagerConfigOption } from '@midwayjs/core';

// Define your data source configuration
interface MySQLOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

// Use BaseDataSourceManagerConfigOption to define complete configuration
// The first generic parameter is the data source configuration
// The second generic parameter is the entity configuration key name (default is 'entities')
type MySQLConfig = BaseDataSourceManagerConfigOption<MySQLOptions>;
```

#### DataSourceManagerConfigOption

Adds data source management related configuration on top of the basic configuration:

```typescript
import { DataSourceManagerConfigOption } from '@midwayjs/core';

interface MySQLOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

// Use DataSourceManagerConfigOption to define configuration
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    mysql?: DataSourceManagerConfigOption<MySQLOptions>;
  }
}
```

#### Usage Example

```typescript
// src/config/config.default.ts
export default {
  mysql: {
    // Default data source configuration
    default: {
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'test',
      entities: ['entity/**/*.entity.ts'],
      validateConnection: true
    },
    // Multiple data source configuration
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
- `BaseDataSourceManagerConfigOption` is mainly used to define configuration for a single data source
- `DataSourceManagerConfigOption` is used to define complete data source management configuration, including multiple data source support
- If your ORM uses a different entity configuration key name, you can specify it through the second generic parameter, such as:
  ```typescript
  // Sequelize uses models instead of entities
  type SequelizeConfig = DataSourceManagerConfigOption<SequelizeOptions, 'models'>;
  ```
:::

