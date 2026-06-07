## Context
Midway v4 already has first-party web framework adapters for Koa, Express, and Egg-style web applications, plus a shared IoC container and request context model. GraphQL should integrate with those primitives instead of introducing a separate application runtime.

Apollo Server v5 is the current supported Apollo Server major and requires Node.js 20+, matching this repository's Node baseline. Apollo Server v2/v3 packages such as `apollo-server`, `apollo-server-koa`, and `apollo-server-express` should not be used for the v4 component.

## Goals / Non-Goals
- Goals:
  - Provide a maintained first-party `@midwayjs/apollo` package for v4 applications.
  - Keep `@midwayjs/graphql` as a runtime-neutral base SDK that Apollo and future runtimes can reuse.
  - Let users import the component and resolver decorators from `@midwayjs/apollo`.
  - Support Koa and Express applications first, because they are the most direct HTTP adapters in this repository.
  - Preserve Midway DI ergonomics inside resolvers.
  - Keep Apollo-specific options accessible without polluting the base SDK config.
  - Make the docs approachable for users comparing Midway with NestJS GraphQL support.
- Non-Goals:
  - Recreate the old `apollo-server-midway` package API.
  - Require users to import `@midwayjs/graphql` directly for normal Apollo usage.
  - Add GraphQL federation, subscriptions, persisted queries, file uploads, or schema stitching in the initial package.
  - Require TypeGraphQL or a code-first schema library as the default path.
  - Add Serverless/FaaS GraphQL support in the first iteration unless it falls out naturally from the HTTP integration.

## Technical Decisions
- Package roles:
  - `@midwayjs/graphql` is a base SDK package. It exports shared interfaces, resolver decorators, resolver metadata constants, and resolver map assembly utilities. It is not the user-facing Midway component for Apollo usage.
  - `@midwayjs/apollo` is the user-facing component package. It imports and re-exports `@midwayjs/graphql` APIs and exports its own Midway `Configuration`.
- Runtime dependencies:
  - `graphql` is a dependency of `@midwayjs/apollo` for schema types and execution primitives.
  - `@apollo/server` is a dependency of `@midwayjs/apollo`, not of the base SDK.
  - Users do not need to install `graphql` or `@apollo/server` separately for the Apollo component.
- Configuration namespace: `apollo`.
- Default endpoint path: `/graphql`.
- Default methods: `GET` and `POST`.
- Apollo options:
  - Shared GraphQL fields live at the top level of `export const apollo = { ... }`.
  - Apollo Server specific options live under `apollo.apollo`.
- Resolver model:
  - Schema-first `typeDefs` and `resolvers` are the baseline and map directly to Apollo Server inputs.
  - `typePaths` loads `.graphql` schema files from the application `baseDir`; exact file paths and glob patterns are both supported, then merged with inline `typeDefs`.
  - Midway resolver classes are optional: the base SDK discovers configured resolver classes, resolves them through the application or request container, and converts decorated methods into resolver functions.
  - Resolver methods may use parameter decorators for `Parent`, `Args`, `Context`, and `Info`; undecorated methods keep the raw `(parent, args, context, info)` call signature.
  - Subscription methods are converted to `{ subscribe }` resolver objects and must return `AsyncIterable` values.
- Request context:
  - Apollo's GraphQL `contextValue` is the active Midway `IMidwayContext` object itself, not a wrapper object containing `ctx`.
  - The component relies on the framework application's existing request-context setup so the native Koa/Express request object receives Midway fields such as `requestContext`, `logger`, `getLogger`, `setAttr`, `getAttr`, and `getApp`.
  - Plain resolver maps resolve request-scoped dependencies with `context.requestContext.getAsync(ServiceClass)`, matching existing Midway controller and middleware usage.
  - Framework-specific request APIs remain available directly on `context`, such as Koa context APIs or Express request APIs, depending on the active application.
  - GraphQL-specific metadata, if needed, is attached under a namespaced field such as `context.graphql` instead of wrapping the Midway context.
  - Users can provide `contextFactory` to add fields to the Midway context for each GraphQL request, but the built-in Midway context fields remain reserved.
- Lifecycle:
  - Apollo Server instances are created once per Midway app and stopped during application shutdown.
  - When subscriptions are enabled, a `graphql-ws` WebSocket server is attached in `onServerReady` because the framework HTTP server is only available after `framework.run()`.
  - HTTP and WebSocket execution share the same executable schema created with `@graphql-tools/schema`.
  - Startup failures surface during Midway startup instead of failing lazily on first request.

## Risks
- Apollo's maintained Koa integration is outside the Apollo core package, so this implementation may use a small local middleware adapter to keep Koa/Express support consistent.
- Code-first resolver support can become large quickly. The first version should keep decorator metadata minimal and document how to use plain schema-first resolvers when advanced GraphQL composition is needed.
- GraphQL introspection and landing pages need environment-aware defaults to avoid exposing production schemas unexpectedly.
