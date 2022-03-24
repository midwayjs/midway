---
title: 静态类型安全 + 运行时安全
---

使用 [Prisma](./prisma.md) 和 `@midwayjs/hooks` 提供的 [Validate](./validate.md) 校验器，可以实现从前端到后端再到数据库的类型安全 + 运行时安全链路。

以 [hooks-prisma-starter](https://github.com/midwayjs/hooks/blob/main/examples/fullstack/prisma/README.md) 中的 `POST /api/post` 接口为例，代码如下：

```ts
import {
  Api,
  Post,
  Validate,
} from '@midwayjs/hooks';
import { prisma } from './prisma';
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  authorEmail: z.string().email(),
});

export const createPost = Api(
  Post('/api/post'),
  Validate(PostSchema),
  async (
    post: z.infer<typeof PostSchema>
  ) => {
    const result =
      await prisma.post.create({
        data: {
          title: post.title,
          content: post.content,
          author: {
            connect: {
              email: post.authorEmail,
            },
          },
        },
      });
    return result;
  }
);
```

前端调用：

```ts
import { createPost } from '../api/post';

await createPost({
  title: 'Hello Midway',
  content: 'Hello Prisma',
  authorEmail: 'test@test.com',
});
```

此时，前端基于 Zod 的 Schema 获取类型提示，后端则使用 `Validate` 校验器进行类型检查，最终调用 `prisma.post.create` 方法来创建用户。

整个过程中。

- 前端：基于类型，静态校验输入参数，并获取类型提示
- 后端：校验前端传入参数
- 数据库：使用正确的数据

通过这种方式，我们可以低成本的实现静态类型安全 + 运行时安全。
