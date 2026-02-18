# Midway Functional API Service Sample

A minimal backend-only sample that demonstrates `defineApi` without any frontend framework.

## Directory

```txt
samples/functional-api-service/
  package.json
  tsconfig.json
  src/
    bootstrap.ts
    configuration.ts
    api/
      health.api.ts
```

## Install

From repository root:

```bash
pnpm install
```

Or only this sample:

```bash
pnpm -C samples/functional-api-service install
```

## Build & Start

```bash
pnpm -C samples/functional-api-service build
pnpm -C samples/functional-api-service start
```

Server listens on `http://127.0.0.1:7001` and uses global prefix `/api`.

## Try APIs

```bash
curl http://127.0.0.1:7001/api/health/ping
```

```bash
curl -X POST http://127.0.0.1:7001/api/health/echo \
  -H 'content-type: application/json' \
  -d '{"message":"hello"}'
```
