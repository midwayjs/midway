# Tencent Cloud Object Storage (COS)

This article describes how to use midway to access Tencent Cloud COS.

Related information:

| Description |     |
| ----------------- | --- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |



## Installation dependency

```bash
$ npm i @midwayjs/cos@3 --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/cos": "^3.0.0",
    // ...
  },
}
```



## Introducing components


First, introduce components and import them in `configuration.ts`:

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as cos from '@midwayjs/cos';
import { join } from 'path'

@Configuration({
  imports: [
    // ...
    cos // import cos components
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
  cos: {
    client: {
      SecretId: '***********',
      SecretKey: '***********',
    },
  },
}
```


**Configure multiple clients.**

```typescript
// src/config/config.default
export default {
  // ...
  cos: {
    clients: {
      instance1: {
        SecretId: '***********',
        SecretKey: '***********',
      },
      instance2: {
        SecretId: '***********',
        SecretKey: '***********',
      },
    },
  },
}
```
For more parameters, see the [cos-nodejs-sdk-v5](https://github.com/tencentyun/cos-nodejs-sdk-v5) document.


## Use COS service


We can inject it into any code.
```typescript
import { Provide, Controller, Inject, Get } from '@midwayjs/decorator';
import { COSService } from '@midwayjs/cos';

@Provide()
export class UserService {

  @Inject()
  cosService: COSService;

  async invoke() {
    await this.cosService.sliceUploadFile({
      Bucket: 'test-1250000000',
      Region: 'ap-guangzhou',
      Key: '1.zip',
      FilePath: './1.zip'
    },
  }
}
```


You can use `COSServiceFactory` to get different instances.
```typescript
import { COSServiceFactory } from '@midwayjs/cos';
import { join } from 'path';

@Provide()
export class UserService {

  @Inject()
  cosServiceFactory: COSServiceFactory;

  async save() {
    const cos1 = await this.cosServiceFactory.get('instance1');
    const cos2 = await this.cosServiceFactory.get('instance3');

    //...

  }
}
```

