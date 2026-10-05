---
title: input request model
focus: /src/server/api/home.api.ts
checks:
  - /calc/add?a=1&b=2
---

# input request model

Functional APIs read the request from `input`: `params`, `query`, `body`, `headers`.

Without `.input()`, those fields are `unknown`. A zod schema is checked before the handler runs, and TypeScript follows:

```ts
import { z } from 'zod';

getUserById: api
  .get('/user/:id')
  .input({
    params: z.object({ id: z.string() }),
  })
  .handle(async ({ input }) => {
    return { id: input.params.id }; // string
  }),
```

Query values are strings in the URL. Use `z.coerce` to turn them into numbers, and `default` for fallbacks:

```ts
query: z.object({
  page: z.coerce.number().int().min(1).default(1),
}),
```

`/greet`, `/user/:id`, and `/search/:category` are already there. Try `/greet?name=harry`.

## Exercise

Add `GET /calc/:operation` with `a` and `b` as `z.coerce.number()`. Support `add` / `subtract` / `multiply` / `divide`. `/calc/add?a=1&b=2` should return `result: 3`.
