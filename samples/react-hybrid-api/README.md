# React Hybrid API Sample

A runnable React (Vite) sample that demonstrates mixed routing styles in one Midway app:

- functional route via `defineApi`
- class route via `@Controller/@Get`
- unified frontend client (`api.user.getUser` + `api.call('controllerRouteHello')`)

## Directory

```txt
samples/react-hybrid-api/
  package.json
  tsconfig.json
  tsconfig.server.json
  vite.config.ts
  src/
    server/
      configuration.ts
      bootstrap.ts
      api/
        user.api.ts
      controller/
        controller-route.controller.ts
    web/
      app.tsx
      api/
        client.ts
```

## Run

```bash
pnpm -C samples/react-hybrid-api dev
```

## Build

```bash
pnpm -C samples/react-hybrid-api build
```
