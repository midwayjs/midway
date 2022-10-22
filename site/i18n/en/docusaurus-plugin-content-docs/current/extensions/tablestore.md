# TableStore

this topic describes how to use midway to access alibaba cloud TableStore.

Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |
| Contains independent main frame | ❌ |
| Contains independent logs | ❌ |


## Installation dependency

```bash
$ npm i @midwayjs/tablestore@3 --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies ": {
    "@midwayjs/tablestore": "^3.0.0",
    // ...
  },
  "devDependencies ": {
    // ...
  }
}
```



## Introducing components


First, introduce components and import them in `configuration.ts`:
```typescript
import { Configuration } from '@midwayjs/decorator';
import * as tablestore from '@midwayjs/tablestore';
import { join } from 'path'

@Configuration ({
  imports: [
    tablestore // Import tablestore Components
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```


## Configuration


For example:

**Single-client configuration**
```typescript
// src/config/config.default
export default {
  // ...
  tableStore: {
    client: {
      accessKeyId: '<your access key id>',
      secretAccessKey: '<your access key secret>',
      stsToken: '<your stsToken>', /*When you use the STS authorization, you need to fill in. ref:https://help.aliyun.com/document_detail/27364.html */
      endpoint: '<your endpoint>',
      instancename: '<your instance name>'
    },
  },
}
```


**null**

```typescript
// src/config/config.default
export default {
  // ...
  tableStore: {
    null
      Db1: {
        accessKeyId: '<your access key id>',
        secretAccessKey: '<your access key secret>',
        stsToken: '<your stsToken>', /*When you use the STS authorization, you need to fill in. ref:https://help.aliyun.com/document_detail/27364.html */
        endpoint: '<your endpoint>',
        instancename: '<your instance name>'
      },
      db2: {
        accessKeyId: '<your access key id>',
        secretAccessKey: '<your access key secret>',
        stsToken: '<your stsToken>', /*When you use the STS authorization, you need to fill in. ref:https://help.aliyun.com/document_detail/27364.html */
        endpoint: '<your endpoint>',
        instancename: '<your instance name>'
      },
    },
  },
}
```
null[](https://github.com/aliyun/aliyun-tablestore-nodejs-sdk)


## Use TableStore service


We can inject it into any code.
```typescript
null
import { TableStoreService } from '@midwayjs/tablestore';

@Provide()
export class UserService {

  null
  tableStoreService: TableStoreService;

  null
    await this.tableStoreService.putRow(params);
  }
}
```


null``
```typescript
import { TableStoreServiceFactory } from '@midwayjs/tablestore';
import { join } from 'path';

@Provide()
export class UserService {

  null
  null

  async save() {
    const db1 = await this.tableStoreServiceFactory.get('db1');
    const db2 = await this.tableStoreServiceFactory.get('db2');

    //...

  }
}
```


Example: getRow
```typescript
import { join } from 'path';
import {
  TableStoreService
  Long
  CompositeCondition
  SingleColumnCondition
  LogicalOperator
  ComparatorType
} from '@midawyjs/tablestore';

@Provide()
export class UserService {

  @Inject()
  tableStoreService: TableStoreService;

  null

    const data = await tableStoreService.getRow ({
      tableName: "sampleTable ",
      primaryKey: [{ 'gid': Long.fromNumber(20013) }, { 'uid': Long.fromNumber(20013) }]
      columnFilter: condition
    });

    // TODO

  }
}
```
As shown in the example, the types exported in the original tablestore package should have been proxied and taken over by @midwayjs/tablestore. For more specific method parameters, see the [example](https://github.com/midwayjs/midway/tree/2.x/packages/tablestore/test/sample).
