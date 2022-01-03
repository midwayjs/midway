# 对象存储（COS）

本文介绍了如何使用 midway 接入腾讯云 COS。

## 安装依赖

```bash
$ npm i @midwayjs/cos@3 --save
```

## 引入组件


首先，引入 组件，在 `configuration.ts` 中导入：
```typescript
import { Configuration } from '@midwayjs/decorator';
import * as cos from '@midwayjs/cos';	
import { join } from 'path'

@Configuration({
  imports: [
    cos		// 导入 cos 组件
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class ContainerLifeCycle {
}
```


## 配置

比如：


**单客户端配置**
```typescript
export const cos = {
  client: {
    secretId: '***********',
    secretKey: '***********',
  },
};
```


**多个客户端配置，需要配置多个**
```typescript
export const cos = {
  clients: {
    instance1: {
      secretId: '***********',
    	secretKey: '***********',
    },
    instance2: {
      secretId: '***********',
    	secretKey: '***********',
    },
  },
};
```
更多参数可以查看 [cos-nodejs-sdk-v5](https://github.com/tencentyun/cos-nodejs-sdk-v5) 文档。


## 使用 COS 服务


我们可以在任意的代码中注入使用。
```typescript
import { Provide, Controller, Inject, Get } from '@midwayjs/decorator';
import { CosService } from '@midwayjs/cos';

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


可以使用 `COSServiceFactory` 获取不同的实例。
```typescript
import { COSServiceFactory } from '@midwayjs/cos';
import { join } from 'path';

@Provide()
export class UserService {
  
  @Inject()
  cosServiceFactory: COSServiceFactory;
  
  async save() {
    const redis1 = await this.cosServiceFactory.get('instance1');
    const redis2 = await this.cosServiceFactory.get('instance3');
    
    //...
   
  }
}
```

