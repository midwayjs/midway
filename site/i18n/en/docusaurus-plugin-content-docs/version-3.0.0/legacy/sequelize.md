# Sequelize

:::tip
This document is obsolete from v3.4.0.
:::

This document describes how to use Sequelize modules in Midway.

Related information:

| Description |     |
| ----------------- | --- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |

## Usage:

```bash
$ npm i @midwayjs/sequelize@3 sequelize --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/sequelize": "^3.0.0",
    "sequelize": "^6.13.0"
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

## Introduction module

In the configuration.ts file

```typescript
import { App, Configuration, ILifeCycle } from '@midwayjs/core';
import { Application } from '@midwayjs/web';
import { join } from 'path';
import * as sequelize from '@midwayjs/sequelize';

@Configuration({
  imports: [sequelize]
  importConfigs: [join(__dirname, './config')]
})
export class MainConfiguration implements ILifeCycle {
  @App()
  app: Application;

  async onReady() {}
}
```

## Configuration

Configure in config.default.ts:

```typescript
// src/config/config.default.ts
export default {
  // ...
  sequelize: {
    dataSource: {
      default: {
        database: 'test4',
        username: 'root',
        password: '123456',
        Host: '127.0.0.1', // here supports the way key is vipserver above idb, and aliyun's address is also supported.
        port: 3306
        encrypt: false
        dialect: 'mysql',
        define: { charset: 'utf8'}
        timezone: '+08:00',
        logging: console.log
      },
    },
    sync: false, // local, you can directly createTable it through sync: true
  },
};
```

## Business layer

### Define Entity

```typescript
import { Column, Model, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { BaseTable } from '@midwayjs/sequelize';
import { User } from './User';

@BaseTable
export class Photo extends Model {
  @ForeignKey(() => User)
  @Column({
    comment: 'User Id',
  })
  userId: number;
  @BelongsTo(() => User) user: User;

  @Column({
    comment: 'name',
  })
  name: string;
}
```

```typescript
import { Model, Column, HasMany } from 'sequelize-typescript';
import { BaseTable } from '@midwayjs/sequelize';
import { Photo } from './Photo';

@BaseTable
export class User extends Model {
  @Column name! : string;
  @HasMany(() => Photo) Photo: Photo[];
}
```

### Use Entity:

#### Query list

```typescript
import { Config, Controller, Get, Provide } from '@midwayjs/core';
import { Photo } from '../entity/Photo';

@Provide()
@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    let result = await Photo.findAll();
    console.log(result);
    return 'hello world';
  }
}
```

Add data:

```typescript
import { Controller, Post, Provide } from '@midwayjs/core';
import { Photo } from '../entity/Photo';

@Provide()
@Controller('/')
export class HomeController {
  @Post('/add')
  async home() {
    let result = await Photo.create({
      name: '123',
    });
    console.log(result);
    return 'hello world';
  }
}
```

#### Delete:

```typescript
import { Controller, Post, Provide } from '@midwayjs/core';
import { Photo } from '../entity/Photo';

@Provide()
@Controller('/')
export class HomeController {
  @Post('/delete')
  async home() {
    await Photo.destroy({
      where: {
        name: '123',
      },
    });
    return 'hello world';
  }
}
```

#### Find individual:

```typescript
import { Controller, Post, Provide } from '@midwayjs/core';
import { Photo } from '../entity/Photo';

@Provide()
@Controller('/')
export class HomeController {
  @Post('/delete')
  async home() {
    let result = await Photo.findOne({
      where: {
        name: '123',
      },
    });
    return 'hello world';
  }
}
```

#### Joint enquiries:

```typescript
import { Controller, Get, Provide } from '@midwayjs/core';
import { Photo } from '../entity/Photo';
import { Op } from 'sequelize';

@Provide()
@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    // SELECT * FROM photo WHERE name = "23" OR name = "34";
    let result = await Photo.findAll({
      where: {
        [Op.or]: [{ name: '23' }, { name: '34' }],
      },
    });
    console.log(result);
    return 'hello world';
  }
}
```

#### table query

```typescript
import { Controller, Get, Provide } from '@midwayjs/core';
import { User } from '../entity/User';
import { Photo } from '../entity/Photo';

@Provide()
@Controller('/users')
export class HomeController {
  @Get('/')
  async home() {
    let result = await User.findAll({ include: [Photo] });
    console.log(result);
    return 'hello world';
  }
}
```

More ways to use OP: [https:// sequelize.org/v5/manual/querying.html](https://sequelize.org/v5/manual/querying.html)

Midway + sequelize Complete Use Case [https:// github.com/ddzyan/midway-practice](https://github.com/ddzyan/midway-practice)

If you encounter more complicated ones, you can use the raw query method:
[https://sequelize.org/v5/manual/raw-queries.html](https://sequelize.org/v5/manual/raw-queries.html)
