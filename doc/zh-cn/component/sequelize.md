# Sequelize

本文档介绍如何在 Midway 中使用 Sequelize 模块。



相关信息：

| 描述                 |      |
| -------------------- | ---- |
| 可作为主框架独立使用 | ❌    |
| 包含自定义日志       | ❌    |
| 可独立添加中间件     | ❌    |



## 使用方法：

```bash
$ npm i @midwayjs/sequelize@3 --save
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


## 引入模块

在 configuration.ts 文件中

```typescript
import { App, Configuration } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from 'egg';
import { join } from 'path';
import * as sequlize from '@midwayjs/sequelize';

@Configuration({
  imports: [sequlize],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle implements ILifeCycle {
  @App()
  app: Application;

  async onReady() {
    
  }
}
```

## 配置

在 config.default.ts 中配置：

```typescript
export const sequelize = {
  options: {
    database: 'test4',
    username: 'root',
    password: '123456',
    host: '127.0.0.1',  // 此处支持idb上面vipserver key的那种方式，也支持aliyun的地址。
    port: 3306,
    encrypt: false,
    dialect: 'mysql',
    define: { charset: 'utf8' },
    timezone: '+08:00',
    logging: console.log
  },
  sync: false // 本地的时候，可以通过sync: true直接createTable
}
```

## 业务层

定义Entity

```typescript
import { Column, Model } from "sequelize-typescript";
import { BaseTable } from "@midwayjs/sequelize";

@BaseTable
export class Photo extends Model{
  @Column({
    comment: '名字'
  })
  name: string;
}
```

使用Entity:

查询列表

```typescript
import { Config, Controller, Get, Provide } from '@midwayjs/decorator';
import { Photo } from '../entity/Photo';

@Provide()
@Controller('/')
export class HomeController {

  @Get('/')
  async home() {
    let result = await Photo.findAll()
    console.log(result);
    return 'hello world'
  }
}
```

增加数据：

```typescript
import { Config, Controller, Get, Provide } from '@midwayjs/decorator';
import { Photo } from '../entity/Photo';

@Provide()
@Controller('/')
export class HomeController {

  @Post('/add')
  async home() {
    let result = await Photo.create({
      name: '123'
    });
    console.log(result);
    return 'hello world'
  }
}
```

删除：

```typescript
import { Config, Controller, Get, Provide } from '@midwayjs/decorator';
import { Photo } from '../entity/Photo';

@Provide()
@Controller('/')
export class HomeController {

  @Post('/delete')
  async home() {
    await UserModel.destroy({
      where: {
        name: '123'
      }
    });
    return 'hello world'
  }
}
```

查找单个：

```typescript
import { Config, Controller, Get, Provide } from '@midwayjs/decorator';
import { Photo } from '../entity/Photo';

@Provide()
@Controller('/')
export class HomeController {

  @Post('/delete')
  async home() {
    let result = await UserModel.findOne({
      where: {
        name: '123'
      }
    });
    return 'hello world'
  }
}
```

联合查询：

```typescript
import { Config, Controller, Get, Provide } from '@midwayjs/decorator';
import { Photo } from '../entity/Photo';
import { Op } from 'sequelize';

@Provide()
@Controller('/')
export class HomeController {

  @Get('/')
  async home() {
    let result = await Photo.findAll({
      where: {
        [Op.or]: [{name: "23"}, {name: "34"}] // SELECT * FROM photo WHERE name = "23" OR name = "34";
      }
    })
    console.log(result);
    return 'hello world'
  }
}
```

关于OP的更多用法：[https://sequelize.org/v5/manual/querying.html](https://sequelize.org/v5/manual/querying.html)


如果遇到比较复杂的，可以使用raw query方法：
[https://sequelize.org/v5/manual/raw-queries.html](https://sequelize.org/v5/manual/raw-queries.html)