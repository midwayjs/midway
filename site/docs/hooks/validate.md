---
title: 参数校验
---

## 校验

Midway Hooks 使用 [zod@3](https://www.npmjs.com/package/zod) 作为校验器，并提供 `Validate(...schemas: any[])` 校验用户入参，`ValidateHttp(options)` 函数来校验 Http 结构。

使用前请安装 [zod](https://www.npmjs.com/package/zod)。

```
npm install zod
```

## Validate

`Validate` 传入的 Schema 顺序与用户入参顺序匹配。

### 基础示例

```ts
import {
  Api,
  Post,
  Validate,
} from '@midwayjs/hooks';
import { z } from 'zod';

export default Api(
  Post('/hello'),
  Validate(z.string(), z.number()),
  async (name: string, age: number) => {
    return `Hello ${name}, you are ${age} years old.`;
  }
);
```

一体化调用：

```ts
import hello from './api';

try {
  await hello(null, null);
} catch (error) {
  console.log(
    JSON.parse(error.data.message)
  );
  console.log(error.status); // 422
}
```

手动调用：

```ts
fetcher
  .post('/hello', {
    args: [null, null],
  })
  .catch((error) => {
    console.log(
      JSON.parse(error.data.message)
    );
    console.log(error.status); // 422
  });
```

### 错误处理

通过 Try/Catch 可以捕捉到校验失败的错误。

```ts
try {
  // 调用接口
} catch (error) {
  console.log(error.data.code); // VALIDATION_FAILED
  console.log(
    JSON.parse(error.data.message)
  );
}
```

`error.data.message` 包含完整的[错误信息](https://zod.js.org/docs/errors/)，你需要使用 `JSON.parse` 解析，解析后的示例如下：

```ts
[
  {
    code: 'invalid_type',
    expected: 'string',
    received: 'number',
    path: [0, 'name'],
    message:
      'Expected string, received number',
  },
];
```

其中：

- `message`: 错误信息
- `path` 参数代表错误路径，如 `0` 代表第一个参数校验出错，`name` 代表是 `name` 字段校验出错。

你可以手动解析错误消息，并展示给用户。

### ValidateHttp

ValidateHttp(options) 支持传入 `options` 参数，类型如下。

```ts
type ValidateHttpOption = {
  query?: z.Schema<any>;
  params?: z.Schema<any>;
  headers?: z.Schema<any>;
  data?: z.Schema<any>[];
};
```

以校验 `Query` 参数为例。

后端代码：

```ts
import {
  Api,
  Get,
  Query,
  useContext,
  ValidateHttp,
} from '@midwayjs/hooks';
import { z } from 'zod';

const QuerySchema = z.object({
  searchString: z.string().min(5),
});

export const filterPosts = Api(
  Get('/api/filterPosts'),
  Query<z.infer<typeof QuerySchema>>(),
  ValidateHttp({ query: QuerySchema }),
  async () => {
    const ctx = useContext();
    return ctx.query.searchString;
  }
);
```

一体化调用：

```ts
import filterPosts from './api';

try {
  await filterPosts({
    query: { searchString: '' },
  });
} catch (error) {
  console.log(
    JSON.parse(error.data.message)
  );
  console.log(error.status); // 422
}
```

手动调用：

```ts
fetcher
  .get(
    '/api/filterPosts?searchString=1'
  )
  .catch((error) => {
    console.log(
      JSON.parse(error.data.message)
    );
    console.log(error.status); // 422
  });
```

## TypeScript 支持

你可以通过 zod 内置的 TypeScript 功能，来实现复杂类型的推导与校验。

示例如下：

```ts
import {
  Api,
  Post,
  Validate,
} from '@midwayjs/hooks';
import { z } from 'zod';

const Project = z.object({
  name: z.string(),
  description: z.string(),
  owner: z.string(),
  members: z.array(z.string()),
});

export default Api(
  Post('/project'),
  Validate(Project),
  async (
    // { name: string, description: string, owner: string, members: string[] }
    project: z.infer<typeof Project>
  ) => {
    return project;
  }
);
```

一体化调用：

```ts
import createProject from './api';

try {
  await createProject({
    name: 1,
    description: 'test project',
    owner: 'test',
    members: ['test'],
  });
} catch (error) {
  console.log(error.message);
  console.log(error.status); // 422
}
```

手动调用：

```ts
fetcher
  .post('/project', {
    args: [
      {
        name: 1,
        description: 'test project',
        owner: 'test',
        members: ['test'],
      },
    ],
  })
  .catch((error) => {
    console.log(
      JSON.parse(error.data.message)
    );
    console.log(error.status); // 422
  });
```
