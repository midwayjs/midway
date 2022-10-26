# egg:ts-helper

For scenarios where midway supports Egg.js, the original [egg-ts-helper](https://github.com/whxaxes/egg-ts-helper) package is rewritten, and the original TS and AST analysis dependencies are removed.

The ts v3 environment that the original package depends on depends on the egg directory structure, considering many possibilities, it will not be used in the midway scenario. Based on the above considerations, midway rewrites this package to provide egg definitions in the simplest way.

The [@midwayjs/egg-ts-helper](https://github.com/midwayjs/egg-ts-helper) package provides the `ets` global command.

```bash
$ npm i @midwayjs/egg-ts-helper --save-dev
$ ets
```

Usually we will add it to the development command.

```json
  "scripts": {
    "dev": "cross-env ets && cross-env NODE_ENV=local midway-bin dev --ts \",
  },
```

:::info
This package is customized for midway and can only be used for the new version of midway and its supporting code.
:::

Finally, a `typings` directory will be generated in the project root directory with the following definition structure and files:

```
.
├── ...
└── typings
    ├── extend
    │		├── request.d.ts
    │		├── response.d.ts
    │		├── application.d.ts
    │   └── context.d.ts
    ├── app
    │   └── index.d.ts
    └── config
        ├── index.d.ts
        └── plugin.d.ts
```

:::caution
Note that this module only aggregates the framework and plug-in definitions of midway v2(Egg.js), so that the current business code can smoothly read the definitions of the framework and plug-in. It does not support the definition of the business code itself or the definition when developing egg plug-ins.
:::
