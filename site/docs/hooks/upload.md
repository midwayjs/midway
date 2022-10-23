# 文件上传

Midway Hooks 提供了 `@midwayjs/hooks-upload` 并配合 `@midwayjs/upload` 来实现纯函数 + 一体化项目中的文件上传功能。

## 起步

安装依赖：

```bash
npm install @midwayjs/upload @midwayjs/hooks-upload
```

## 使用

### 启用 upload 组件

在后端目录的 `configuration.ts` 中启用 `@midwayjs/upload` 组件，具体支持的配置项可查看 [文件上传](/docs/extensions/upload)

```diff
import { createConfiguration, hooks } from '@midwayjs/hooks';
import * as Koa from '@midwayjs/koa';
+ import * as upload from '@midwayjs/upload';

/**
 * setup midway server
 */
export default createConfiguration({
  imports: [
    Koa,
    hooks(),
+   upload
  ],
  importConfigs: [{ default: { keys: 'session_keys' } }],
});
```

### 创建接口

在后端目录下，新建接口文件。

```ts
import { Api } from '@midwayjs/hooks';
import {
  Upload,
  useFiles,
} from '@midwayjs/hooks-upload';

export default Api(
  Upload('/api/upload'),
  async () => {
    const files = useFiles();
    return files;
  }
);
```

> 一体化调用

```tsx
import upload from './api/upload';

function Form() {
  const [file, setFile] =
    React.useState<FileList>(null);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const files = { images: file };
    const response = await upload({
      files,
    });
    console.log(response);
  };

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log(e.target.files);
    setFile(e.target.files);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Hooks File Upload</h1>
      <input
        multiple
        type="file"
        onChange={handleOnChange}
      />
      <button type="submit">
        Upload
      </button>
    </form>
  );
}
```

> 手动调用（通过 FormData 上传）

```ts
const input =
  document.getElementById('file');

const formdata = new FormData();
formdata.append('file', input.files[0]);

fetch('/api/upload', {
  method: 'POST',
  body: formdata,
})
  .then((res) => res.json())
  .then((res) => console.log(res));
```

## Api

### Upload(path?: string)

声明上传接口，可以指定路径。默认为 `POST` 接口，只支持 `multipart/form-data` 类型的请求。

### useFiles()

在函数中使用 `useFiles()` 可以获取上传的文件。返回值为 Object，key 为上传时的字段名。有多个文件字段名相同时，Value 为 Array。

```ts
// frontend
await upload({ pdf });

// backend
const files = useFiles();
{
  pdf: {
    filename: 'test.pdf',        // 文件原名
    data: '/var/tmp/xxx.pdf',    // mode 为 file 时为服务器临时文件地址
    fieldname: 'test1',          // 表单 field 名
    mimeType: 'application/pdf', // mime
  }
}
```

### useFields()

返回 FormData 中非文件的字段。

```ts
// frontend
const formdata = new FormData();
formdata.append('name', 'test');

post(formdata);

// backend
const fields = useFields();
// { name: 'test' }
```
