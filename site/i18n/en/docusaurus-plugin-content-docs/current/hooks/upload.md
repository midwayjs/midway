# File Upload

Midway Hooks provides `@midwayjs/hooks-upload` and cooperates with `@midwayjs/upload` to realize file upload function in pure function + integrated project.

## Start

Installation dependency:

```bash
npm install @midwayjs/upload @midwayjs/hooks-upload
```

## Use

### Enable upload components

Enable the `@midwayjs/upload` component in the `configuration.ts` of the backend directory. For more information about the supported configuration items, see [file upload](/docs/extensions/upload).

```diff
import { createConfiguration, hooks } from '@midwayjs/hooks';
import * as Koa from '@midwayjs/koa';
+ import * as upload from '@midwayjs/upload';

/**
 * setup midway server
 */
export default createConfiguration({
  imports: [
    Koa
    hooks()
+ upload
  ],
  importConfigs: [{ default: { keys: 'session_keys' } }]
});
```

### Create interface

In the backend directory, create a new interface file.

```ts
import { Api } from '@midwayjs/hooks';
import {
  Upload
  useFiles
} from '@midwayjs/hooks-upload';

export default Api (
  Upload('/api/upload')
  async () => {
    const files = useFiles();
    return files;
  }
);
```

> Integrated call

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
      files
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

> Manual call (uploaded via FormData)

```ts
const input =
  document.getElementById('file');

const formdata = new FormData();
formdata.append('file', input.files[0]);

fetch('/api/upload', {
  method: 'POST',
  body: formdata
})
  .then((res) => res.json())
  .then((res) => console.log(res));
```

## Api

### Upload(path?: string)

Declare the upload interface, which can specify the path. By default, the `POST` interface supports only requests of the `multipart/form-data` type.

### useFiles()

Use the `useFiles()` in the function to get the uploaded file. The return value is Object, and the key is the field name at the time of upload. When multiple file field names are the same, Value is Array.

```ts
// frontend
await upload({ pdf });

// backend
const files = useFiles();
{
  pdf: {
    filename: 'test.pdf', // file original name
    Data: '/var/tmp/xxx.pdf', // temporary file address of the server when mode is file
    fieldname: 'test1', // form field name
    mimeType: 'application/pdf', // mime
  }
}
```

### useFields()

Returns fields FormData non-files.

```ts
// frontend
const formdata = new FormData();
formdata.append('name', 'test');

post(formdata);

// backend
const fields = useFields();
// { name: 'test'}
```
