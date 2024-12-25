# TableStore

本文介绍了如何使用 midway 接入阿里云 TableStore。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ✅    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |


## 安装依赖

```bash
$ npm i @midwayjs/tablestore@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/tablestore": "^3.0.0",
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```



## 引入组件


首先，引入组件，在 `configuration.ts` 中导入：
```typescript
import { Configuration } from '@midwayjs/core';
import * as tablestore from '@midwayjs/tablestore';
import { join } from 'path'

@Configuration({
  imports: [
    tablestore		// 导入 tablestore 组件
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```


## 配置


比如：

**单客户端配置**
```typescript
// src/config/config.default
export default {
  // ...
  tableStore: {
    client: {
      accessKeyId: '<your access key id>',
      secretAccessKey: '<your access key secret>',
      stsToken: '<your stsToken>', /*When you use the STS authorization, you need to fill in. ref:https://help.aliyun.com/document_detail/27364.html*/
      endpoint: '<your endpoint>',
      instancename: '<your instance name>'
    },
  },
}
```


**多个客户端配置，需要配置多个**

```typescript
// src/config/config.default
export default {
  // ...
  tableStore: {
    clients: {
      db1: {
        accessKeyId: '<your access key id>',
        secretAccessKey: '<your access key secret>',
        stsToken: '<your stsToken>', /*When you use the STS authorization, you need to fill in. ref:https://help.aliyun.com/document_detail/27364.html*/
        endpoint: '<your endpoint>',
        instancename: '<your instance name>'
      },
      db2: {
        accessKeyId: '<your access key id>',
        secretAccessKey: '<your access key secret>',
        stsToken: '<your stsToken>', /*When you use the STS authorization, you need to fill in. ref:https://help.aliyun.com/document_detail/27364.html*/
        endpoint: '<your endpoint>',
        instancename: '<your instance name>'
      },
    },
  },
}
```
更多参数可以查看 [aliyun tablestore sdk](https://github.com/aliyun/aliyun-tablestore-nodejs-sdk) 文档。


## 使用 TableStore 服务


我们可以在任意的代码中注入使用。
```typescript
import { Provide, Controller, Inject, Get } from '@midwayjs/core';
import { TableStoreService } from '@midwayjs/tablestore';

@Provide()
export class UserService {

  @Inject()
  tableStoreService: TableStoreService;

  async invoke() {
    await this.tableStoreService.putRow(params);
  }
}
```


可以使用 `TableStoreServiceFactory` 获取不同的实例。
```typescript
import { TableStoreServiceFactory } from '@midwayjs/tablestore';
import { join } from 'path';

@Provide()
export class UserService {

  @Inject()
  tableStoreServiceFactory: TableStoreServiceFactory;

  async save() {
    const db1 = await this.tableStoreServiceFactory.get('db1');
    const db2 = await this.tableStoreServiceFactory.get('db2');

    //...

  }
}
```


示例：getRow
```typescript
import { join } from 'path';
import {
  TableStoreService,
  Long,
  CompositeCondition,
  SingleColumnCondition,
  LogicalOperator,
  ComparatorType
} from '@midwayjs/tablestore';

@Provide()
export class UserService {

  @Inject()
  tableStoreService: TableStoreService;

  async getInfo() {

    const data = await tableStoreService.getRow({
      tableName: "sampleTable",
      primaryKey: [{ 'gid': Long.fromNumber(20013) }, { 'uid': Long.fromNumber(20013) }],
      columnFilter: condition
    });

    // TODO

  }
}
```
如示例所示，原有的 tablestore 包中导出的类型，应该都已经被 @midwayjs/tablestore 代理和接管，更多具体方法参数可以查看 [示例](https://github.com/midwayjs/midway/tree/2.x/packages/tablestore/test/sample)。
