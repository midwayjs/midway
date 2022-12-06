# Alibaba Cloud Object Storage (OSS)

Object Storage Service (OSS) is a massive, secure, low-cost, and highly reliable cloud storage service provided by Alibaba Cloud. Its data design durability is not less than 99.999999999% and service design availability is not less than 99.99%. With platform-independent RESTful API interfaces, you can store and access any type of data in any application, at any time, and at any place.

The `@midwayjs/oss` component is the sdk used to interface with OSS services under the midway system.

Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |



## Antecedents


To use OSS components, you need to apply for an OSS bucket in advance. Bucket is the concept of OSS repository in which all your files are stored.


- OSS Object Storage Service (OSS): [https:// www.aliyun.com/product/oss](https://www.aliyun.com/product/oss)
- What is Object Storage: [https:// www.alibabacloud.com/help/zh/doc-detail/31817 htm](https://www.alibabacloud.com/help/zh/doc-detail/31817.htm)


## Installation dependency

`@midwayjs/oss` is the main function package of oss.

```bash
$ npm i @midwayjs/oss@3 --save
```
Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/oss": "^3.0.0",
    // ...
  }
}
```




## Introducing components


First, introduce components and import them in `configuration.ts`:

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as oss from '@midwayjs/oss';
import { join } from 'path'

@Configuration({
  imports: [
    // ...
    oss // import oss components
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```


## Configure OSS


OSS components need to be configured before they can be used. You need to enter OSS bucket, accessKeyId, accessKeySecret and other necessary information.


Supports common oss clients and oss cluster clients based on the [ali-oss](https://github.com/ali-sdk/ali-oss/) package.


For example:

**Common OSS bucket configuration**
```typescript
// src/config/config.default
export default {
  // ...
  oss: {
    // normal oss bucket
    client: {
      accessKeyId: 'your access key',
      accessKeySecret: 'your access secret',
      bucket: 'your bucket name',
      endpoint: 'oss-cn-hongkong.aliyuncs.com',
      timeout: '60s',
    },
  },
}
```


**OSS bucket configuration in cluster (cluster) mode, you need to configure multiple**

```typescript
// src/config/config.default
export default {
  // ...
  oss: {
    // need to config all bucket information under cluster
    client: {
      clusters: [{
        endpoint: 'host1',
        accessKeyId: 'id1',
        accessKeySecret: 'secret1',
      }, {
        endpoint: 'host2',
        accessKeyId: 'id2',
        accessKeySecret: 'secret2',
      }],
      schedule: 'masterSlave', //default is 'roundRobin'
      timeout: '60s',
    }
  },
}
```

**STS**
```typescript
// src/config/config.default
export default {
  // ...
  oss: {
    // if config.sts == true, oss will create STS client
    client: {
      sts: true
      accessKeyId: 'your access key',
      accessKeySecret: 'your access secret',
    },
  },
}
```

## Use components


You can directly get the `OSSService` and then call the interface, for example, to save the file.
```typescript
import { OSSService } from '@midwayjs/oss';
import { join } from 'path';

@Provide()
export class UserService {

  @Inject()
  ossService: OSSService;

  async saveFile() {


    const localFile = join(__dirname, 'test.log');
    const result = await this.ossService.put('/test/test.log', localFile);

    // => result.url
  }
}
```


If STS mode is configured, the client can use `OSSSTSService`.
```typescript
import { OSSSTSService } from '@midwayjs/oss';
import { join } from 'path';

@Provide()
export class UserService {

  @Inject()
  stsService: OSSSTSService;

  async saveFile() {

    const roleArn = '******'; // This is arn of ariyun role
    const result = await this.stsService.assumeRole(roleArn);

    // result.credentials.AccessKeyId
    // result.credentials.AccessKeySecret;
    // result.credentials.SecurityToken;
  }
}
```

For more information about OSS client APIs, see [OSS documentation](https://github.com/ali-sdk/ali-oss).


## Use multiple OSS Buckets


Some applications need to access multiple oss buckets, so you need to configure `oss.clients`.
```typescript
// src/config/config.default
export default {
  // ...
  oss: {
    clients: {
      bucket1: {
        bucket: 'bucket1',
        // ...
      },
      bucket2: {
        bucket: 'bucket2',
        // ...
      },
    },
    // client, clients, configuration shared by createInstance methods
    default: {
      endpoint: '',
      accessKeyId: '',
      accessKeySecret: '',
    },
  },
  // other custom config
  bucket3: {
    bucket: 'bucket3',
    // ...
  },
}
```

You can use `OSSServiceFactory` to get different instances.

```typescript
import { OSSServiceFactory } from '@midwayjs/oss';
import { join } from 'path';

@Provide()
export class UserService {

  @Inject()
  ossServiceFactory: OSSServiceFactory;

  @Config('bucket3')
  bucket3Config;

  async saveFile() {

    // The default type is OSSService
    const bucket1 = this.ossServiceFactory.get('bucket1');
    const bucket2 = this.ossServiceFactory.get('bucket2');

    // If it is STS, you need to set a generic contact.
    // const bucket1 = this.ossServiceFactory.get<OSSSTSService>('bucket1');

    // config.bucket3 and config.oss.default will be merged
    const bucket3 = await this.ossServiceFactory.createInstance(this.bucket3Config, 'bucket3');
    // After passing the name, you can also get it from the factory.
    bucket3 = this.ossServiceFactory.get('bucket3');

  }
}
```
