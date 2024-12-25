# 标签组件

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的通用标签组件。

### 使用场景
标签是一种抽象化的服务端常用系统化能力，可用于多种用途，如：
+ 组织管理资源
    - 实现分类系统（面向内容、人群等）
    - 资源管理系统
        + 图片添加各种颜色标签、物体和场景标签，通过标签筛选图片
        + 视频等素材标签
+ 访问控制
    - 权限系统（管理员、编辑、游客）
+ 状态系统（编辑中、已发布等）

基于标签系统提供的增删改查，以及通过标签，对绑定了标签的 `实体` 进行增删改查，能够很方便的实现更多高级的业务逻辑。

标签系统就是为了这种业务场景，让服务端基于标签能力，实现更高效、便捷的业务开发。

相关信息：

| web 支持情况      |      |
| ----------------- | ---- |
| @midwayjs/koa     | ✅    |
| @midwayjs/faas    | ✅    |
| @midwayjs/web     | ✅    |
| @midwayjs/express | ✅    |


### 如何使用？

1. 安装依赖

```bash
$ npm i @midwayjs/tags --save
```

2. 在 configuration 中引入组件

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as tags from '@midwayjs/tags';
@Configuration({
  imports: [
    // ...
    tags
  ],
})
export class MainConfiguration {}
```

3. 添加配置

```typescript
// src/config/config.local.ts
export default {
  tags: {
    clients: {
      'tagGroup1': {
        // 使用 本机内存 作为数据存储
        dialectType: 'memory',
      },
    },
  }
}
```

4. 在代码中调用
```typescript
// src/testTags.ts
import { Provide, Inject, InjectClient } from '@midwayjs/core';
import { TagServiceFactory, TagClient } from '@midwayjs/tags';
@Provide()
export class TestTagsService {
  @Inject()
  tags: TagServiceFactory;

  // 相当于 this.tags.get('tagGroup1')
  @InjectClient(TagServiceFactory, 'tagGroup1')
  tagClient: TagClient;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/tags/list', method: 'get'})
  async listTags() {
    // 也可以直接使用 this.tagClient
    const tagClient: TagClient = this.tags.get('tagGroup1');
    // add new tag
    const tagInfo = await tagClient.new({
      name: 'test-tag-name',
      desc: 'tag desc',
    });
    /*
    tagInfo = {
      success: true,
      id: 1,
    }
    */
    // list top 20 tags
    const tags = await tagClient.list({ count: true });
    /*
    tags: {
      list: [
        {
          id: 1,
          name: 'test-tag-name',
          desc: 'tag desc'
        }
      ],
      total: 1
    }
    */
    return tags;
  }
}

