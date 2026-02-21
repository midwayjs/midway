# Lint and formatting

Midway framework and business code is mainly written in TypeScript. By default, Midway uses [mwts](https://github.com/midwayjs/mwts) to keep linting and formatting consistent.

## Code style package

`mwts` is Midway's TypeScript style toolkit, including:
- ESLint checking (`check` / `lint`)
- Auto fixes (`fix`)
- Default formatting setup (default: `Prettier + ESLint`)

`mwts` is inspired by [gts](https://github.com/google/gts), but it does not directly depend on the `gts` package.

:::info
In Midway projects, `mwts` is usually included by scaffolding. This page explains the configuration and migration flow.
:::

## Dependencies and runtime requirements

For `mwts 2.x`, the recommended baseline is:

```json
{
  "engines": {
    "node": ">=20"
  },
  "devDependencies": {
    "mwts": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Init and migration

For new projects:

```bash
npx mwts init
```

For legacy `mwts 1.x` projects (`.eslintrc.json` based):

```bash
npx mwts migrate
```

After migration, `eslint.config.js` (ESLint Flat Config) will be generated.

## ESLint config (mwts 2.x)

`mwts 2.x` uses `eslint.config.js`. A recommended setup is:

```js
const mwtsConfig = require('mwts/eslint.config.js');

module.exports = [
  {
    ignores: ['**/node_modules', '**/dist'],
  },
  ...mwtsConfig,
];
```

If your project uses Jest, add Jest globals for test files:

```js
const globals = require('globals');

module.exports = [
  ...require('mwts/eslint.config.js'),
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/jest.setup.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
```

## Run check and fix

Common scripts (usually already included):

```json
{
  "scripts": {
    "lint": "mwts check",
    "lint:fix": "mwts fix"
  }
}
```

`mwts check/lint/fix` also support file arguments:

```bash
mwts check src/index.ts
mwts fix src/index.ts
```

## Prettier config

In default mode, keep `.prettierrc.js`:

```js
module.exports = {
  ...require('mwts/.prettierrc.json'),
};
```

## Optional formatter modes

`mwts init` supports three modes:
- default: `Prettier + ESLint`
- `--formatter stylistic`: `ESLint + Stylistic`
- `--formatter biome`: `Biome + ESLint`

If you choose non-default mode, follow the generated config files.
