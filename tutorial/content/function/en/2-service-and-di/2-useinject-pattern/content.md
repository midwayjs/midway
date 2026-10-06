---
title: Inject a service with useInject
focus: /src/server/api/user.api.ts
checks:
  - /users/search?keyword=harry
---

# Inject a service with useInject

Call `useInject` inside the handler. Do not `new UserService()`.

```ts
const service = await useInject(UserService);
return service.getUserById(input.params.id);
```

The container owns the dependency, which also makes tests easier to swap.

List and get-by-id already work: `GET /users`, `GET /users/u-1`.

## Exercise

Finish `search`: inject `UserService`, call `searchUsers(input.query.keyword)`, return `{ success, data, count }`. Then open `/users/search?keyword=harry`.
