# Prisma ORM

In Midway Hooks, we recommend that you use [Prisma](https://prisma.io/) to build databases and achieve the goal of static type security.

[Prsima](https://www.prisma.io/) is an ORM designed for Node.js & TypeScript. It provides a series of friendly functions (Schema definition, client generation, full TypeScript support), which can help users build applications quickly.

## Example

We provide a simple example of [hooks-prisma-starter](https://github.com/midwayjs/hooks/blob/main/examples/prisma/README.md) to demonstrate how to use Prisma in Midway Hooks.

I will also briefly introduce how simple it will be for Midway Hooks to develop applications with Prisma.

### Database Schema

The example is based on sqlite, and the database schema is as follows:

```prisma
model User {
  id Int @id @default(autoincrement())
  email String @unique
  name String?
  posts Post[]
}

model Post {
  id Int @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title String
  content String?
  published Boolean @default(false)
  viewCount Int @default(0)
  author User?    @relation(fields: [authorId], references: [id])
  authorId Int?
}
```

For specific database settings & initial data filling, refer to the [hooks-prisma-starter](https://github.com/midwayjs/hooks/blob/main/examples/prisma/README.md) document.

### Initialize Prisma

Create a prisma file under the src/api of the project, and use the following code to initialize the Client.

```ts
import { PrismaClient } from '@prisma/client';

export const prisma =
  new PrismaClient();
```

#### Use proxy mirroring

Prisma will download executable files dynamically according to the platform during installation. If your network environment is not good, you can set the image through environment variables.

```bash
PRISMA_BINARIES_MIRROR = https://registry.npmmirror.com/-/binary/prisma/
```

Related issues: [mirror prisma](https://github.com/cnpm/mirrors/issues/248)

### Query data

Taking all published articles as an example, you can quickly complete the operation through the generated Prisma Client.

Back-end code:

```ts
import {
  Api
  Get
} from '@midwayjs/hooks';
import { prisma } from './prisma';

export default Api(Get(), async () => {
  const posts =
    await prisma.post.findMany({
      where: { published: true}
      include: { author: true}
    });
  return posts;
});
```

Integrated call:

```ts
import fetchFeeds from '../api/feeds';

fetchFeeds().then((feeds) => {
  console.log(feeds);
});
```

### Add data

Take the registration login as an example, the client generated based on the integrated call + Prisma can complete all the work in a few simple lines of code.

Contains:

- Front end type prompt
- Back-end parameter verification
- Database operation

```ts
import {
  Api
  Post
  Validate
} from '@midwayjs/hooks';
import { z } from 'zod';
import { prisma } from './prisma';

export const signUp = Api (
  Post()
  Validate (
    z.string()
    z.string().email()
  ),
  async (
    name: string
    email: string
  ) => {
    const result =
      await prisma.user.create({
        data: {
          name
          email
        },
      });
    return result;
  }
);
```

Integrated call:

```ts
import { signUp } from '../api/feeds';

signUp('John', 'test@test.com').then(
  (user) => {
    console.log(user);
  }
);
```

### More examples

For more examples of Prisma, see [Prisma documentation](https://www.prisma.io/).
