---
type: lesson
title: Inject Service with useInject
focus: /src/server/api/user.api.ts
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

# Inject Service with useInject

Use `useInject` inside `*.api.ts`.

```ts
const service = await useInject(UserService);
return service.getUserById(String(input.params?.id || ''));
```