```

### 方法

#### 新增标签 new

```typescript
new(tagDefine:  {
  // 标签名，在同一个 group 里面不能重复
  name: string;
  // 标签描述
  desc?: string;
}): Promise<{
  success: boolean;
  message: string;
  // 标签id
  id?: number;
}>;
```
#### 删除标签 remove
删除标签也会删除和这个标签绑定的实体关系

```typescript
remove(tagIdOrName: number | string): Promise<{
  success: boolean;
  message: string;
  // 标签id
  id?: number;
}>;
```
#### 更新标签 update
更细一个标签的基础信息
```typescript
update(tagIdOrName: number | string, params: Partial< {
  name: string;
  desc?: string;
}>): Promise<{
  success: boolean;
  message: string;
  // 标签id
  id?: number;
}>;
```
#### 列举标签 list
搜索标签，支持分页

```typescript
list(listOptions?: {
  // 搜索的标签，支持传入标签 id 和标签名
  tags?: Array<number | string>;
  // 检索的时候标签是采用交集还是并集，取值为 and 和 or
  type?: MATCH_TYPE;
  count?: boolean;
  pageSize?: number;
  page?: number;
}): Promise<{
  // 标签列表
  list: {
    id: number;
    name: string;
    desc: string;
    createAt: number;
    updateAt: number;
  }[];
  // 标签总数
  total?: number;
}>;
```
#### 绑定实体 bind
绑定实体的意思就是将其他的任何东西绑定到一个标签上，这里的实体可以是一张图片、也可以是一个文件，实体的id由用户自己控制

```typescript
bind(bindOptions: {
  // 标签列表
  tags: Array<number | string>;
  // 不存在标签的话自动创建标签，并绑定，默认为false
  autoCreateTag?: boolean;
  // 实体id
  objectId: number,
}): Promise<{
  success: boolean;
  message: string;
}>
```
#### 解绑实体 unbind

```typescript
unbind(unbindOptions: {
  // 解绑的多个标签，标签id或者是标签 name
  tags: Array<number | string>,
  // 实体id
  objectId: number,
}): Promise<{
  success: boolean;
  message: string;
}>
```
#### 根据标签列举实体 listObjects

```typescript
listObjects(listOptions?: {
  // 标签id或者是标签 name
  tags?: Array<string|number>;
  count?: boolean;
  // 检索的时候标签是采用交集还是并集，取值为 and 和 or
  type?: MATCH_TYPE;
  pageSize?: number;
  page?: number;
}): Promise<{
  // 实体的 id 列表
  list: number[];
  // 实体总数
  total?: number;
}>;
```
#### 根据实体获取标签 listObjectTags


```typescript
listObjectTags(listOptions?: {
  // 实体id
  objectId: number;
  count?: boolean;
  pageSize?: number;
  page?: number;

}): Promise<{
  list: { // 标签列表
    name: string;
    desc?: string;
    id: number;
    createAt: number;
    updateAt: number;
  }[];
  // 标签总数
  total?: number;
}>;
```
### 配置

Tags 支持内存存储（默认）和 mysql 数据库存储两种方式，下面是一个配置的示例：
```typescript
// src/config/config.local.ts
export default {
  tags: {
    clients: {
      'tagGroup1': {
        // 使用 本机内存 作为数据存储
        dialectType: 'memory',
      },
      'tagGroup2': {
        // 使用 mysql 作为数据存储
        dialectType: 'mysql',
        // 自动同步表结构
        sync: true,
        // mysql 连接实例
        instance: mysqlConnection.promise(),
      },
    },
  }
}
```

#### 内存存储配置

| 配置 | 值类型 | 默认值 | 配置描述 |
| -- | -- | -- | -- |
| dialectType | string `memory` | - | 配置为 `memory`，则启用内存存储 |

#### Mysql 存储配置

如果要使用 Mysql 数据库作为数据存储，那么需要将 Mysql 的 `数据库连接对象` 传入 tags 的配置中。


| 配置 | 值类型 | 默认值 | 配置描述 |
| -- | -- | -- | -- |
| dialectType | string `mysql` | - | 配置为 `mysql`，则启用 Mysql 存储 |
| sync | boolean | `false` | 自动同步 Tags 的表结构，Tags组件会创建两张数据表，详见下方的数据表信息 |
| instance | `{ query: (sql: string, placeholder?: any[])}: Promise<[]>` | - | Mysql 连接的示例，需要提供一个 query 方法，可以查看下面的示例 |
| tablePrefix | string | - | 数据表前缀 |
| tableSeparator | string | `_` | 数据表的拼接分隔符 |

下面是使用 `mysql2` 这个 npm 包进行数据库连接的示例：

```typescript
// src/config/config.local.ts
const mysql = require('mysql2');
export default () => {
  const connection = mysql.createConnection({
      host: 'db4free.net',
      user: 'tag***',
      password: 'tag***',
      database: 'tag***',
      charset: 'utf8',
  });
  return {
    tags: {
      clients: {
        'tagGroup': {
          dialectType: 'mysql',
          sync: true,
          instance: { // 包含 query 的mysql连接实例
            query: (...args) => {
              return connection.promise().query(...args);
            }
          },
        },
      },
    }
  }
}
```

你也可以考虑在 `configuration.ts` 中的 `onConfigLoad` 生命周期中进行数据库连接，这样的好处是在关闭时，可以关闭数据库连接：

```typescript
// src/configuration.ts
import { Config, Configuration } from '@midwayjs/core';
import { join } from 'path';
import * as tags  from '@midwayjs/tags';
import { ITagMysqlDialectOption } from '@midwayjs/tags';
const mysql = require('mysql2');

@Configuration({
  imports: [
    tags
  ],
})
export class MainConfiguration {
  connection;

  @Config()
  tags;

  async onConfigLoad(container) {
    // 创建 mysql 连接
    this.connection = mysql.createConnection({
      host: 'db4free.net',
      user: 'tag***',
      password: 'tag***',
      database: 'tag***',
      charset: 'utf8',
    });
    let dialect: ITagMysqlDialectOption = {
      dialectType: 'mysql',
      sync: true,
      instance: {
        query: (...args) => {
          return this.connection.promise().query(...args);
        }
      }
    };

    return {
      tags: dialect
    }
  }

  async onStop() {
    // 关闭 mysql 连接
    this.connection.close();
  }
}

```


##### 数据表信息

Tags 组件需要两种数据表来存储数据，分别是 `tag` 和 `relationship`，这两张表在数据库中真实的表名，是通过配置中的 `表名前缀`、`表名分隔符` 和 `客户端名/分组名` 进行拼接的，例如：


```typescript
const clientName = 'local-test';
const { tablePrefix = 'a', tableSeparator = '_' } = tagOptions;
const tagTableName = `${tablePrefix}${tableSeparator}${clientName}${tableSeparator}tag`;
// tagTableName: a_local-test_tag
const relationshipTableName =  `${tablePrefix}${tableSeparator}${clientName}${tableSeparator}relationship`
// relationshipTableName: a_local-test-relationship
```


当你在配置中启用 `sync` 的自动表结构同步时，如果没有这两张表，就会根据下述的表结构创建对应的数据表：

`tag` 表结构：
```sql
CREATE TABLE `tag` (
    `id` BIGINT unsigned NOT NULL AUTO_INCREMENT,
    `group` varchar(32) NULL,
    `name` varchar(32) NULL,
    `descri` varchar(128) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `update_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP  ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
)
```


`relationship` 表结构：
```sql
CREATE TABLE `relationship` (
    `id` BIGINT unsigned NOT NULL AUTO_INCREMENT,
    `tid` BIGINT unsigned NOT NULL,
    `oid` BIGINT unsigned NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `update_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP  ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
)
```
