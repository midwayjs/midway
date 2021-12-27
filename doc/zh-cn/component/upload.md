# Upload 上传组件

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的通用上传组件，支持 `file` (服务器临时文件)、`stream` （流）多种模式。

## 使用

1. 安装依赖

```shell
npm i @midwayjs/upload --save
```

2. 在 configuration 文件中引入组件

```ts
import * as upload from '@midwayjs/upload';
@Configuration({
  imports: [
    // ...other components
    upload
  ],
  // ...
})
export class AutoConfiguration {}
```

3. 在代码中获取上传的文件

```ts
@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @Post('/upload')
  async upload(@Files() files, @Fields() fields) {
    /*
    files = [
      {
        filename: 'test.pdf',        // 文件原名
        data: '/var/tmp/xxx.pdf',    // mode 为 file 时为服务器临时文件地址
        fieldname: 'test1',          // 表单 field 名
        mimeType: 'application/pdf', // mime
      },
      {
        filename: 'test.pdf',        // 文件原名
        data: ReadStream,    // mode 为 stream 时为服务器临时文件地址
        fieldname: 'test2',          // 表单 field 名
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


## 配置
```ts
// src/config/config.default.ts
export const upload = {
  // mode: UploadMode, 默认为file，即上传到服务器临时目录，可以配置为 stream
  mode: 'file',
  // fileSize: string, 最大上传文件大小，默认为 10mb
  fileSize: '10mb',
  // whitelist: string[]，文件扩展名白名单
  whitelist: null,
  // tmpdir: string，上传的文件临时存储路径
  tmpdir: join(tmpdir(), 'midway-upload-files'),
}
```

### mode 配置上传模式

#### 1. file 模式【默认值】

配置 upload 的 mode 为 `file` 字符串，或使用 `@midwayjs/upload` 包导出的 `UploadMode.File` 来配置。

使用 file 模式时，通过 `this.ctx.files` 中获取的 `data` 为上传的文件在服务器的临时文件地址，后续可以再通过 `fs.createReadStream` 等方式来获取到此文件内容。

使用 file 模式时，支持同时上传多个文件，多个文件会以数组的形式存放在 `this.ctx.files` 中。

#### 2. stream 模式

配置 upload 的 mode 为 `stream` 字符串，或使用 `@midwayjs/upload` 包导出的 `UploadMode.Stream` 来配置。


使用 stream 模式时，通过 `this.ctx.files` 中获取的 `data` 为 `ReadStream`，后续可以再通过 `pipe` 等方式继续将数据流转至其他 `WriteStream` 或 `TransformStream`。


使用 stream 模式时，仅同时上传一个文件，即 `this.ctx.files` 数组中只有一个文件数据对象。







### whitelist 白名单配置

配置允许上传的文件后缀名，配置 `null` 则不校验后缀名，如果上传的文件后缀不匹配，会响应 `400` error，默认值如下：
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

## 前端如何将文件上传到服务器？

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
