---
title: Contract validation (input / output)
focus: /src/server/api/user.api.ts
---

# Contract validation (input / output)

`.input()` blocks bad requests. `.output()` blocks bad responses. The schema is both runtime validation and handler types.

```ts
create: api
  .post('/')
  .input(CreateUserInputSchema)
  .output(UserOutputSchema)
  .handle(async ({ input }) => {
    return service.createUser(input.body.name, input.body.email, input.body.age);
  }),
```

Validation fails before / after business code. Keep business rules (for example "email already taken") in the Service.

`create` already has `input`.

## Exercise

Add `.output(UserOutputSchema)` to `create`. The schema is in `src/server/dto/user.dto.ts`. A valid POST `/users` must match `{ id, name, email, age? }`.
