# Change: Add Apollo GraphQL component with shared GraphQL SDK

## Why
Users have requested official GraphQL support for Midway v4, and the current v4 docs do not provide a maintained GraphQL path. Midway should provide a user-facing Apollo component while keeping reusable GraphQL resolver metadata, decorators, and context helpers in a runtime-neutral base package.

## What Changes
- Add `@midwayjs/graphql` as a base SDK package for shared GraphQL types, resolver decorators, resolver metadata, and resolver map assembly.
- Add `@midwayjs/apollo` as the user-facing Midway component that mounts a GraphQL HTTP endpoint into built-in Midway web applications.
- Have `@midwayjs/apollo` depend on and re-export `@midwayjs/graphql` APIs, so users can import `Resolver`, `Query`, and related decorators from `@midwayjs/apollo`.
- Use Apollo Server v5 in `@midwayjs/apollo`, with `graphql` and `@apollo/server` bundled as component dependencies so users only install the Midway Apollo component.
- Use the `apollo` config namespace for user configuration, including common GraphQL fields such as `path`, `typeDefs`, `resolvers`, `resolverClasses`, and `contextFactory`.
- Keep Apollo-specific runtime options under `apollo.apollo` so future runtimes can provide their own component-specific options without expanding the base SDK config.
- Use the active Midway `IMidwayContext` as the GraphQL context value so resolvers can access DI, logger, headers, cookies, and custom context factories directly from `context`.
- Add beginner-first Chinese and English Apollo GraphQL documentation with installation, minimal examples, DI resolver examples, Apollo options, and context customization.
- Add tests for the base SDK resolver metadata and for Apollo package bootstrapping, Koa/Express endpoint behavior, DI-backed resolvers, context creation, error handling, and shutdown.

## Impact
- Affected specs: `graphql-component`
- Affected code:
  - `packages/graphql/**` new base SDK package
  - `packages/apollo/**` new user-facing component package
  - Root workspace/package metadata for the new packages
  - `site/docs/extensions/apollo.md` and English i18n docs
  - Optional sample or fixture applications under the new package tests
- Compatibility:
  - Existing applications are unaffected unless they import `@midwayjs/apollo`.
  - Future runtimes can reuse `@midwayjs/graphql` without inheriting Apollo-specific config.
