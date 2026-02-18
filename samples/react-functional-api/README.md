# React + Midway Functional API Sample

A runnable React (Vite) project that demonstrates:

- `defineApi` in `src/server/api`
- direct import from web to server API definition
- `createClient({ user: userApi })` usage with `@midwayjs/react`

## Directory

```txt
samples/react-functional-api/
  package.json
  tsconfig.json
  vite.config.ts
  index.html
  src/
    main.tsx
    server/
      configuration.ts
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
pnpm -C samples/react-functional-api install
```

## Run

```bash
pnpm -C samples/react-functional-api dev
```

This single command starts a Vite dev server with embedded Midway HTTP runtime.
`/api/*` requests are handled by real Midway routes from `src/server/api`.

## Build

```bash
pnpm -C samples/react-functional-api build
```

Split outputs:

```bash
pnpm -C samples/react-functional-api build:server
pnpm -C samples/react-functional-api build:web
```

- Server output: `dist/server`
- Web output: `dist/web` (Vite)

## Notes

- Client calls are sent to `/api` by default (`basePath: '/api'`).
- Backend is a real Midway Koa app (`imports: [koa]` in `src/server/configuration.ts`).
- To use custom transport (axios/tRPC), pass `adapter` in `createClient(..., { adapter })`.
- This sample imports `apiPlugin` from `@midwayjs/web-bridge/vite`.
- This sample imports `devPlugin` from `@midwayjs/mock/vite`.
- `apiPlugin({ target: 'both' })` is enabled so CSR and SSR builds can share the same API import style.
- API file changes trigger Midway runtime reload (`close -> recreate`) during dev.
- If your backend includes heavy long-lived connections (Redis/MQ/WebSocket), consider running backend independently and proxying `/api` from Vite.
