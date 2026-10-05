---
title: Route-level and Module-level Middleware
focus: /src/server/middleware/logger.middleware.ts
---

# Route-level and Module-level Middleware

Functional API supports both:

- module-level via `defineApi(..., { middleware: [...] })`
- route-level via `.meta({ middleware: [...] })`
