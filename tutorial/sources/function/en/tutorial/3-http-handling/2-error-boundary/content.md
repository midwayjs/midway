---
type: lesson
title: Error Boundaries and Response Shape
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

# Error Boundaries and Response Shape

Recommended pattern:

- validation for input errors
- explicit business exceptions in handlers
- unified error response shape for frontend handling
