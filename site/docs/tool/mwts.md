# Lint 和格式化

Midway 的框架和业务代码主要由 TypeScript 编写，默认使用 [mwts](https://github.com/midwayjs/mwts) 统一 lint 和格式化。

## 代码风格库

`mwts` 是 Midway 的 TypeScript 规范工具链，提供：
- ESLint 检查（`check` / `lint`）
- 自动修复（`fix`）
- 默认格式化配置（默认 `Prettier + ESLint`）

`mwts` 的设计思路来源于 [gts](https://github.com/google/gts)，但不直接依赖 `gts` 包。

:::info
在 Midway 项目中，一般脚手架会默认集成 `mwts`，这里主要说明配置方式和升级方式。
:::

## 依赖与运行时要求

`mwts 2.x` 建议搭配：

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

## 初始化与迁移

新项目可直接初始化：

```bash
npx mwts init
```

如果是历史 `mwts 1.x` 项目（`.eslintrc.json`），可执行一次迁移：

```bash
npx mwts migrate
```

迁移后会生成 `eslint.config.js`（ESLint Flat Config）。

## ESLint 配置（mwts 2.x）

`mwts 2.x` 使用 `eslint.config.js`，推荐配置如下（可按项目调整 `ignores`）：

```js
const mwtsConfig = require('mwts/eslint.config.js');

module.exports = [
  {
    ignores: ['**/node_modules', '**/dist'],
  },
  ...mwtsConfig,
];
```

如果你的项目使用 Jest，建议按需为测试文件增加 globals：

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

## 执行检查和修复

常用脚本如下（仓库一般已内置）：

```json
{
  "scripts": {
    "lint": "mwts check",
    "lint:fix": "mwts fix"
  }
}
```

`mwts check/lint/fix` 也支持单文件参数，例如：

```bash
mwts check src/index.ts
mwts fix src/index.ts
```

## Prettier 配置

默认模式下，保留 `.prettierrc.js`：

```js
module.exports = {
  ...require('mwts/.prettierrc.json'),
};
```

## 可选 formatter 模式

`mwts init` 支持三种模式：
- 默认：`Prettier + ESLint`
- `--formatter stylistic`：`ESLint + Stylistic`
- `--formatter biome`：`Biome + ESLint`

未使用默认模式时，按生成的配置文件执行即可。
