---
type: lesson
title: Your First API Contract
focus: /src/server/api/home.api.ts
prepareCommands:
  - npm install
mainCommand: npm run dev
terminal:
  open: false
  panels:
    - output
    - terminal
previews:
  - port: 7001
    title: Midway App
autoReload: true
---

# Your First API Contract

Write your first `defineApi` module.

```ts
import { defineApi } from '@midwayjs/core/functional';

export const homeApi = defineApi('/', api => ({
  home: api.get('/').handle(async () => 'Hello Midway Functional!'),
}));
```
