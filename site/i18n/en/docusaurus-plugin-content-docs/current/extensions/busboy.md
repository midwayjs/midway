import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# File upload

A general upload component for `@midwayjs/faas`, `@midwayjs/web`, `@midwayjs/koa` and `@midwayjs/express` frameworks, supporting two modes: `file` (temporary server file) and `stream`.

Related information:

| Web support       |      |
| ----------------- | ---- |
| @midwayjs/koa     | ✅    |
| @midwayjs/faas    | 💬    |
| @midwayjs/web     | ✅    |
| @midwayjs/express | ✅    |

:::caution

💬 Some function computing platforms do not support streaming request responses, please refer to the corresponding platform capabilities.

:::

:::tip

This module replaces the upload component since 3.17.0.

The differences from the upload component are:

* 1. The configuration key is adjusted from `upload` to `busboy`

* 2. The middleware is no longer loaded by default, and can be manually configured to the global or route

* 3. the input parameter definition type is adjusted to `UploadStreamFileInfo`

* 4. The configuration of `fileSize` has been adjusted

:::



## Install dependencies

```bash
$ npm i @midwayjs/busboy@3 --save
```

Or add the following dependencies to `package.json` and reinstall.

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

## Enable component

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

## Configure middleware

The `UploadMiddleware` middleware is provided in the component, which can be configured globally or to a specific route. It is recommended to configure it to a specific route to improve performance.



**Route Middleware**

```typescript
import { Controller, Post } from '@midwayjs/core';
import { UploadMiddleware } from '@midwayjs/busboy';

@Controller('/')
export class HomeController {

  @Post('/upload', { middleware: [UploadMiddleware] })
  async upload(/*...*/) {
    // ...
  }
}
```

**Global Middleware**

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



## Configuration

The component uses `busboy` as the configuration key.

### Upload mode - file

`file` is the default value and the recommended value of the framework.

Configure mode as a `file` string.

```typescript
// src/config/config.default.ts
export default {
  // ...
  busboy: {
    mode: 'file',
  },
}

```

Get the uploaded file in the code.

```typescript
import { Controller, Post, Files, Fields } from '@midwayjs/core';
import { UploadFileInfo } from '@midwayjs/busboy';

@Controller('/')
export class HomeController {

  @Post('/upload', /*...*/)
  async upload(@Files() files: Array<UploadFileInfo>, @Fields() fields: Record<string, string) {
    /*
    files = [
      {
        filename: 'test.pdf',        // file name
        data: '/var/tmp/xxx.pdf',    // Server temporary file address
        mimeType: 'application/pdf', // mime
        fieldName: 'file'            // field name
      },
      // ...Support uploading multiple files at the same time under file
    ]
    */
    return {
      files,
      fields
    }
  }
}
```

When using file mode, the `data` obtained from `this.ctx.files` is the `temporary file address` of the uploaded file on the server. The content of this file can be processed later by `fs.createReadStream` and other methods.

When using file mode, it supports uploading multiple files at the same time, and multiple files will be stored in `this.ctx.files` in the form of an array.



:::caution

When using the `file` mode, the upload component will match the `method` of the request and some of the iconic contents in the `headers` when receiving the request. If it is a file upload request, it will parse the request and `write` the file in it to the temporary cache directory of the server. You can set the path that allows parsing files through the `match` or `ignore` configuration of this component.

After configuring `match` or `ignore`, you can ensure that your ordinary post and other request interfaces will not be illegally used by users for upload, and you can `avoid` the risk of the server cache being full.

You can view the `Configure the upload path allowed (match) or ignored (ignore)` section below to configure it.

:::



:::caution

If the swagger component is enabled at the same time, be sure to add the type of the upload parameter (the type corresponding to the decorator and the type in @ApiBody), otherwise an error will be reported. For more information, please refer to the file upload section of swagger.

:::



### Upload mode - stream

Configure the upload mode to be a `stream` string.

When using stream mode, the `data` obtained from `this.ctx.files` is a `ReadStream`, and the data can be transferred to other `WriteStream` or `TransformStream` through `pipe` and other methods.

