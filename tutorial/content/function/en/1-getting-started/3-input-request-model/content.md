---
title: input Request Model
focus: /src/server/api/home.api.ts
---

# input Request Model

In Functional API, all request data comes from `input`.

- `input.params`
- `input.query`
- `input.body`
- `input.headers`

Declare a schema for each part with `.input()` (zod here). The framework validates the request before calling the handler, and `input` gets the matching types:

```ts
import { z } from 'zod';

getUserById: api
  .get('/user/:id')
  .input({
    params: z.object({ id: z.string() }),
  })
  .handle(async ({ input }) => {
    return { id: input.params.id }; // id: string
  }),
```

Query values in a URL are always strings. Use `z.coerce` to turn them into numbers, and `default` to provide a fallback:

```ts
query: z.object({
  page: z.coerce.number().int().min(1).default(1),
}),
```

Parts without a schema are typed as `unknown`, so their fields can't be read directly.
