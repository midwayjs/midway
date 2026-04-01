---
type: lesson
title: Route-level and Module-level Middleware
focus: /src/server/middleware/logger.middleware.ts
prepareCommands:
  - npm install
mainCommand: npm run dev
terminal:
  open: true
  panels:
    - output
    - terminal
previews:
  - port: 7001
    title: Midway App
autoReload: true
---

# Route-level and Module-level Middleware

Functional API supports both:

- module-level via `defineApi(..., { middleware: [...] })`
- route-level via `.meta({ middleware: [...] })`
