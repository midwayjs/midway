# Design: MikroORM v7 Split Package

## Context
The existing `@midwayjs/mikro` package is built and tested against MikroORM v6. MikroORM v7 is native ESM and moved decorators out of `@mikro-orm/core`, so a single component package must handle materially different module and user-code assumptions if it supports both v6 and v7.

## Goals
- Provide a clear, stable package for MikroORM v7 users.
- Avoid fragile CommonJS/ESM conditional loading inside the existing v6 package.
- Preserve the existing `@midwayjs/mikro` API for v6 users.
- Make installation and entity examples version-explicit so users do not accidentally install an unsupported major.

## Non-Goals
- Do not retrofit full MikroORM v7 support into `@midwayjs/mikro`.
- Do not remove or rename `@midwayjs/mikro`.
- Do not provide a runtime auto-migration layer between v6 decorators and v7 decorators.

## Package Boundary
`@midwayjs/mikro7` owns MikroORM v7 integration. It should expose the same Midway-facing decorator names and injection concepts as `@midwayjs/mikro` where feasible:

- `Configuration`
- `InjectRepository` / entity repository decorator API parity
- `InjectEntityManager`
- `InjectMikroORM` / data-source injection API parity, if currently exported by the v6 package
- `MikroConfigOptions` typed against MikroORM v7

The package should depend on or peer-depend against MikroORM v7 packages only. `@midwayjs/mikro` should advertise a v6 peer dependency range and keep its existing implementation path.

## Module Strategy
The v7 package should be authored and published in a way that can import MikroORM v7 without CommonJS interop traps. Prefer a package-local `package.json` and `tsconfig` setup that emits ESM-compatible output while staying compatible with the monorepo build conventions.

If the repository-wide build tooling cannot emit a pure ESM package without affecting other packages, the implementation should add the minimum package-local build configuration needed for `packages/mikro7` only.

## Documentation Strategy
Docs should split by major version:

- MikroORM v6: `@midwayjs/mikro` with `@mikro-orm/*@^6`.
- MikroORM v7: `@midwayjs/mikro7` with `@mikro-orm/*@^7` and `@mikro-orm/decorators`.

The v7 examples must show imports from `@mikro-orm/decorators/legacy` when using legacy TypeScript decorators, and explicitly mention the TypeScript module settings expected by MikroORM v7.

## Risks
- ESM-only package output may require adjustments to test setup and package export metadata.
- Sharing code between `mikro` and `mikro7` can reintroduce cross-major coupling. Shared code should remain minimal unless the shared contract is stable across v6 and v7.
- Users may expect `@midwayjs/mikro7` to be a drop-in dependency replacement; docs should call out entity import and tsconfig changes.
