import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Change Source Dir

In some special scenarios, you can modify the `src` directory where the source code is located.


Some restrictions:

- 1. @midwayjs/web(egg)egg cannot be modified due to fixed directory
- 2. Only pass the test under pure node project (non-integration)

## Modification of Source Code Directory

Below, we will change the `src` directory to `server` as an example.

### dev development

The Dev command in `package.json` needs to add a source directory to facilitate Dev search.

<Tabs groupId="scripts">

<TabItem value="mwtsc" label="Use mwtsc">

The `outDir` field in `tsconfig.json` is recognized by default and no adjustment is required.

</TabItem>

<TabItem value="cli" label="Use @midwayjs/cli">

```typescript
"dev": "cross-env NODE_ENV=local midway-bin dev --sourceDir=./server --ts",
```

</TabItem>

</Tabs>


### build compilation

<Tabs groupId="scripts">

<TabItem value="mwtsc" label="Use mwtsc">

The `outDir` field in `tsconfig.json` is recognized by default and no adjustment is required.

</TabItem>

<TabItem value="cli" label="Use @midwayjs/cli">

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

</TabItem>

</Tabs>


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
  "exclude": {
    "build",
    //...
  }
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
