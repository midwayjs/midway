# Sequelize

This document describes how to use Sequelize in Midway.

:::tip

The current module has been reconfigured since v3.4.0, and the historical writing method is compatible. For more information about how to query historical documents, see [here](../legacy/sequelize).

:::

Related information:

| Description |     |
| ----------------- | --- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |



## The difference with the old writing

If you want to use the new version of the usage, please refer to the following process to modify the old code. The new and old codes cannot be mixed.

Upgrade method:

- 1. Please explicitly add `sequelize` and `sequelize-typescript` to the business dependency
- 2. Instead of using the `BaseTable` decorator, use the `Table` decorator exported by the `sequelize-typescript` package directly.
- 3. configure the adjustment in the `sequelize` section of `src/config.default`. refer to the following data source configuration section
   - The 3.1 is modified to the form of a data source to `sequelize.dataSource`
   - 3.2 declare the entity model in the `entities` field of the data source

## Installation dependency

```bash
$ npm i @midwayjs/sequelize@3 sequelize sequelize-typescript --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/sequelize": "^3.0.0",
    "sequelize": "^6.21.3 ",
    "sequelize-typescript": "^ 2.1.0"
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```

## Install database Driver

The commonly used database drivers are as follows. Select the database type to install the corresponding connection:

```bash
# for MySQL or MariaDB, you can also use mysql2 instead
npm install mysql --save
npm install mysql2 --save

# for PostgreSQL or CockroachDB
npm install pg --save

# for SQLite
npm install sqlite3 --save

# for Microsoft SQL Server
npm install mssql --save

# for SQL .js
npm install SQL .js --save

# for Oracle
npm install oracledb --save

# for MongoDB(experimental)
npm install mongodb --save
```

In the following example, `mysql2` is used as an example.

## Enable components

Enable components in the `src/configuration.ts` file.

```typescript
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { join } from 'path';
import * as sequelize from '@midwayjs/sequelize';

@Configuration({
  imports: [
    // ...
    sequelize
  ],
  importConfigs: [join(__dirname, './config')]
})
export class MainConfiguration implements ILifeCycle {
  // ...
}
```

## Model definition

### 1. Create Model(Entity)

We associate with the database through the model. The model in the application is the database table. In the Sequelize, the model is bound to the entity. Each Entity file is a Model and an Entity.

In the example, you need an entity. Let's take `person` as an example. Create an entity directory and add the entity file `person.ts` to the entity directory. A simple entity is as follows.

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

Note that each attribute of the entity file here is actually one-to-one corresponding to the database table. Based on the existing database table, we add content up.

