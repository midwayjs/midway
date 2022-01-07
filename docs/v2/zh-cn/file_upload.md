---
title: FaaS 文件上传
---

### 一、使用场景

仅适用于 Serverless 环境，小于 6M 的文件上传到函数端，进行文件相关处理操作。
​

### 二、前置需求

确认上传的文件是否小于 6M，超过 6M 的文件建议使用 OSS 直传方案。
​

### 三、代码中如何使用

#### 1. 代码中安装上传组件

```bash
npm i @midwayjs/faas-middleware-upload --save
```

#### 2. 添加配置

在函数目录中创建 config 目录，在此目录中添加 `config.default.ts` 文件

```typescript
// config/config.default.ts
export const upload = {
  mod: 'stream',
};
```

####

配置中的 mod 支持三种模式，默认为 `stream`，即流式，还支持 `buffer` 和 `file` 两种配置，这三种 mod 配置分别对应的 file.data 为 ReadStream、File Data Buffer 和 临时文件地址。

####

#### 3. 添加组件

在函数目录中创建 `configuration.ts` 文件

```typescript
// configuration.ts
import { Configuration, App } from '@midwayjs/decorator';
import * as Upload from '@midwayjs/faas-middleware-upload';

@Configuration({
  importConfigs: ['./config/'],
  imports: [Upload],
})
export class ContainerConfiguration {
  @App()
  app;

  async onReady() {
    const uploadMW = await this.app.generateMiddleware(Upload.Upload);
    this.app.use(uploadMW);
  }
}
```

#### 4. 代码中获取上传后的文件

```typescript
// index.ts
import { Provide, Inject, ServerlessTrigger } from '@midwayjs/decorator';

@Provide()
export class IndexHandler {
  @Inject()
  ctx;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/upload',
    method: 'post',
  })
  async handler() {
    const files = (this.ctx as any).files;
    /*
    files = [
    	{
      	filename: "20210118142906.jpg",
        data: FileReadStream, // 还支持其他模式，参照配置中的 mod 参数
        fieldname: "fileFormName",
        mimeType: "image/jpeg"
      }
    ]
    */
    const fields = (this.ctx as any).fields;
    /*
    fields = {
			formKey: formValue
		}
    */
  }
}
```
