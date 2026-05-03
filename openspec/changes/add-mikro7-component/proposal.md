# Change: Add MikroORM v7 component package

## Why
MikroORM v7 moved to native ESM and changed its decorator and metadata-provider APIs, which makes reliable CommonJS/ESM compatibility inside the existing `@midwayjs/mikro` package difficult. Users following current docs can also install MikroORM v7 accidentally while the existing component and examples are validated against v6.

## What Changes
- Add a new `@midwayjs/mikro7` package dedicated to MikroORM v7.
- Keep `@midwayjs/mikro` as the MikroORM v6 component and document its v6 dependency range.
- Provide v7-specific docs and examples using `@mikro-orm/decorators`, explicit metadata-provider configuration, and NodeNext/ESM-compatible TypeScript settings.
- Add tests for the new package covering data-source initialization, request context, entity repository injection, entity manager injection, and package import behavior.
- Mark `@midwayjs/mikro7` as the recommended package for new MikroORM v7 projects while preserving the existing v6 package for current users.

## Impact
- Affected specs: `mikro-orm-component`
- Affected code:
  - `packages/mikro7/**` new package
  - `packages/mikro/package.json` peer dependency/docs guardrails for v6
  - `site/docs/extensions/mikro.md` and English i18n docs
  - workspace/package metadata for the new package
- Compatibility:
  - Existing `@midwayjs/mikro` users remain on the v6 path.
  - MikroORM v7 users migrate to `@midwayjs/mikro7` instead of relying on mixed v6/v7 behavior in one component.
