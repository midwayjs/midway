---
type: lesson
title: Client Integration and Writes
focus: /src/web/api/client.ts
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

# Client Integration and Writes

This lesson connects the full chain:

1. define routes in `src/server/api/user.api.ts`
2. create client in `src/web/api/client.ts`
3. call APIs from page files

```ts
export const api = createClient({ user: userApi }, { basePath: '/api' });
```