The `@Table` decorator can be used without passing any parameters. For more information, see [Define options](https://sequelize.org/v5/manual/models-definition.html#configuration).

```typescript
@Table({
  timestamps: true
  ...
})
class Person extends Model {}
```

These entity columns can also be generated using [sequelize_generator](/docs/tool/sequelize_generator) tools.

### 2. Primary key

The primary key (id) will be inherited from the base class Model.  Generally speaking, the primary key is of Integer type and is self-increasing.

There are two ways to set the primary key, `@Column({primaryKey: true})` or `@PrimaryKey`.

For example:

```typescript
import { Table, Model, PrimaryKey } from 'sequelize-typescript';

@Table
class Person extends Model {
  @PrimaryKey
  name: string;
}
```

### 3. Time column

Mainly refers to `@CreatedAt`, `@UpdatedAt`, `@DeletedAt` columns marked by a single decorator.

for example:

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

| Decorator | Description |
| ------------ | ----------------------------------------------------------------------- |
| `@CreatedAt` | `timestamps = true` and `createdAt = 'creationDate'` are set. |
| `@UpdatedAt` | `timestamps = true` and `updatedAt = 'updatedOn'` are set |
| `@DeletedAt` | `timestamps = true`, `paranoid = true`, and `deletedAt = 'deletionDate'` |

### 4. Ordinary column

The @Column decorator is used to label normal columns and can be used without passing any parameters.  However, you must be able to automatically infer the js type. For more information, see [Type inference](https://github.com/sequelize/sequelize-typescript#type-inference).

```typescript
import { Table, Model, Column } from 'sequelize-typescript';

@Table
class Person extends Model {
  @Column
  name: string;
}
```

Or specify the column type.

```typescript
import { Table, Column, DataType } from 'sequelize-typescript';

@Table
class Person extends Model {
  @Column(DataType.TEXT)
  name: string;
}
```

For more information, see [here](https://sequelize.org/v5/manual/models-definition.html#configuration).

For example:

```typescript
import { Table, Model, Column, DataType } from 'sequelize-typescript'

@Table
class Person extends Model {
  @Column({
    type: DataType.FLOAT
    comment: 'Some value',
    ...
  })
  value: number;
}
```

| Decorator | Description |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `@Column` | Use the derived [dataType](https://sequelize.org/v5/manual/models-definition.html#data-types) as the type |
| `@Column(dataType: DataType)` | Explicit setting [dataType](https://sequelize.org/v5/manual/models-definition.html#data-types) |
| `@Column(options: AttributeOptions)` | Set [attribute options](https://sequelize.org/v5/manual/models-definition.html#configuration) |

## Data source configuration

In the new version, we have enabled the [data source mechanism](../data_source) and configured it in `src/config.default.ts`:

```typescript
// src/config/config.default.ts

import { Person } from '../entity/person';

export default {
   // ...
   sequelize: {
     dataSource: {
       // The first data source, the name of the data source can be completely customized
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
         // Locally, you can createTable directly through sync: true
         sync: false,
       },
      
       // second data source
       default2: {
         // ...
       },
     },
   },
};
```

For more information, see [Data source management](../data_source).

## Model association

Relationships can be directly described in the model through `HasMany`, `@HasOne`, `@BelongsTo`, `@BelongsToMany`, and `@ForeignKey` decorators.

### One-to-many

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

`sequelize-typescript` associates internally and automatically queries related dependencies.

For example, you can use `find` to query.

```typescript
const team = await Team.findOne({ include: [Player] });

team.players.forEach((player) => {
  console.log('Player ${player.name}');
});
```

### Many-to-many

```typescript
import { Table, Model, Column, ForeignKey, BelongsToMany } from 'sequelize-typescript';

@Table
export class Book extends Model {
  @BelongsToMany(() => Author, () => BookAuthor)
  }
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

The above types are unsafe in some scenarios, such as the above `BookAuthor`, the `books` type of `Author`, which may lose some attributes and need to be set manually.

```typescript
@BelongsToMany(() => Book, () => BookAuthor)
books: Array<Book & {BookAuthor: BookAuthor}>;
```

### One to one

For one-to-one, use `@HasOne(...)` (the foreign key of the relationship exists on another model) and `@BelongsTo(...)` (the foreign key of the relationship exists on this model).

For example:

```typescript
import { Table, Column, Model, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';

@Table
export class Photo extends Model {
  @ForeignKey(() => User)
  @Column({
    comment: 'User Id',
  })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    Comment: 'name',
  })
  name: string;
}

@Table
export class User extends Model {
  @Column
  name: string;
}
```

## Static operation method

If it is a single data source, you can use the following static method.

### Save

Where it needs to be called, use the entity model to operate.

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

### Find and update

```typescript
import { Provide } from '@midwayjs/decorator';
import { Person } from '../entity/person';

@Provide()
export class PersonService {
  async updatePerson() {
    const person = await Person.findOne();
    // Update
    person.age = 100;
    await person.save();

    await Person.update (
      {
        name: 'bobby',
      },
      {
        where: { id: 1}
      }
    );
  }
}
```

## Repository Mode

Repository mode can separate static operations such as lookup and creation from the model definition. It also supports use with multiple sequelize instances (multiple data sources).

### Start Repository mode

Same as data source configuration, except that there is one more attribute.

```typescript
// src/config/config.default.ts

import { Person } from '../entity/person';

export default {
  // ...
  sequelize: {
    dataSource: {
      default: {
        // ...
        entities: [Person]

        // This one more
        repositoryMode: true
      },
    },
    sync: false
  },
};
```

If there are multiple data sources, be sure to turn this property on each data source. After the property is turned on, the original static operation method is no longer available.

You need to use the `Repository` operation method.

### Use Repository mode

The basic API is the same as the static operation. Midway has made some simple packages to it. The `InjectRepository` decorator can be used to inject `Repository` into the service.

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
    // Query
    let result = await this.photoRepository.findAll();
    console.log(result);

    // New
    await this.photoRepository.create({
      name: '123',
    });

    // Delete
    await this.photoRepository.destroy({
      where: {
        name: '123',
      },
    });

    // Joint query
    // SELECT * FROM photo WHERE name = "23" OR name = "34";
    let result = await this.photoRepository.findAll({
      where: {
        [Op.or]: [{ name: '23' }, { name: '34' }]
      },
    });
    // => result

    // even table query
    let result = await this.userRepository.findAll({ include: [Photo] });
    // => result
  }
}
```

More ways to use OP: [https:// sequelize.org/v5/manual/querying.html](https://sequelize.org/v5/manual/querying.html)

### Multi-dataSource support

In Repository mode, we can specify a specific data source in the `InjectRepository` parameters.

```typescript
import { Controller } from '@midwayjs/decorator';
import { InjectRepository } from '@midwayjs/sequelize';
import { Photo } from '../entity/photo';
import { User } from '../entity/user';

@Controller('/')
export class HomeController {
  // Specify a data source
  @InjectRepository(User, 'default')
  userRepository: Repository<User>;
  // ...
}
```



## Advanced Features

### Data source synchronization configuration

sequelize can add the sync parameter when synchronizing the data source.

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
    // You can use this to specify the default data source when there are multiple data sources
    defaultDataSourceName: 'default',
  },
};
```



### Specify the default data source

When including multiple data sources, you can specify a default data source.

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
    // You can use this to specify the default data source when there are multiple data sources
    defaultDataSourceName: 'default1',
  },
};
```



### Get data source

The data source is the created sequelize object, which we can obtain by injecting the built-in data source manager.

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

Starting with v3.8.0, it is also possible to inject via a decorator.

```typescript
import { Configuration } from '@midwayjs/decorator';
import { InjectDataSource } from '@midwayjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

@Configuration({
   //...
})
export class MainConfiguration {
  
   // Inject the default data source
   @InjectDataSource()
   defaultDataSource: Sequelize;
  
   // inject custom data source
   @InjectDataSource('default1')
   customDataSource: Sequelize;

   async onReady(container: IMidwayContainer) {
     //...
   }
}
```

## Common problem

### 1. Dialect needs to be explicitly supplied as of v4.0.0

The reason is that the data source in the configuration does not specify the `dialect` field, which confirms the structure, format of the data source and the result of the configuration merging.



## Other

- The above document is translated from sequelize-typescript. For more API, please refer to the [English document](<(https://github.com/sequelize/sequelize-typescrip)>).
- Some [cases](https://github.com/ddzyan/midway-practice)
- If you encounter complex problems, you can use the [raw query method](https://sequelize.org/v5/manual/raw-queries.html).
