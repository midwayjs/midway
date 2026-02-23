---
type: lesson
title: Contract Validation (input/output)
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

# Contract Validation (input/output)

In Functional API, validation is best placed on the contract itself:

- `input(...)` for request safety
- `output(...)` for response safety
