# Migrate from Serverless v2 to v3

Based on the upgrade of Midway to v3, the Serverless system has also been upgraded to the v3 version simultaneously.

This article describes how to migrate from Serverless v2.0 to Serverless v3.0, which is very similar to traditional application upgrades.

:::caution

The new Serverless currently only supports Alibaba Cloud functions.

:::



## 1. Upgrade of project package version

Some dependency package upgrades include:

* Midway and component versions upgraded to 3.x
* CLI, Jest and other version upgrades
* Removed some no longer used dependencies, such as `@midwayjs/serverless-app`

```diff
"scripts": {
   "dev": "cross-env NODE_ENV=local midway-bin dev --ts",
   "test": "cross-env midway-bin test --ts",
- "deploy": "cross-env UDEV_NODE_ENV=production midway-bin deploy",
   "lint": "mwts check",
   "lint:fix": "mwts fix"
},
"dependencies": {
- "@midwayjs/core": "^2.3.0",
- "@midwayjs/decorator": "^2.3.0",
- "@midwayjs/faas": "^2.0.0"
+ "@midwayjs/core": "^3.12.0",
+ "@midwayjs/faas": "^3.12.0",
+ "@midwayjs/fc-starter": "^3.12.0",
+ "@midwayjs/logger": "^2.0.0"
},
"devDependencies": {
- "@midwayjs/cli": "^1.2.45",
- "@midwayjs/cli-plugin-faas": "^1.2.45",
- "@midwayjs/fcli-plugin-fc": "^1.2.45",
- "@midwayjs/mock": "^2.8.7",
- "@midwayjs/serverless-app": "^2.8.7",
- "@midwayjs/serverless-fc-trigger": "^2.10.3",
- "@midwayjs/serverless-fc-starter": "^2.10.3",
- "@types/jest": "^26.0.10",
- "@types/node": "14",
- "cross-env": "^6.0.0",
- "jest": "^26.4.0",
- "mwts": "^1.0.5",
- "ts-jest": "^26.2.0",
- "typescript": "~4.6.0"
+ "@midwayjs/mock": "^3.12.0",
+ "@types/jest": "29",
+ "@types/node": "16",
+ "cross-env": "^7.0.3",
+ "jest": "29",
+ "mwts": "^1.3.0",
+ "ts-jest": "29",
+ "ts-node": "^10.9.1",
+ "typescript": "~5.1.0"
}
```



## 2. Changes to the main entrance frame

Explicitly declare faas as the main framework.

```typescript
// src/configuration
import * as faas from '@midwayjs/faas';

@Configuration({
   // ...
   imports: [
     faas
   ],
})
export class MainConfiguration {
   // ...
}

```



## 3. Test code changes

Removed dependency on `@midwayjs/serverless-app`.

```diff
import { createFunctionApp, close, createHttpRequest } from '@midwayjs/mock';
- import { Framework, Application } from '@midwayjs/serverless-app';
+ import { Framework, Application } from '@midwayjs/faas';
```

Removed `@midwayjs/serverless-fc-trigger` and `@midwayjs/serverless-fc-starter` dependencies and changed to `@midwayjs/fc-starter`.

```typescript
import { Application, Context, Framework } from '@midwayjs/faas';
import { mockContext } from '@midwayjs/fc-starter';
import { createFunctionApp } from '@midwayjs/mock';

describe('test/hello_aliyun.test.ts', () => {

   it('should get result from event trigger', async () => {
    
     // create app
     const app: Application = await createFunctionApp<Framework>(join(__dirname, '../'), {
       initContext: Object.assign(mockContext(), {
         function: {
           name: '***',
           handler: '***'
         }
       }),
     });
    
     // ...
    
     await close(app);
   });
});
```

Some API replacements, such as the original `createXXXEvent`, will become `mockXXXEvent`, and the original `createInitializeContext` will become the `mockContext` method.

These APIs will be exported directly from `@midwayjs/fc-starter`.



## 5. Changes in deployment methods

Instead of using `midway-bin deploy` for deployment, the platform's own CLI tool will be used. Midway only provides framework and local development capabilities.

For more deployment adjustments, please check [Pure Function Deployment](/docs/serverless/aliyun_faas).