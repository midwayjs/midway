---
title: Inject Service with useInject
focus: /src/server/api/user.api.ts
---

# Inject Service with useInject

Use `useInject` inside `*.api.ts`.

```ts
const service = await useInject(UserService);
return service.getUserById(input.params.id);
```
