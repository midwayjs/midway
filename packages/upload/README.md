## Upload 上传组件

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的通用上传组件，支持 `file` (服务器临时文件)、`stream` （流）多种模式。

### Usage

1. 安装依赖
```shell
tnpm i @midwayjs/upload --save
```
2. 在 configuration 中引入组件,
```ts
import * as upload from '@midwayjs/upload';
@Configuration({
  imports: [
    // ...other components
    upload
  ],
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
  async upload(@Files() files: upload.UploadFileInfo[], @Fields() fields) {
    /*
    files = [
      {
        filename: 'test.pdf',        // 文件原名
        data: '/var/tmp/xxx.pdf',    // mode 为 file 时为服务器临时文件地址
        fieldName: 'test1',          // 表单 field 名
        mimeType: 'application/pdf', // mime
      },
      {
        filename: 'test.pdf',        // 文件原名
        data: ReadStream,    // mode 为 stream 时为服务器临时文件地址
        fieldName: 'test2',          // 表单 field 名
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


### 配置
```ts
export const upload = {
  // mode: UploadMode, 默认为file，即上传到服务器临时目录，可以配置为 stream
  mode: 'file',
  // fileSize: string, 最大上传文件大小，默认为 10mb
  fileSize: '10mb',
  // whitelist: string[]，文件扩展名白名单，默认为 null
  whitelist: null,
  // tmpdir: string，上传的文件临时存储路径
  tmpdir: join(tmpdir(), 'midway-upload-files'),
}
```
