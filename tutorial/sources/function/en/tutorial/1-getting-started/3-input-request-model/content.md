---
type: lesson
title: input Request Model
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

# input Request Model

In Functional API, all request data comes from `input`.

- `input.params`
- `input.query`
- `input.body`
- `input.headers`

```ts
getUserById: api.get('/user/:id').handle(async ({ input }) => {
  return { id: input.params?.id };
});
```
