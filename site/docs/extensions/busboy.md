import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 文件上传

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的通用上传组件，支持 `file` (服务器临时文件) 和 `stream` （流）两种模式。

相关信息：

| web 支持情况      |      |
| ----------------- | ---- |
| @midwayjs/koa     | ✅    |
| @midwayjs/faas    | 💬    |
| @midwayjs/web     | ✅    |
| @midwayjs/express | ✅    |

:::caution

💬 部分函数计算平台不支持流式请求响应，请参考对应平台能力。

:::

:::tip

本模块自 3.17.0 起替换 upload 组件。

和 upload 组件的差异为：

* 1、配置的 key 从 `upload` 调整为 `busboy`
* 2、中间件不再默认加载，手动可配置到全局或者路由
* 3、流式上传时不再提供 fieldName 字段，入参定义类型调整为 `UploadStreamFileInfo`
* 4、`fileSize` 的配置有调整

:::



## 安装依赖

```bash
$ npm i @midwayjs/busboy@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/busboy": "^3.0.0",
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```



## 启用组件

```typescript
// src/configuratin.ts

import { Configuration } from '@midwayjs/core';
import * as busboy from '@midwayjs/busboy';

@Configuration({
  imports: [
    // ...other components
    busboy
  ],
  // ...
})
export class MainConfiguration {}
```



## 配置中间件

组件中提供了 `UploadMiddleware` 这个中间件，可以将其配置到全局或者特定路由，推荐配置到特定路由，提升性能。



**路由中间件**

```typescript
import { Controller, Post } from '@midwayjs/core';
import { UploadMiddleware } from '@midwayjs/busboy';

@Controller('/')
export class HomeController {

  @Post('/upload', middleares: [UploadMiddleware])
  async upload(/*...*/) {
    // ...
  }
}
```

**全局中间件**

<Tabs>
<TabItem value="koa" label="@midwayjs/koa">

```typescript
// src/configuratin.ts

import { Configuration } from '@midwayjs/core';
import * as busboy from '@midwayjs/busboy';
import { Application } from '@midwayjs/koa';

@Configuration({
  // ...
})
export class MainConfiguration {
  @App('koa')
  app: Application;
  
  async onReady() {
    this.app.useMiddleware(busboy.UploadMiddleware);
  }
}
```
</TabItem>
<TabItem value="egg" label="@midwayjs/web">

```typescript
// src/configuratin.ts

import { Configuration } from '@midwayjs/core';
import * as busboy from '@midwayjs/busboy';
import { Application } from '@midwayjs/web';

@Configuration({
  // ...
})
export class MainConfiguration {
  @App('egg')
  app: Application;
  
  async onReady() {
    this.app.useMiddleware(busboy.UploadMiddleware);
  }
}
```
</TabItem>
<TabItem value="express" label="@midwayjs/express">

```typescript
// src/configuratin.ts

import { Configuration } from '@midwayjs/core';
import * as busboy from '@midwayjs/busboy';
import { Application } from '@midwayjs/express';

@Configuration({
  // ...
})
export class MainConfiguration {
  @App('express')
  app: Application;
  
  async onReady() {
    this.app.useMiddleware(busboy.UploadMiddleware);
  }
}
```
</TabItem>
<TabItem value="faas" label="@midwayjs/faas">

```typescript
// src/configuratin.ts

import { Configuration } from '@midwayjs/core';
import * as busboy from '@midwayjs/busboy';
import { Application } from '@midwayjs/faas';

@Configuration({
  // ...
})
export class MainConfiguration {
  @App('faas')
  app: Application;
  
  async onReady() {
    this.app.useMiddleware(busboy.UploadMiddleware);
  }
}
```
</TabItem>
</Tabs>



## 配置

### 上传模式 - file

`file` 为默认值，也是框架的推荐值。

配置 upload 的 mode 为 `file` 字符串。

```typescript
// src/config/config.default.ts
export default {
  // ...
  busboy: {
    mode: 'file',
  },
}

```

在代码中获取上传的文件。

