# `@midwayjs/skill-midway`

Midway official skill package.

This package provides three things:

- a bundle builder for Midway docs, API, packages, and changelog data
- a packaged bundle plus lookup commands that query it in structured JSON
- a bundled Midway prompt/skill artifact that can be installed into multiple AI products

## Install

Add the package to your project:

```bash
pnpm add -D @midwayjs/skill-midway
```

Then run commands through `pnpm exec`:

```bash
pnpm exec midway-skill --help
```

## Build The Bundle

Generate the local Midway knowledge bundle from the repository docs and current API data:

```bash
pnpm exec midway-skill build
```

By default this writes to:

```text
site/.midway-skill
```

It also syncs the generated bundle into the package-local publish directory:

```text
packages/skill-midway/bundle
```

That package-local bundle is what gets shipped with the published npm package.

You can override the paths if needed:

```bash
pnpm exec midway-skill build \
  --repo-root /path/to/midway \
  --site-root /path/to/midway/site \
  --output /path/to/output
```

## Query The Bundle

All lookup commands return JSON on stdout so they can be consumed by agents or scripts.

When the package contains a bundled snapshot, lookup commands read that packaged bundle first.
In the Midway source repository, you can still point them at `site/.midway-skill` explicitly with `--bundle-root`.

Resolve the requested Midway version first:

```bash
pnpm exec midway-skill resolve-version 3.20.12
```

Lookup docs:

```bash
pnpm exec midway-skill lookup-docs --query "mcp"
pnpm exec midway-skill lookup-docs --query "configuration" --locale en
```

Lookup API symbols:

```bash
pnpm exec midway-skill lookup-api --symbol "Configuration"
pnpm exec midway-skill lookup-api --symbol "MidwayMCPFramework" --package "@midwayjs/mcp"
```

Lookup package metadata:

```bash
pnpm exec midway-skill lookup-packages --query "mcp"
```

Lookup changelog entries:

```bash
pnpm exec midway-skill lookup-changelog --package "@midwayjs/mcp"
pnpm exec midway-skill lookup-changelog --from-version 4.0.0 --to-version 4.0.1
```

## Install For AI Products

Install the bundled Midway artifact into the current project for a specific product:

```bash
pnpm exec midway-skill install --target codex
pnpm exec midway-skill install --target cursor
pnpm exec midway-skill install --target trae
```

You can also install all supported targets at once:

```bash
pnpm exec midway-skill install --target all
```

By default installation is project-scoped and writes under the current working directory.
Examples:

```text
<project-root>/.codex/skills/midway/SKILL.md
<project-root>/.cursor/commands/opsx-midway.md
<project-root>/.trae/skills/midway/SKILL.md
```

This keeps the installed skill version aligned with the project's `@midwayjs/skill-midway` version.

You can still override the destination directory when needed:

```bash
pnpm exec midway-skill install --target codex --dest /path/to/project
```

To overwrite an existing installed skill:

```bash
pnpm exec midway-skill update --target codex
pnpm exec midway-skill update --target all
```

Supported targets currently include:

```text
amazon-q
antigravity
auggie
claude
cline
codebuddy
codex
continue
costrict
crush
cursor
factory
gemini
github-copilot
iflow
kilocode
kiro
opencode
pi
qoder
qwen
roocode
trae
windsurf
```

## Version Behavior

- current major: `docs + api + changelog`
- historical majors: `docs + changelog`
- historical API lookups are not guaranteed and will return empty results when API capability is unavailable

Use `resolve-version` before answering version-sensitive questions so the caller can see whether the result was exact or a major-version fallback.
