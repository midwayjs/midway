# Static type safety + runtime safety

Using the [Validate](./validate.md) checker provided by [Prisma](./prisma.md) and `@midwayjs/hooks`, a type security + runtime security link from front-end to back-end to database can be realized.

Take the `POST /api/post` interface in [hooks-prisma-starter](https://github.com/midwayjs/hooks/blob/main/examples/fullstack/prisma/README.md) as an example. The code is as follows:

```ts
import {
  Api
  Post
  Validate
} from '@midwayjs/hooks';
import { prisma } from './prisma';
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string().min(1)
  content: z.string().min(1)
  authorEmail: z.string().email()
});

export const createPost = Api(
  Post('/api/post')
  Validate(PostSchema)
  async (
    post: z.infer<typeof PostSchema>
  ) => {
    const result =
      await prisma.post.create({
        data: {
          title: post.title
          content: post.content
          author: {
            connect: {
              email: post.authorEmail
            },
          },
        },
      });
    return result;
  }
);
```

Front-end call:

```ts
import { createPost } from '../api/post';

await createPost({
  title: 'Hello Midway',
  content: 'Hello Prisma',
  authorEmail: 'test@test.com',
});
```

At this time, the front end obtains the type prompt based on the schema of Zod, and the back end uses the `Validate` checker to check the type, and finally calls the `prisma.post.create` method to create the user.

In the whole process.

- Front end: based on type, static check input parameters, and get type prompt
- Backend: Check the front-end incoming parameters
- Database: Use Correct Data

In this way, we can achieve static type security and runtime security at low cost.
