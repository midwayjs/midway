# ESModule usage guide

For the past few years, Node.js has been working on supporting running ECMAScript modules (ESM). This is a difficult feature to support because the foundation of the Node.js ecosystem is built on a different module system called CommonJS (CJS).

The interoperability between the two modular systems poses great challenges and has many functional differences.

Since Node.js v16, the support of ESM has been relatively stable, and some matching functions of TypeScript have also been implemented one after another.

On this basis, Midway supports file loading in ESM format, and businesses can also use this new module loading method to build their own business.

:::caution

It is not recommended for users to use it without understanding ESM.

:::

Recommended reading:

* [TypeScript Official ESM Guide](https://www.typescriptlang.org/docs/handbook/esm-node.html)
* [Node.js official ESM documentation](https://nodejs.org/api/esm.html)



## Scaffolding

Due to many changes, Midway provides a brand-new scaffolding in ESM format. If there is a need for ESM, we recommend that users re-create it before developing business.

```bash
$ npm init midway@latest -y
```

Select the scaffolding in the esm group.



## Differences from CJS projects

### 1. Changes in package.json

  type in `package.json` must be set to `module`.

```json
{
   "name": "my-package",
   "type": "module",
   //...
   "dependencies": {
   }
}
```



### 2. Changes in tsconfig.json

`compilerOptions` compile-related options need to be set to `Node16` or `NodeNext`.

```json
{
   "compilerOptions": {
     "target": "ESNext",
     "module": "ESNext",
     "moduleResolution": "Node16",
     "esModuleInterop": true,
     //...
   }
}
```



### 3. Changes in the tool chain

Since the original development toolchain only supports CJS code, and some modules in the community do not support ESM, Midway uses a new toolchain in ESM mode.

* Development command, use mwtsc (only do tsc necessary package)
* Test and coverage commands, using mocha + ts-node, both test code and test configuration have been adjusted
* build command, use tsc

Some features that are no longer supported

* alias path, please use [subpath export](https://nodejs.org/api/packages.html#subpath-exports) that comes with Node.js instead
* Copy non-js files when building, put non-code files outside src, or add custom commands when building

For specific differences, please refer to [Scaffolding](https://github.com/midwayjs/midway-boilerplate/blob/master/v3/midway-framework-koa-esm/boilerplate/_package.json) to check.



### 4. Some code differences

Here's a quick list of some of the differences between ESM and CJS in development.



1. In ts, the import file must specify a suffix name, and the suffix name is js.

```typescript
import { helper } from "./foo.js"; // works in ESM & CJS
```



2. You can no longer use `module.exports` or `exports.` to export.

```typescript
// ./foo.ts
export function helper() {
     //...
}
// ./bar.ts
import { helper } from "./foo"; // only works in CJS
```



3. You cannot use `require` in your code

Only the `import` keyword can be used.



4. You cannot use `__dirname`, `__filename`, etc. and path-related keywords in the code

```typescript
// ESM solution
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
```

Therefore, the configuration part must use the object mode.

```typescript
import { Configuration } from '@midwayjs/core';
import DefulatConfig from './config/config.default.js';
import UnittestConfig from './config/config.unittest.js';

@Configuration({
   importConfigs: [
     {
       default: DefulatConfig,
       unittest: UnittestConfig,
     },
   ],
})
export class MainConfiguration {
   //...
}
```