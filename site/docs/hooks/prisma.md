---
title: Prisma ORM
---

在 Midway Hooks 中，我们推荐使用 [Prisma](https://prisma.io/) 来构建数据库，并实现我们静态类型安全的目标。

[Prsima](https://www.prisma.io/) 是面向 Node.js & TypeScript 设计的 ORM，它提供了一系列友好的功能（Schema 定义、客户端生成、完全的 TypeScript 支持），可以帮助用户快速构建应用。

## Example

我们提供了一个简单的例子 [hooks-prisma-starter](https://github.com/midwayjs/hooks/blob/main/examples/prisma/README.md)，来演示在 Midway Hooks 如何使用 Prisma。

下面我也会简单介绍，Midway Hooks 配合 Prisma 开发应用会有多么的简单。

### 数据库 Schema

例子基于 sqlite，数据库 Schema 如下：

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title     String
  content   String?
  published Boolean  @default(false)
  viewCount Int      @default(0)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}
```

具体的数据库设置 & 初始数据填充工作，参考 [hooks-prisma-starter](https://github.com/midwayjs/hooks/blob/main/examples/prisma/README.md) 文档即可。

### 初始化 Prisma

在项目的 src/api 下新建 prisma 文件，使用如下代码即可初始化 Client。

```ts
import { PrismaClient } from '@prisma/client';

export const prisma =
  new PrismaClient();
```

#### 使用代理镜像

Prisma 在安装时会根据平台动态下载可执行文件，如果你的网络环境不好，可以通过环境变量来设置镜像。

```bash
PRISMA_BINARIES_MIRROR=https://registry.npmmirror.com/-/binary/prisma/
```

相关 Issue: [mirror prisma](https://github.com/cnpm/mirrors/issues/248)

### 查询数据

以获取所有发布的文章为例，你可以通过生成的 Prisma Client 快速完成操作。

后端代码：

```ts
import {
  Api,
  Get,
} from '@midwayjs/hooks';
import { prisma } from './prisma';

export default Api(Get(), async () => {
  const posts =
    await prisma.post.findMany({
      where: { published: true },
      include: { author: true },
    });
  return posts;
});
```

一体化调用：

```ts
import fetchFeeds from '../api/feeds';

fetchFeeds().then((feeds) => {
  console.log(feeds);
});
```

### 增加数据

以注册登录为例，基于一体化调用 + Prisma 生成的客户端，可以在简单的几行代码中完成所有的工作。

包含：

- 前端类型提示
- 后端参数校验
- 数据库操作

```ts
import {
  Api,
  Post,
  Validate,
} from '@midwayjs/hooks';
import { z } from 'zod';
import { prisma } from './prisma';

export const signUp = Api(
  Post(),
  Validate(
    z.string(),
    z.string().email()
  ),
  async (
    name: string,
    email: string
  ) => {
    const result =
      await prisma.user.create({
        data: {
          name,
          email,
        },
      });
    return result;
  }
);
```

一体化调用：

```ts
import { signUp } from '../api/feeds';

signUp('John', 'test@test.com').then(
  (user) => {
    console.log(user);
  }
);
```

### 更多示例

关于 Prisma 的更多示例，可以参考 [Prisma 官网文档](https://www.prisma.io/)。
