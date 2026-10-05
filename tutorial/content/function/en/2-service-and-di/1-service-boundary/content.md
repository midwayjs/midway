---
title: Push logic into a Service
focus: /src/server/service/user.service.ts
---

# Push logic into a Service

Functional does not mean "only functions". Keep the contract in `*.api.ts` and business rules in a Service. Services still use `@Provide()` and the same IoC container as the class style.

Suggested split:

- API layer: read `input`, set status codes, shape the response
- Service layer: queries, business rules, writes

`src/server/service/user.service.ts` is an in-memory user table. Next lesson injects it with `useInject`.