When using stream mode, only one file is uploaded at a time, that is, there is only one file data object in the `this.ctx.files` array.

In addition, stream mode `does not` generate temporary files on the server, so there is no need to manually clean up the temporary file cache after obtaining the uploaded content.

:::tip

The implementation method of Faas scenarios depends on the platform. If the platform does not support streaming request/response but the business has enabled `mode: 'stream'`, it will be downgraded by reading it into memory first and then simulating streaming transmission.

:::

Get the uploaded file in the code. Only a single file is supported in streaming mode.

```typescript
import { Controller, Post, Files, Fields } from '@midwayjs/core';
import { UploadStreamFileInfo } from '@midwayjs/busboy';

@Controller('/')
export class HomeController {

  @Post('/upload', /*...*/)
  async upload(@Files() files: Array<UploadStreamFileInfo>, @Fields() fields: Record<string, string) {
    /*
    files = [
      {
        filename: 'test.pdf',        // file name
        data: ReadStream,    				 // file stream
        mimeType: 'application/pdf', // mime
        fieldName: 'file'            // field name
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

If the swagger component is enabled at the same time, be sure to add the type of the upload parameter (the type corresponding to the decorator and the type in @ApiBody), otherwise an error will be reported. For more information, please refer to the file upload section of swagger.

:::



### Upload file suffix check

Use the `whitelist` property to configure the file suffixes allowed for upload. If `null` is configured, the suffix will not be checked.

:::caution

If `null` is configured, the uploaded file suffix will not be checked. If the file upload mode (mode=file) is adopted, it may be exploited by attackers to upload WebShells with suffixes such as `.php` and `.asp` to implement attack behaviors.

Of course, since the component will `re-randomly generate` the file name for the uploaded temporary file, as long as the developer `does not return` the uploaded temporary file address to the user, even if the user uploads some unexpected files, there is no need to worry too much about being exploited.

:::

If the uploaded file suffix does not match, it will respond with `400` error. The default values are as follows:

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

The default suffix whitelist can be obtained through the `uploadWhiteList` exported in the component.

In addition, in order to prevent some `malicious users` from using certain technical means to `forge` some extensions that can be truncated, the midway upload component will filter the binary data of the obtained extensions, and only support characters in the range of `0x2e` (that is, English dot `.`), `0x30-0x39` (that is, numbers `0-9`), and `0x61-0x7a` (that is, lowercase letters `a-z`) as extensions. Other characters will be automatically ignored.

You can pass a function to dynamically return the whitelist based on different conditions.

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





### Upload file MIME type check

Some malicious users will try to modify the extension of WebShell such as `.php` to `.jpg` to bypass the whitelist filtering rules based on extensions. In some server environments, this jpg file will still be executed as a PHP script, causing security risks.

The component provides the `mimeTypeWhiteList` configuration parameter **[Please note that this parameter has no default value, that is, it is not checked by default]**. You can use this configuration to set the allowed file MIME format. The rule is a `secondary array` composed of the array `[extension, mime, [...moreMime]]`, for example:

```typescript
// src/config/config.default.ts
import { uploadWhiteList } from '@midwayjs/busboy';
export default {
  // ...
  busboy: {
    // ...
    // Extension whitelist
    whitelist: uploadWhiteList,
    // Only the following file types are allowed to be uploaded
    mimeTypeWhiteList: {
      '.jpg': 'image/jpeg',
      // You can also set multiple MIME types. For example, the following allows files with the .jpeg suffix to be either jpg or png.
      '.jpeg': ['image/jpeg', 'image/png'],
      // Other types
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.wbmp': 'image/vnd.wap.wbmp',
      '.webp': 'image/webp',
    }
  },
}
```

You can also use the `DefaultUploadFileMimeType` variable provided by the component as the default MIME validation rule, which provides MIME data for commonly used file extensions such as `.jpg`, `.png`, and `.psd`:

```typescript
// src/config/config.default.ts
import { uploadWhiteList, DefaultUploadFileMimeType } from '@midwayjs/busboy';
export default {
  // ...
  busboy: {
    // ...
    // Extension whitelist
    whitelist: uploadWhiteList,
    // Only the following file types are allowed to be uploaded
    mimeTypeWhiteList: DefaultUploadFileMimeType,
  },
}
```

You can query the file format and the corresponding MIME mapping through the website `https://mimetype.io/`. For the MIME identification of files, we use the npm package [file-type@16](https://www.npmjs.com/package/file-type). Please pay attention to the file types it supports.

