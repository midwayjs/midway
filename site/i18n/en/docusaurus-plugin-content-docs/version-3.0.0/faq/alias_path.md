# About Alias Path

We do not recommend using Alias Path, Node and TS that do not support this function natively. Even if they do, they are now implemented through various Hack methods (starting from v18, Node.js already has a exports scheme, but the type is not supported yet, so you can wait for it later).

If you must want to use it, please look down.

## Support for Local Development (dev Phase)

Tsc does not convert the module path of import when compiling ts into js, so when you configure paths in `tsconfig.json`, if you use paths in ts and import the corresponding module, there is a high probability that the module cannot be found when compiling js.

The solution is to either use paths, or use paths to import some declarations instead of specific values, or use [tsconfig-paths](https://github.com/dividab/tsconfig-paths) to hook out the module path resolution logic in node to support paths in `tsconfig.json`.

```bash
$ npm i tsconfig-paths --save-dev
```

The use tsconfig-paths can be introduced in `src/configuration.ts`.

```typescript
// src/configuration.ts

import 'tsconfig-paths/register';
// ...
```

:::info

The above method will only take effect for dev phase (ts-node).

:::



## test support (jest test)

In the test, due to Jest's special environment, alias needs to be processed again. `moduleNameMapper` functions in Jest's configuration file can be used to replace the loaded modules to realize alias functions in disguise.

```typescript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures']
  coveragePathIgnorePatterns: ['<rootDir>/test/']
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

Note that the alias prefix used here is the @symbol. If it is another alias name, please modify it yourself.



## Runtime support

`tsconfig-paths` replace paths in memory after ts runs. After compilation, paths with @symbols will still be output, so that files cannot be found after deployment. Some libraries in the community will do some replacement support in ts compilation.

For example:

- https://github.com/justkey007/tsc-alias



## Other

An mwcc compiler is embedded in the old version CLI, which replaces Alias content in the builder based on the fixed TS version. However, due to the dependency of TS private API, the TS version cannot be upgraded and the functions of the new version cannot be enjoyed.

We removed this compiler from the CLI 2.0 version.