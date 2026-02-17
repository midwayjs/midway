# React + Midway Functional API Sample (Rspack)

A runnable React (Rspack) project that demonstrates:

- `defineApi` in `src/server/api`
- direct import from web to server API definition
- `createClient({ user: userApi })` usage with `@midwayjs/react`
- `@midwayjs/react/rspack` loader rewriting API definitions to web-safe contracts

## Directory

```txt
samples/react-functional-api-rspack/
  package.json
  tsconfig.json
  rspack.config.mjs
  index.html
  src/
    main.tsx
    server/
      configuration.ts
      bootstrap.ts
      api/
        user.api.ts
    web/
      app.tsx
      api/
        client.ts
```

## Install

From repository root:

```bash
pnpm install
```

Or only this sample:

```bash
pnpm -C samples/react-functional-api-rspack install
```

## Run (Dev)

```bash
pnpm -C samples/react-functional-api-rspack dev
```

This starts two processes:

- Midway backend (`tsx watch src/server/bootstrap.ts`) on `http://127.0.0.1:7001`
- Rspack dev server on `http://127.0.0.1:5174`

`/api/*` is proxied by Rspack dev server to Midway backend.

## Build

```bash
pnpm -C samples/react-functional-api-rspack build
```

Split outputs:

```bash
pnpm -C samples/react-functional-api-rspack build:server
pnpm -C samples/react-functional-api-rspack build:web
```

- Server output: `dist/server`
- Web output: `dist/web`

## Notes

- Client calls are sent to `/api` by default (`basePath: '/api'`).
- Backend is a real Midway Koa app (`imports: [koa]` in `src/server/configuration.ts`).
- To use custom transport (axios/tRPC), pass `adapter` in `createClient(..., { adapter })`.
- This sample uses `createApiRspackRule` from `@midwayjs/react/rspack`.
