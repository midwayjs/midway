---
title: Your First API Contract
focus: /src/server/api/home.api.ts
---

# Your First API Contract

Write your first `defineApi` module.

```ts
import { defineApi } from '@midwayjs/core/functional';

export const homeApi = defineApi('/', api => ({
  home: api.get('/').handle(async () => 'Hello Midway Functional!'),
}));
```
