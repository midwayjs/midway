---
type: lesson
title: Folder and Module Boundaries
focus: /README.md
editor:
  fileTree:
    allowEdits: false
terminal: false
previews: false
---

# Folder and Module Boundaries

The Functional tutorial uses a contract-first structure.

```txt
src
├── server
│   ├── index.ts
│   └── api
│       └── user.api.ts
└── web
    └── api
        └── client.ts
```

Rules:

- API modules use `*.api.ts`
- API contracts live in `src/server/api`
- frontend consumes contracts instead of hardcoded URLs
