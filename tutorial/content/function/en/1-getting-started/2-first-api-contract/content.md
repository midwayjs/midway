---
title: First API contract
focus: /src/server/api/home.api.ts
routes:
  - /
  - /info
checks:
  - /ping
---

# First API contract

`defineApi` puts prefix, HTTP method, and handler in one module.

```ts
import { defineApi } from '@midwayjs/core/functional';

export const homeApi = defineApi('/', api => ({
  home: api.get('/').handle(async () => 'Hello Midway Functional!'),
}));
```

- The first argument `'/'` is the prefix, like `@Controller('/')`
- `api.get` / `api.post` / `api.put` / `api.delete` are HTTP methods
- Object keys (`home`) are route names for the client: `api.home.home()`
- Whatever `.handle()` returns is the response body

`GET /` already works on the right.

## Exercise

Add `GET /ping` that returns `pong`. Point the preview at `/ping`. Use **Solve** if you get stuck.
