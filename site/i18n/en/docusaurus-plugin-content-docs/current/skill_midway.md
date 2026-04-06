# Midway Skill Usage

`@midwayjs/skill-midway` is the official Midway AI skill package.

It helps you do two things in a Midway project:

- install a project-scoped Midway skill for AI coding tools
- query local Midway docs, APIs, packages, and changelog data

If you want Codex, Cursor, Trae, or similar tools to work with more stable Midway context, install this package in the project.

## Install

Install the package in your project:

```bash
$ npm i @midwayjs/skill-midway@4 --save-dev
```

Or add it to `package.json` and reinstall:

```json
{
  "devDependencies": {
    "@midwayjs/skill-midway": "^4.0.0"
  }
}
```

## Install Into AI Tools

Run the installer without `--target` to choose interactively:

```bash
$ npx midway-skill install
```

Or choose a target explicitly:
The following are only common examples:

```bash
$ npx midway-skill install --target codex
$ npx midway-skill install --target cursor
$ npx midway-skill install --target trae
```

Install all supported targets at once:

```bash
$ npx midway-skill install --target all
```

Current supported targets:

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

Installation is project-scoped by default. Example paths:

- Codex: `.codex/skills/midway/SKILL.md`
- Cursor: `.cursor/commands/opsx-midway.md`
- Trae: `.trae/skills/midway/SKILL.md`

To overwrite an existing installation:

```bash
$ npx midway-skill update
```

## Query Docs And APIs

Resolve the requested Midway version first:

```bash
$ npx midway-skill resolve-version 3.20.12
```

Lookup docs:

```bash
$ npx midway-skill lookup-docs --query "mcp"
```

Lookup APIs:

```bash
$ npx midway-skill lookup-api --symbol "Configuration"
```

Lookup packages:

```bash
$ npx midway-skill lookup-packages --query "mcp"
```

Lookup changelog:

```bash
$ npx midway-skill lookup-changelog --package "@midwayjs/mcp"
```

All lookup commands return JSON on stdout.

## Version Notes

- current major: `docs + api + changelog`
- historical majors: `docs + changelog`

Historical major versions do not guarantee exact API lookup results.
