---
type: lesson
title: Move Business Logic to Service
focus: /src/server/service/user.service.ts
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

# Move Business Logic to Service

Functional API still uses services for business logic.

- API layer: protocol + contract
- service layer: business rules + data orchestration
