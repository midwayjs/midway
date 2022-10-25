# Change Source Dir

In some special scenarios, you can modify the `src` directory where the source code is located.


Some restrictions:

- 1. @midwayjs/web(egg)egg cannot be modified due to fixed directory
- 2. Only pass the test under pure node project (non-integration)

## Modification of Source Code Directory

Below, we will change the `src` directory to `server` as an example.

### dev development

The Dev command in `package.json` needs to add a source directory to facilitate Dev search.

```typescript
"dev": "cross-env NODE_ENV=local midway-bin dev --sourceDir=./server --ts ",
```

### build compilation

In order for tsc compilation to find the source directory, it is necessary to modify the `tsconfig.json` and add `rootDir` fields.

```typescript
{
  "compileOnSave": true
  "compilerOptions": {
    // ...
    "rootDir": "server"
  },
}
```

In this way, development and compilation are normal.


## Modification of Compiled Directory

Compiling the directory affects the deployment and can also be modified. In this example, change the `dist` directory to `build`.

### build compilation

Modify the `outDir` field in the `tsconfig.json`.

```typescript
{
  "compileOnSave": true
  "compilerOptions": {
    // ...
    "outDir": "build"
  },
}
```

So the compilation is normal.


### bootstrap startup


After the compilation directory is modified, the online deployment will not find the code, so if the `bootstrap.js` is started, the code needs to be modified.

```typescript
// bootstrap.js

const { join } = require('path');
const { Bootstrap } = require('@midwayjs/bootstrap');

//...

// configure method is required to configure baseDir
Bootstrap
  .configure({
    baseDir: join(__dirname, 'build')
  })
  .run();
```

Configure the portal directory for the `Bootstrap`.
