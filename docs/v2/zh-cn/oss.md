---
title: 对象存储（OSS）
---

阿里云对象存储服务（Object Storage Service，简称 OSS），是阿里云提供的海量、安全、低成本、高可靠的云存储服务。其数据设计持久性不低于 99.999999999%，服务设计可用性不低于 99.99%。具有与平台无关的 RESTful API 接口，您可以在任何应用、任何时间、任何地点存储和访问任意类型的数据。
​

`@midwayjs/oss` 组件就是在 midway 体系下用于对接 OSS 服务的 sdk。
​

​

## 前置条件

使用 OSS 组件，你需要提前申请一个 OSS Bucket。Bucket 是 OSS 的存储库的概念，你的文件都将存储在这个库里。
​

- OSS 对象存储官网：[https://www.aliyun.com/product/oss](https://www.aliyun.com/product/oss)
- 什么是对象存储：[https://www.alibabacloud.com/help/zh/doc-detail/31817.htm](https://www.alibabacloud.com/help/zh/doc-detail/31817.htm)

​

## 安装依赖

`@midwayjs/oss` 是主要的功能包，`@types/ali-oss` 是 oss 的官方定义包。

```bash
$ npm i @midwayjs/oss --save
$ npm i @types/ali-oss --save-dev			// 安装到 dev 依赖
```

如果发现 OSSService 没有方法定义，请务必检查此项。

## 引入组件

首先，引入 组件，在 `configuration.ts`  中导入：

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as oss from '@midwayjs/oss';
import { join } from 'path';

@Configuration({
  imports: [
    oss, // 导入 oss 组件
  ],
  importConfigs: [join(__dirname, 'config')],
})
export class ContainerLifeCycle {}
```

​

## 配置 OSS

OSS 组件需要配置后才能使用。需要填写 OSS 的 bucket、accessKeyId、accessKeySecret 等必要信息。
​

支持普通 oss 客户端和 oss 集群客户端，基于 [ali-oss](https://github.com/ali-sdk/ali-oss/) 这个包。
​

比如：
​

**普通的 oss bucket 配置**

```typescript
// normal oss bucket
export const oss = {
  client: {
    accessKeyId: 'your access key',
    accessKeySecret: 'your access secret',
    bucket: 'your bucket name',
    endpoint: 'oss-cn-hongkong.aliyuncs.com',
    timeout: '60s',
  },
};
```

**集群（cluster） 模式的 oss bucket 配置，需要配置多个**
**​**

```typescript
// need to config all bucket information under cluster
export const oss = {
  client: {
    cluster: [
      {
        endpoint: 'host1',
        accessKeyId: 'id1',
        accessKeySecret: 'secret1',
      },
      {
        endpoint: 'host2',
        accessKeyId: 'id2',
        accessKeySecret: 'secret2',
      },
    ],
    schedule: 'masterSlave', //default is `roundRobin`
    timeout: '60s',
  },
};
```

**sts 模式**

```typescript
// if config.sts == true, oss will create STS client
export const oss = {
  client: {
    sts: true,
    accessKeyId: 'your access key',
    accessKeySecret: 'your access secret',
  },
};
```

## 使用组件

可以直接获取 `OSSService`，然后调用接口，比如，保存文件。

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

​

如果配置的是 STS 模式，客户端可以使用 `OSSSTSService` 。

```typescript
import { OSSSTSService } from '@midwayjs/oss';
import { join } from 'path';

@Provide()
export class UserService {
  @Inject()
  stsService: OSSSTSService;

  async saveFile() {
    const roleArn = '******'; // 这里是阿里云角色的 arn
    const result = await this.stsService.assumeRole(roleArn);

    // result.credentials.AccessKeyId
    // result.credentials.AccessKeySecret;
    // result.credentials.SecurityToken;
  }
}
```

​

更多的 OSS 客户端 API，请查看 [OSS 文档](https://github.com/ali-sdk/ali-oss)。
​

## 使用多个 OSS Bucket

有些应用需要访问多个 oss bucket，那么就需要配置 `oss.clients`。

```typescript
export const oss = {
  clients: {
    bucket1: {
      bucket: 'bucket1',
    },
    bucket2: {
      bucket: 'bucket2',
    },
  },
  // shared by client, clients and createInstance
  default: {
    endpoint: '',
    accessKeyId: '',
    accessKeySecret: '',
  },
};

export const bucket3 = {
  bucket: 'bucket3',
};
```

可以使用 `OSSServiceFactory` 获取不同的实例。

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
    // 默认获取的类型是 OSSService
    const bucket1 = this.ossServiceFactory.get('bucket1');
    const bucket2 = this.ossServiceFactory.get('bucket2');

    // 如果是 STS，需要设置泛型联系
    // const bucket1 = this.ossServiceFactory.get<OSSSTSService>('bucket1');

    // 会合并 config.bucket3 和 config.oss.default
    const bucket3 = await this.ossServiceFactory.createInstance(this.bucket3Config, 'bucket3');
    // 传了名字之后也可以从 factory 中获取
    bucket3 = this.ossServiceFactory.get('bucket3');
  }
}
```
