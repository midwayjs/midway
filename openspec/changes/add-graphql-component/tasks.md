## 1. Package Setup
- [x] 1.1 Create `packages/graphql` with package metadata, exports, TypeScript config, Jest config, and setup files for the base SDK.
- [x] 1.2 Create `packages/apollo` with package metadata, exports, TypeScript config, Jest config, and setup files for the user-facing component.
- [x] 1.3 Add `@midwayjs/graphql` as a workspace dependency of `@midwayjs/apollo`.
- [x] 1.4 Add `graphql` and `@apollo/server` as dependencies of `@midwayjs/apollo`.
- [x] 1.5 Add fixed-version runtime dependencies for executable schema creation and `graphql-ws` subscriptions.
- [x] 1.6 Verify both packages build with the repository's NodeNext TypeScript settings.

## 2. Runtime Integration
- [x] 2.1 Add `ApolloConfiguration` with default `apollo` config and lifecycle hooks.
- [x] 2.2 Implement Apollo Server creation and shutdown per Midway web application.
- [x] 2.3 Mount `/graphql` middleware for Koa applications.
- [x] 2.4 Mount `/graphql` middleware for Express applications.
- [x] 2.5 Build Apollo `contextValue` as the active Midway `IMidwayContext` itself, with `requestContext`, logger helpers, framework-native request APIs, optional `graphql` metadata, and user `contextFactory` extensions.
- [x] 2.6 Surface startup errors and schema errors through Midway startup instead of lazy request-time failures.
- [x] 2.7 Add GraphiQL browser landing page support for development.
- [x] 2.8 Add `graphql-ws` subscription server registration and shutdown.

## 3. Resolver API
- [x] 3.1 Define public TypeScript interfaces for shared GraphQL config, context, resolver classes, and resolver metadata in `@midwayjs/graphql`.
- [x] 3.2 Support schema-first `typeDefs` and `resolvers` configuration from `@midwayjs/apollo`.
- [x] 3.3 Add optional Midway resolver class discovery and DI-backed method invocation in the base SDK.
- [x] 3.4 Re-export GraphQL decorators and types from `@midwayjs/apollo`.
- [x] 3.5 Add comments for exported classes, interfaces, functions, and decorators.
- [x] 3.6 Add resolver parameter decorators and subscription resolver object assembly.

## 4. Tests
- [x] 4.1 Add base SDK tests for resolver metadata and resolver map assembly.
- [x] 4.2 Add Koa fixture tests for query execution and HTTP method handling in `@midwayjs/apollo`.
- [x] 4.3 Add Express fixture tests for query execution and HTTP method handling in `@midwayjs/apollo`.
- [x] 4.4 Test DI-backed resolver classes with singleton and request-scoped dependencies.
- [x] 4.5 Test plain resolver access to `context.requestContext.getAsync(...)` on the Midway context object.
- [x] 4.6 Test custom context factory behavior and direct access to framework request headers on `context`.
- [x] 4.7 Test Apollo Server shutdown during Midway application close.
- [x] 4.8 Test GraphiQL rendering and unsupported HTTP method handling.
- [x] 4.9 Test GraphQL subscriptions over WebSocket.
- [x] 4.10 Run `pnpm -C packages/graphql test`.
- [x] 4.11 Run `pnpm -C packages/apollo test`.

## 5. Documentation
- [x] 5.1 Add Chinese Apollo GraphQL docs under `site/docs/extensions/apollo.md`.
- [x] 5.2 Add English Apollo GraphQL docs in the matching i18n location if present.
- [x] 5.3 Show installation in both npm bash commands and `package.json` dependency form.
- [x] 5.4 Document the smallest schema-first Apollo example, DI resolver example, context customization, Apollo options, subscriptions, GraphiQL, HTTP behavior, and production defaults.

## 6. Validation
- [x] 6.1 Run relevant lint/build commands for touched packages.
- [x] 6.2 Run `openspec validate add-graphql-component --strict --no-interactive`.