```typescript
import { Controller, Post, Files, Fields } from '@midwayjs/core';
import { UploadFileInfo } from '@midwayjs/busboy';

@Controller('/')
export class HomeController {

  @Post('/upload')
  async upload(@Files() files Array<UploadFileInfo>, @Fields() fields: Record<string, string) {
    /*
    files = [
      {
        filename: 'test.pdf',        // 文件原名
        data: '/var/tmp/xxx.pdf',    // 服务器临时文件地址
        mimeType: 'application/pdf', // mime
      },
      // ...file 下支持同时上传多个文件
    ]
    */
    return {
      files,
      fields
    }
  }
}
```

使用 file 模式时，通过 `this.ctx.files` 中获取的 `data` 为上传的文件在服务器的 `临时文件地址`，后续可以再通过 `fs.createReadStream` 等方式来处理此文件内容。

使用 file 模式时，支持同时上传多个文件，多个文件会以数组的形式存放在 `this.ctx.files` 中。



:::caution

当采取 `file` 模式时，由于上传组件会在接收到请求时，会根据请求的 `method` 和 `headers` 中的部分标志性内容进行匹配，如果认为是一个文件上传请求，就会对请求进行解析，将其中的文件 `写入` 到服务器的临时缓存目录，您可以通过本组件的 `match` 或 `ignore` 配置来设置允许解析文件的路径。

配置 `match` 或 `ignore`后，则可以保证您的普通 post 等请求接口，不会被用户非法用作上传，可以 `避免` 服务器缓存被充满的风险。

 您可以查看下面的 `配置 允许(match) 或 忽略(ignore)的上传路径` 章节，来进行配置。

:::



:::caution

如果同时开启了 swagger 组件，请务必添加上传参数的类型（装饰器对应的类型，以及 @ApiBody 中的 type），否则会报错，更多请参考 swagger 的文件上传章节。

:::




### 上传模式 - stream

配置 upload 的 mode 为 `stream` 字符串。


使用 stream 模式时，通过 `this.ctx.files` 中获取的 `data` 为 `ReadStream`，后续可以再通过 `pipe` 等方式继续将数据流转至其他 `WriteStream` 或 `TransformStream`。


使用 stream 模式时，仅同时上传一个文件，即 `this.ctx.files` 数组中只有一个文件数据对象。

另外，stream 模式 `不会` 在服务器上产生临时文件，所以获取到上传的内容后无需手动清理临时文件缓存。

:::tip

faas 场景实现方式视平台而定，如果平台不支持流式请求/响应但是业务开启了 `mode: 'stream'`，将采用先读取到内存，再模拟流式传输来降级处理。

:::

在代码中获取上传的文件，流式模式下仅支持单个文件。

```typescript
import { Controller, Post, Files, Fields } from '@midwayjs/core';
import { UploadStreamFileInfo } from '@midwayjs/busboy';

@Controller('/')
export class HomeController {

  @Post('/upload')
  async upload(@Files() files: Array<UploadStreamFileInfo>, @Fields() fields: Record<string, string) {
    /*
    files = [
      {
        filename: 'test.pdf',        // 文件原名
        data: ReadStream,    				 // 文件流
        mimeType: 'application/pdf', // mime
      },
    ]

    */
    return {
      files,
      fields
    }
  }
}
```

:::caution

如果同时开启了 swagger 组件，请务必添加上传参数的类型（装饰器对应的类型，以及 @ApiBody 中的 type），否则会报错，更多请参考 swagger 的文件上传章节。

:::



### 上传文件后缀检查

通过 `whitelist` 属性，配置允许上传的文件后缀名，配置 `null` 则不校验后缀名。

:::caution

如果配置为 `null`，则不对上传文件后缀名进行校验，如果采取文件上传模式 (mode=file)，则会有可能被攻击者所利用，上传 `.php`、`.asp` 等后缀的 WebShell 实现攻击行为。

当然，由于组件会对上传后的临时文件采取 `重新随机生成` 文件名写入，只要开发者 `不将` 上传后的临时文件地址返回给用户，那么即使用户上传了一些不被预期的文件，那也无需过多担心会被利用。

:::


如果上传的文件后缀不匹配，会响应 `400` error，默认值如下：

