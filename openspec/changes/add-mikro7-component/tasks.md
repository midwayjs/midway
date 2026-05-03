## 1. Package Setup
- [x] 1.1 Create `packages/mikro7` with package metadata, exports, TypeScript config, Jest config, and setup files.
- [x] 1.2 Add `@midwayjs/core`, test framework dependencies, and MikroORM v7 dependencies/peer dependencies.
- [x] 1.3 Verify the package can build as ESM-compatible output without changing unrelated package output.

## 2. Implementation
- [x] 2.1 Port the MikroORM data-source manager to the v7 package and type it against MikroORM v7.
- [x] 2.2 Port Midway integration lifecycle logic for request context creation.
- [x] 2.3 Port repository, entity manager, and data-source injection decorators with v6 API parity where feasible.
- [x] 2.4 Keep v7-specific module loading and type imports isolated inside `packages/mikro7`.
- [x] 2.5 Add or update comments for exported classes, interfaces, and decorators.

## 3. Existing Package Guardrails
- [x] 3.1 Add MikroORM v6 peer dependency guidance to `packages/mikro/package.json` if publish policy allows it.
- [x] 3.2 Ensure `@midwayjs/mikro` tests remain pinned to MikroORM v6.

## 4. Tests
- [x] 4.1 Add a v7 fixture using `@mikro-orm/decorators/legacy` entity definitions.
- [x] 4.2 Test data-source initialization and shutdown.
- [x] 4.3 Test repository injection.
- [x] 4.4 Test entity manager injection and request context behavior.
- [x] 4.5 Test built package import behavior for the ESM-compatible output.
- [x] 4.6 Run `pnpm -C packages/mikro7 test`.
- [x] 4.7 Run `pnpm -C packages/mikro test`.

## 5. Documentation
- [x] 5.1 Update Chinese MikroORM docs to distinguish v6 and v7 packages.
- [x] 5.2 Update English MikroORM docs with the same version split.
- [x] 5.3 Update CRUD docs if they include MikroORM install guidance.
- [x] 5.4 Document v7 entity imports, metadata provider requirements, and TypeScript module settings.

## 6. Validation
- [x] 6.1 Run relevant lint/build commands for touched packages.
- [x] 6.2 Run `openspec validate add-mikro7-component --strict --no-interactive`.