:::info

MIME type verification rules only apply to file upload mode `mode=file`. After setting this verification rule, the upload performance will be slightly affected because the file content needs to be read for matching.

However, we still recommend that you set the `mimeTypeWhiteList` parameter when conditions permit, which will improve the security of your application.

:::

You can pass a function that can dynamically return MIME rules based on different conditions.

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



### Busboy upload limit

By default, there is no limit, which can be modified through configuration, digital type, unit is byte.

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

In addition, you can set some other [limits]((https://github.com/mscdex/busboy/tree/master?tab=readme-ov-file#exports).).

### Temporary files and cleanup

If you use the `file` mode to get the uploaded files, the uploaded files will be stored in the folder pointed to by the `tmpdir` option in the `upload` component configuration you set in the `config` file.

You can control the automatic temporary file cleanup time by using `cleanTimeout` in the configuration. The default value is `5 * 60 * 1000`, that is, the uploaded files will be automatically cleaned up after `5 minutes`. Setting it to `0` will disable the automatic cleanup function.

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

You can also call `await ctx.cleanupRequestFiles()` in the code to actively clean up temporary files uploaded by the current request.

### Setting configurations for different routes

Different middleware instances can be used to configure different routes differently. In this scenario, the global configuration will be merged and only a small part of the configuration can be covered.

```typescript
import { Controller, Post, Files, Fields } from '@midwayjs/core';
import { UploadFileInfo, UploadMiddleware } from '@midwayjs/busboy';

@Controller('/')
export class HomeController {
  @Post('/upload1', { middleware: [ createMiddleware(UploadMiddleware, {mode: 'file'}) ]})
  async upload1(@Files() files Array<UploadFileInfo>) {
    // ...
  }
  
  @Post('/upload2', { middleware: [ createMiddleware(UploadMiddleware, {mode: 'stream'}) ]})
  async upload2(@Files() files Array<UploadFileInfo>) {
    // ...
  }
}
```

Currently the configurations that can be passed include `mode` and `busboy`'s own [configuration](https://github.com/mscdex/busboy/tree/master?tab=readme-ov-file#exports).



## Built-in errors

* `MultipartInvalidFilenameError` Invalid file name
* `MultipartInvalidFileTypeError` Invalid file type
* `MultipartFileSizeLimitError` File size exceeds limit
* `MultipartFileLimitError` Number of files exceeds limit
* `MultipartPartsLimitError` Number of uploaded parts exceeds limit
* `MultipartFieldsLimitError` Number of fields exceeds limit
* `MultipartError` Other busbuy errors

## Security tips

1. Please pay attention to whether to enable `extension whitelist` (whiteList). If the extension whitelist is set to `null`, it may be used by attackers to upload `.php`, `.asp` and other WebShells.

2. Please pay attention to whether to set `match` or `ignore` rules, otherwise ordinary `POST/PUT` and other interfaces may be used by attackers, causing server load to increase and space to occupy a lot of problems.
3. Please pay attention to whether `file type rules` (fileTypeWhiteList) are set, otherwise the attacker may forge the file type for uploading.

## Front-end file upload example

### 1. HTML form format

```html
<form action="/api/upload" method="post" enctype="multipart/form-data">
  Name: <input type="text" name="name" /><br />
  File: <input type="file" name="testFile" /><br />
  <input type="submit" value="Submit" />
</form>
```

### 2. fetch FormData method

```js
const fileInput = document.querySelector('#your-file-input') ;
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/upload', {
  method: 'POST',
  body: formData,
});
```



## Postman test example

![](https://img.alicdn.com/imgextra/i4/O1CN01iv9ESW1uIShNiRjBF_!!6000000006014-2-tps-2086-1746.png)

