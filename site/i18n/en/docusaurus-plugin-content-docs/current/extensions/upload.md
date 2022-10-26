# File upload

It is a common upload component applicable to `@midwayjs/faas`, `@midwayjs/web`, `@midwayjs/koa`, and `@midwayjs/express`. It supports `file` (temporary server file) and `stream` (streaming) modes.

Related information:

| Web support |      |
| ----------------- | ---- |
| @midwayjs/koa | ✅ |
| @midwayjs/faas | ✅ |
| @midwayjs/web | ✅ |
| @midwayjs/express | ✅ |



## Use

1. Installation Dependence

```bash
$ npm i @midwayjs/upload@3 --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/upload": "^3.0.0",
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```



2. Introduce components into configuration files

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as upload from '@midwayjs/upload';

@Configuration({
  imports: [
    // ...other components
    upload
  ],
  }
})
export class MainConfiguration {}
```

3. Get the uploaded file in the code

```typescript
import { Controller, Inject, Post, Files, Fields } from '@midwayjs/decorator';

@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @Post('/upload')
  async upload(@Files() files, @Fields() fields) {
    /*
    files = [
      {
        filename: 'test.pdf', // file original name
        Data: '/var/tmp/xxx.pdf', // temporary file address of the server when mode is file
        fieldname: 'test1', // form field name
        mimeType: 'application/pdf', // mime
      },
      {
        filename: 'test.pdf', // file original name
        Data: ReadStream, // temporary file address of the server when mode is stream
        fieldname: 'test2', // form field name
        mimeType: 'application/pdf', // mime
      },
      // ...file supports uploading multiple files at the same time
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

If the swagger component is enabled at the same time, be sure to add the type of the upload parameter (the type corresponding to the decorator and the type in the @ApiBody), otherwise an error will be reported. For more information, see the file upload section swagger.

:::

## Configuration example

```typescript
// src/config/config.default.ts
import { uploadWhiteList } from '@midwayjs/upload';
import { tmpdir } from 'OS';
import { join } from 'path';

export default {
  // ...
  upload: {
    // mode: UploadMode. The default value is file, which is uploaded to the temporary directory of the server. You can configure it as stream.
    mode: 'file',
    // fileSize: string, the maximum size of the uploaded file, which is 10mb by default.
    fileSize: '10mb',
    // whitelist: string[], file extension whitelist
    whitelist: uploadWhiteList.filter(ext => ext !== '.pdf')
    // tmpdir: string, the temporary storage path of the uploaded file.
    tmpdir: join(tmpdir(), 'midway-upload-files')
    // cleanTimeout: number, how long after the uploaded file is automatically deleted in the temporary directory, the default is 5 minutes
    cleanTimeout: 5*60*1000
    // base64: boolean, sets whether the original body is in base64 format. The default value is false, which is generally used for compatibility with Tencent Cloud.
    base64: false
  },
}

```



## Upload mode-file

`file` is the default value and is also the recommended value for the framework.

Configure the mode of upload as the `file` string, or use the `UploadMode.File` exported from the `@midwayjs/upload` package.

When you use the file mode, the `data` obtained from `this.ctx.files` is the temporary file address of the uploaded file on the server. Then, you can use `fs.createReadStream` to obtain the file content.

When you use the file mode, you can upload multiple files at the same time. The files are stored in `this.ctx.files` as arrays.



## Upload Mode-stream

Configure the `stream` string for the mode of upload, or use the `UploadMode.Stream` exported from the `@midwayjs/upload` package.


When you use stream mode, the `data` obtained in `this.ctx.files` is `ReadStream`. You can then use `pipe` to transfer data to other `WriteStream` or `TransformStream`.


When you use the stream mode, only one file is uploaded at the same time. The `this.ctx.files` array contains only one file data object.



## Configure upload whitelist

Configure the suffix of the uploaded file. If you configure `null`, the suffix of the uploaded file does not check. If the suffix of the uploaded file does not match, the file response will be `400` error. The default value is as follows:
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

You can obtain the default suffix whitelist from the `uploadWhiteList` exported in the `@midwayjs/upload` package.



## Temporary Documents and Cleanup


If you use the `file` mode to obtain the uploaded files, the uploaded files are stored in the folder that you set in the `config` file to the `tmpdir` option in the `upload` component configuration.

You can control the automatic temporary file cleaning time by using `cleanTimeout` in the configuration. The default value is `5*60*1000`, that is, the uploaded file will be automatically cleaned after `5 minutes`. If it is set to `0`, the automatic cleaning function will not be turned on.

You can also actively clean up the temporary files currently requested to be uploaded by calling `await ctx.cleanupRequestFiles()` in your code.



## Example of Front-end File Upload

### 1. The form of html form.

```html
<form action="/api/upload" method="post" enctype="multipart/form-data">
  Name: <input type="text" name="name" /><br />
  File: <input type="file" name="testFile" /><br />
  <input type="submit" value="Submit" />
</form>
```

### 2. fetch FormData method
```js
const fileInput = document.querySelector('#your-file-input');
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```



## Postman test example

![](https://img.alicdn.com/imgextra/i4/O1CN01iv9ESW1uIShNiRjBF_!!6000000006014-2-tps-2086-1746.png)

