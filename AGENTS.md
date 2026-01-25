<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Repository Guide for Agents

## Project overview
- Midway v4 monorepo managed by lerna + pnpm workspace.
- TypeScript 5, built with `tsc`, tested with `jest`.
- IoC container implementation lives in `packages/core` (MidwayContainer, DecoratorManager, MetadataManager).

## Code rules
- Each component is an independent npm package and can communicate via DI.
- New/changed components must include tests. Run `npm run test` in the package.
- Use `mwts` for linting (`npm run lint:fix` when needed).
- Add meaningful comments for functions/classes/interfaces/enums.

## Docs rules
- Current docs live under `site/docs` (Docusaurus).
- Match existing doc style/tone/structure for consistency.
- Show dependency installation in both bash (npm) and JSON `package.json` forms.
- Doc changes do not require a build check.

## Practical tips
- Prefer `pnpm -C <package> test` to scope tests.
- Keep changes aligned with existing patterns in the targeted package.