```ts
'.jpg',
'.jpeg',
'.png',
'.gif',
'.bmp',
'.wbmp',
'.webp',
'.tif',
'.psd',
'.svg',
'.js',
'.jsx',
'.json',
'.css',
'.less',
'.html',
'.htm',
'.xml',
'.pdf',
'.zip',
'.gz',
'.tgz',
'.gzip',
'.mp3',
'.mp4',
'.avi',
```

可以通过组件中导出的 `uploadWhiteList` 获取到默认的后缀名白名单。

另外，midway 上传组件，为了避免部分 `恶意用户`，通过某些技术手段来`伪造`一些可以被截断的扩展名，所以会对获取到的扩展名的二进制数据进行过滤，仅支持 `0x2e`（即英文点 `.`）、`0x30-0x39`（即数字 `0-9`）、`0x61-0x7a`（即小写字母 `a-z`） 范围内的字符作为扩展名，其他字符将会被自动忽略。

你可以传递一个函数，可以根据不同的条件动态返回白名单。

```typescript
// src/config/config.default.ts
import { uploadWhiteList } from '@midwayjs/busboy';
import { tmpdir } from 'os';
import { join } from 'path';

export default {
  // ...
  busboy: {
    whitelist: (ctx) => {
      if (ctx.path === '/') {
        return [
          '.jpg',
          '.jpeg',
        ];
      } else {
        return [
          '.jpg',
        ]
      };
    },
    // ...
  },
}
```





### 上传文件 MIME 类型检查

部分`恶意用户`，会尝试将 `.php` 等 WebShell 修改扩展名为 `.jpg`，来绕过基于扩展名的白名单过滤规则，在某些服务器环境内，这个 jpg 文件依然会被作为 PHP 脚本来执行，造成安全风险。

组件提供了 `mimeTypeWhiteList` 配置参数 **【请注意，此参数无默认值设置，即默认不校验】**，您可以通过此配置设置允许的文件 MIME 格式，规则为由数组 `[扩展名, mime, [...moreMime]]` 组成的 `二级数组`，例如：

```typescript
// src/config/config.default.ts
import { uploadWhiteList } from '@midwayjs/busboy';
export default {
  // ...
  busboy: {
    // ...
    // 扩展名白名单
    whitelist: uploadWhiteList,
    // 仅允许下面这些文件类型可以上传
    mimeTypeWhiteList: {
      '.jpg': 'image/jpeg',
      // 也可以设置多个 MIME type，比如下面的允许 .jpeg 后缀的文件是 jpg 或者是 png 两种类型
      '.jpeg': ['image/jpeg', 'image/png'],
      // 其他类型
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.wbmp': 'image/vnd.wap.wbmp',
      '.webp': 'image/webp',
    }
  },
}
```

您也可以使用组件提供的 `DefaultUploadFileMimeType` 变量，作为默认的 MIME 校验规则，它提供了常用的 `.jpg`、`.png`、`.psd` 等文件扩展名的 MIME 数据：

```typescript
// src/config/config.default.ts
import { uploadWhiteList, DefaultUploadFileMimeType } from '@midwayjs/busboy';
export default {
  // ...
  busboy: {
    // ...
    // 扩展名白名单
    whitelist: uploadWhiteList,
    // 仅允许下面这些文件类型可以上传
    mimeTypeWhiteList: DefaultUploadFileMimeType,
  },
}
```

