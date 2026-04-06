---
name: midway
description: Use when the task involves Midway framework docs, package selection, API lookup, version compatibility, MCP/HTTP/framework components, or migration guidance. Resolve the requested Midway version first, then query the local Midway skill bundle with `midway-skill` commands.
---

# Midway

Use the local `@midwayjs/skill-midway` bundle before relying on memory.

## Workflow

1. Resolve the user's requested version first.
   Run `npm exec midway-skill -- resolve-version <version>` or `pnpm exec midway-skill resolve-version <version>`.
   If no version is given, use `current`.

2. Query the right source for the question.
   Use `npm exec midway-skill -- lookup-docs --query "<topic>"` or `pnpm exec midway-skill lookup-docs --query "<topic>"`.
   Use `npm exec midway-skill -- lookup-api --symbol "<symbol>"` or `pnpm exec midway-skill lookup-api --symbol "<symbol>"` for current-major API lookups.
   Use `npm exec midway-skill -- lookup-packages --query "<package or feature>"` or `pnpm exec midway-skill lookup-packages --query "<package or feature>"`.
   Use `npm exec midway-skill -- lookup-changelog --package "<package>"` or `pnpm exec midway-skill lookup-changelog --package "<package>"` for release history.

3. Cite what the bundle resolved.
   Include the requested version, resolved version, and whether it was an exact match or major-version fallback.

## Rules

- Prefer bundle results over recollection.
- Historical majors only guarantee `docs` and `changelog`.
- If `resolve-version` reports `api: false`, do not claim exact historical API details.
- When results are empty, say that the bundle did not contain a match instead of inventing one.
- Prefer package names with the `@midwayjs/` scope in answers when known.

## Output

- State the resolved Midway version.
- Summarize the matched docs/API/package/changelog result.
- Keep links or source paths from bundle records when relevant.
