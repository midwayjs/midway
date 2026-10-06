---
title: Directories and module boundaries
focus: /README.md
---

# Directories and module boundaries

This track organizes code around the API contract: `src/server/api/*.api.ts` is both the server route table and the type source the frontend can import.

```txt
src
├── configuration.ts     # mock entry, re-exports server/index.ts
├── server
│   ├── index.ts         # defineConfiguration
│   ├── api/             # defineApi contracts
│   ├── service/         # business logic, still @Provide() classes
│   └── config/
└── web
    └── api/client.ts    # createClient, same contract
```

## Mapping to the class style

| Class | Functional |
| --- | --- |
| `@Configuration` | `defineConfiguration` |
| `@Controller` + `@Get` | `defineApi` + `api.get` |
| `@Inject()` | `useInject()` |
| `@Config()` / `ctx` | `useConfig()` / `useContext()` |

Functional is not a different framework. Prefer `defineApi` when you share a repo with a frontend.

## Rules

- Keep API files as `*.api.ts` under `src/server/api`
- The frontend imports this contract; do not hard-code URLs
- Do not import `fs`, database clients, or handler internals from the web side
- v4 requires `detector: new CommonJSFileDetector()` in `defineConfiguration`, or these modules are never loaded

The preview already serves `/` with `Hello Midway Functional!`. Next lesson writes the first `defineApi`.
