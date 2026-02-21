# Midway Hybrid Routing Sample

A minimal backend-only sample that demonstrates class decorators and `defineApi` functional routes coexisting in one Midway app.

## Directory

```txt
samples/functional-api-hybrid/
  package.json
  tsconfig.json
  src/
    bootstrap.ts
    configuration.ts
    service/
      greeting.service.ts
    controller/
      legacy.controller.ts
    api/
      functional.api.ts
```

## Build & Start

```bash
pnpm -C samples/functional-api-hybrid build
pnpm -C samples/functional-api-hybrid start
```

Server listens on `http://127.0.0.1:7001` and uses global prefix `/api`.

## Verify coexistence

Decorator route:

```bash
curl http://127.0.0.1:7001/api/legacy/hello
```

Functional route:

```bash
curl http://127.0.0.1:7001/api/functional/hello
```
