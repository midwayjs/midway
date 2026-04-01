---
type: lesson
title: Pre-release Best-practice Checklist
focus: /src/server/index.ts
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

# Pre-release Best-practice Checklist

Before release, verify:

1. core APIs have `input/output` contracts
2. middleware and error shape are unified
3. local/production config boundaries are clear
4. frontend only calls APIs via `createClient`
5. tests cover read/write/error paths
