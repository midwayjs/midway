# Lint tools, rules and formatting

Midway's framework and business code are written by TypeScript. The default Midway provides a set of default lint, editor and formatting rules for more convenient development and testing.

## Code style library

The code style library of Midway is called [mwts](https://github.com/midwayjs/mwts), which is derived from Google's [gts](https://github.com/google/gts). Mwts is Midway's TypeScript style guide and the configuration of formatter, linter and automatic code fix.

:::info
In the midway project, we will add mwts by default. The following process is just to explain how to use mwts.
:::

In order to use mwts, we need to add it to the development dependency.

```json
  "devDependencies": {
    "mwts": "^1.0.5 ",
    "typescript": "^4.0.0"
  },
```

## ESLint configuration

Mwts provides a default set of ESLint configurations (TSLint has been abandoned and merged into ESLint).

Create a `.eslintrc.json` file in the root directory of the project, with the following contents (usually scaffolding will bring it with it):

```json
{
  "extends": "./node_modules/mwts /",
  "ignorePatterns": ["node_modules", "dist", "test", "jest.config.js", "interface.ts"]
  "env": {
    "jest": true
  }
}
```

The above is the default configuration of midway project. Other project `ignorePatterns` and `env` can be adjusted according to ESLint.

For more information about the default rules for mwts, see [here](https://github.com/midwayjs/mwts/blob/master/.eslintrc.json).

## Perform code checking and formatting

You can run the `mwts check` command and the `mwts fix` command to check the code. For example, add script commands to the project (usually scaffolding will come with it).

```typescript
  "scripts": {
    "lint": "mwts check ",
    "lint:fix": "mwts fix",
  },
```

## Prettier configuration

Mwts provides a set of default prettier configurations, creating a `.prettierrc.js` file with the following configuration contents (usually scaffolding comes with it).

```javascript
module.exports = {
  ...require('mwts/.prettierrc.json')
};
```

## Configure save automatic formatting

Let's take VSCode as an example.

The first step is to install the Prettier plug-in.

![](https://cdn.nlark.com/yuque/0/2021/png/501408/1618042429530-177c3636-aefc-419d-8d3a-5258cad13631.png)

Open the configuration, search for "save", find "Format On Save" on the right, and check.

![](https://cdn.nlark.com/yuque/0/2021/png/501408/1618042494782-71b6cc3c-18ae-4344-987b-ec82084f2dd8.png)

If saving the file has no effect, the editor usually has multiple formatting methods, you can right-click to make the default selection.

![](https://cdn.nlark.com/yuque/0/2021/png/501408/1618125271116-845e8452-0f7b-46a9-a28a-388f2db9c5e3.png)

Select Configure Default Formatters ".

![](https://cdn.nlark.com/yuque/0/2021/png/501408/1618125381302-d3fe30c1-e56d-43f8-ada2-6e315f4ff2c4.png)

Select Prettier.

![](https://cdn.nlark.com/yuque/0/2021/png/501408/1618125423564-8e46b0f8-f422-4e3d-a805-3b0a1db037f8.png)