文件格式与对应的 MIME 映射，您可以通过 `https://mimetype.io/` 这个网站来查询，对于文件的 MIME 识别，我们使用的是 [file-type@16](https://www.npmjs.com/package/file-type) 这个 npm 包，请注意它支持的文件类型。

:::info

MIME 类型校验规则仅适用于使用 文件上传模式 `mode=file`，同时设置此校验规则之后，由于需要读取文件内容进行匹配，所以会稍微影响上传性能。

但是，我们依然建议您在条件允许的情况下，设置 `mimeTypeWhiteList` 参数，这将提升您的应用程序安全性。

:::

你可以传递一个函数，可以根据不同的条件动态返回 MIME 规则。

```typescript
// src/config/config.default.ts
import { tmpdir } from 'os';
import { join } from 'path';

export default {
  // ...
  busboy: {
    mimeTypeWhiteList: (ctx) => {
      if (ctx.path === '/') {
        return {
          '.jpg': 'image/jpeg',
        };
      } else {
        return {
          '.jpeg': ['image/jpeg', 'image/png'],
        }
      };
    }
  },
}

```



### Busboy 上传限制

默认情况下没有限制，可以通过配置修改，数字类型，单位为 byte。

```typescript
// src/config/config.default.ts
export default {
  // ...
  busboy: {
    // ...
    limits: {
      fileSize: 1024
    }
  },
}
```

除此之外，还可以设置一些其他的 [限制]((https://github.com/mscdex/busboy/tree/master?tab=readme-ov-file#exports)。)。




### 临时文件与清理


如果你使用了 `file` 模式来获取上传的文件，那么上传的文件会存放在您于 `config` 文件中设置的 `upload` 组件配置中的 `tmpdir` 选项指向的文件夹内。

你可以通过在配置中使用 `cleanTimeout` 来控制自动的临时文件清理时间，默认值为 `5 * 60 * 1000`，即上传的文件于 `5 分钟` 后自动清理，设置为 `0` 则视为不开启自动清理功能。

```typescript
// src/config/config.default.ts
import { uploadWhiteList } from '@midwayjs/busboy';
import { tmpdir } from 'os';
import { join } from 'path';

export default {
  // ...
  busboy: {
    mode: 'file',
    tmpdir: join(tmpdir(), 'midway-busboy-files'),
    cleanTimeout: 5 * 60 * 1000,
  },
}

```

你也可以在代码中通过调用 `await ctx.cleanupRequestFiles()` 来主动清理当前请求上传的临时文件。



### 设置不同路由的配置

通过中间件的不同实例，可以对不同的路由做不同的配置，这种场景下会和全局配置合并，仅能覆盖一小部分配置。

```typescript
import { Controller, Post, Files, Fields } from '@midwayjs/core';
import { UploadFileInfo, UploadMiddleware } from '@midwayjs/busboy';

@Controller('/')
export class HomeController {
  @Post('/upload1', { middlewares: [ createMiddleware(UploadMiddleware, {mode: 'file'}) ]})
  async upload1(@Files() files Array<UploadFileInfo>) {
    // ...
  }
  
  @Post('/upload2', { middlewares: [ createMiddleware(UploadMiddleware, {mode: 'stream'}) ]})
  async upload2(@Files() files Array<UploadFileInfo>) {
    // ...
  }
}
```

当前可以传递的配置包括 `mode` 以及 `busboy` 自带的 [配置](https://github.com/mscdex/busboy/tree/master?tab=readme-ov-file#exports)。



## 内置错误

* `MultipartInvalidFilenameError` 无效文件名
* `MultipartInvalidFileTypeError` 无效文件类型
* `MultipartFileSizeLimitError` 文件大小超出限制
* `MultipartFileLimitError` 文件数量超出限制
* `MultipartPartsLimitError` 上传 parts 数量超出限制
* `MultipartFieldsLimitError` fields 数量超出限制
* `MultipartError` 其余的 busbuy 错误



## 安全提示

1. 请注意是否开启 `扩展名白名单` （whiteList），如果扩展名白名单被设置为 `null`，则会有可能被攻击者所利用上传 `.php`、`.asp` 等WebShell。
2. 请注意是否设置 `match` 或 `ignore` 规则，否则普通的 `POST/PUT` 等接口会有可能被攻击者利用，造成服务器负荷加重和空间大量占用问题。
3. 请注意是否设置 `文件类型规则` （fileTypeWhiteList）,否则可能会被攻击者伪造文件类型进行上传。



## 前端文件上传示例

### 1. html form 的形式

```html
<form action="/api/upload" method="post" enctype="multipart/form-data">
  Name: <input type="text" name="name" /><br />
  File: <input type="file" name="testFile" /><br />
  <input type="submit" value="Submit" />
</form>
```

### 2. fetch FormData 方式

```js
const fileInput = document.querySelector('#your-file-input') ;
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/upload', {
  method: 'POST',
  body: formData,
});
```



## Postman 测试示例

![](https://img.alicdn.com/imgextra/i4/O1CN01iv9ESW1uIShNiRjBF_!!6000000006014-2-tps-2086-1746.png)

