import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 3.x Upgrade Guide

This article will introduce how to upgrade from midway v3 to midway v4.

Upgrading from Midway v3 to Midway v4 will have some Breaking Changes. This document only lists these Breaking changes to let users know the changes in advance and make responses.



## Node.js Changes

midway v4 supports from node v20 onwards, it's best to use the LTS version.




## Package Version Updates

All component packages and core packages will be upgraded to 4.x versions.

> Currently in beta stage

```diff
{
  "dependencies": {
-    "@midwayjs/bootstrap": "^3.0.0",
-    "@midwayjs/core": "^3.0.0",
-    "@midwayjs/koa": "^3.0.0",
-    "@midwayjs/logger": "^3.0.0",
+    "@midwayjs/bootstrap": "^4.0.0-beta.1",
+    "@midwayjs/core": "^4.0.0-beta.1",
+    "@midwayjs/koa": "^4.0.0-beta.1",
+    "@midwayjs/logger": "^4.0.0",
  },
  "devDependencies": {
-    "@midwayjs/mock": "^3.0.0",
+    "@midwayjs/mock": "^4.0.0-beta.1",
    // ...
  }
}

```

The version of `@midwyajs/luckeye` is excluded.




## Remove `@midwayjs/decorator`

Starting from v4, the `@midwayjs/decorator` package has been removed, users can directly use `@midwayjs/core` instead.

```diff
- import { Controller } from '@midwayjs/decorator';
+ import { Controller } from '@midwayjs/core';
```






## Entry Auto-scanning Capability

Starting from v4, the framework removes the implicit auto-scanning capability, users need to explicitly declare the directories that need to be scanned.

```typescript
import { Configuration, CommonJSFileDetector } from '@midwayjs/core';

@Configuration({
  detector: new CommonJSFileDetector(),
  // ...
})
export class MainContainer {
  // ...
}
```

You can also specify directories to ignore.

```typescript
import { Configuration, CommonJSFileDetector } from '@midwayjs/core';

@Configuration({
  detector: new CommonJSFileDetector({
    ignore: [
      '**/logs/**',
    ],
  }),
  // ...
})
export class MainContainer {
  // ...
}
```

Duplicate check configuration is also moved to parameters.

```typescript
import { Configuration, CommonJSFileDetector } from '@midwayjs/core';

@Configuration({
  detector: new CommonJSFileDetector({
    conflictCheck: true,
  }),
  // ...
})
export class MainContainer {
  // ...
}
```





## Main Framework Logging Configuration

Starting from v4, the main framework logging format returns to the midwayLogger configuration.

<Tabs>
<TabItem value="koa" label="Koa">

```diff
// *.config.ts
export default {
  koa: {
-    contextLoggerFormat: info => {
-      const ctx = info.ctx;
-      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
-    }
  },
  midwayLogger: {
    clients: {
      appLogger: {
+        contextFormat: info => {
+           const ctx = info.ctx;
+           return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
+        }
      }
    }
  },
} as MidwayConfig;
```

</TabItem>

<TabItem value="express" label="Express">

```diff
// *.config.ts
export default {
  express: {
-    contextLoggerFormat: info => {
-      const ctx = info.ctx;
-      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
-    }
  },
  midwayLogger: {
    clients: {
      appLogger: {
+        contextFormat: info => {
+           const ctx = info.ctx;
+           return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
+        }
      }
    }
  },
} as MidwayConfig;
```

</TabItem>

<TabItem value="egg" label="Egg">

```diff
// *.config.ts
export default {
  egg: {
-    contextLoggerFormat: info => {
-      const ctx = info.ctx;
-      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
-    }
  },
  midwayLogger: {
    clients: {
      appLogger: {
+        contextFormat: info => {
+           const ctx = info.ctx;
+           return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
+        }
      }
    }
  },
} as MidwayConfig;
```

</TabItem>

<TabItem value="bull" label="Bull">

```diff
// *.config.ts
export default {
  bull: {
-    contextLoggerFormat: info => {
-      const { jobId, from } = info.ctx;
-      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${jobId} ${from.name}] ${info.message}`;
-    }
  },
  midwayLogger: {
    clients: {
      bullLogger: {
+        contextFormat: info => {
+          const { jobId, from } = info.ctx;
+          return `${info.timestamp} ${info.LEVEL} ${info.pid} [${jobId} ${from.name}] ${info.message}`;`;
+        }
      }
    }
  },
} as MidwayConfig;
```
</TabItem>

</Tabs>

Other components like `cron`, `mqtt`, `kafka`, etc., if they have related configurations, are similar to the above.



## Optional Change Reference

The following is a comparison table of Breaking Changes for each package, showing specific change content classified by package name.

### @midwayjs/core

#### @App() Decorator Changes

Use `@MainApp()` instead of `@App()` with empty parameters:

```diff
- @App()
+ @MainApp()
private app;
```

#### @Config() Decorator Changes

Use `@AllConfig()` to replace `@Config(ALL)`:

```diff
- @Config(ALL)
+ @AllConfig()
private allConfig;
```

#### DecoratorManager API Adjustments

API name adjustments in `DecoratorManager`:

```diff
import { DecoratorManager } from '@midwayjs/core';

- DecoratorManager.listPrelaodModules()
+ DecoratorManager.listPreStartModule()

- DecoratorManager.savePreloadModule('xxxx', xxx)
+ DecoratorManager.savePreStartModule('xxxx', xxx)
```

#### @Configuration Parameter Changes

Remove `conflictCheck` and `detectorOptions` from `@Configuration`, these configurations will be moved to `detector`:

```diff
@Configuration({
- conflictCheck: true,
- detectorOptions: { ... },
+ detector: new CommonJSFileDetector({
+   conflictCheck: true,
+   // ... other configurations
+ }),
  // ...
})
```

#### Container API Simplification

Removed some useless parameters from `container.get` and `container.getAsync`:

```diff
// Previously had extra parameters
- container.get(identifier, args, options)
+ container.get(identifier, args)

- container.getAsync(identifier, args, options)
+ container.getAsync(identifier, args)
```

#### Pipeline Flow Control Removal

Due to low usage and impact on dependency injection container logic, the flow control `Pipeline` related capabilities have been removed:

```diff
- import { Pipeline } from '@midwayjs/core';
- 
- @Pipeline()
- export class MyPipeline {
-   // pipeline related code
- }
```

If similar functionality is needed, it is recommended to use middleware or interceptors instead.

#### Automatic DTO Conversion Removal

Removed the automatic DTO conversion function for request parameters that would cause ambiguity with validate conversion. Now automatic conversion only takes effect when the `validate` or `validation` component is enabled:

```diff
// In v3, even without enabling validate, it would automatically convert
export class UserController {
  @Post()
  async create(@Body() user: CreateUserDTO) {
-   // v3: Automatically converts to CreateUserDTO instance
+   // v4: Need to explicitly enable validate or validation component for conversion
    return user;
  }
}

// In v4, explicit configuration is needed
+ import { Configuration } from '@midwayjs/core';
+ import * as validate from '@midwayjs/validate'; // or @midwayjs/validation
+ 
+ @Configuration({
+   imports: [validate],
+ })
+ export class MainConfiguration {}
```

#### MidwayFrameworkType Removal

```diff
- import { MidwayFrameworkType } from '@midwayjs/core';
- 
- // Get framework type
- const frameworkType = app.getFrameworkType();
- if (frameworkType === MidwayFrameworkType.WEB_KOA) {
-   // koa framework related logic
- }
```

#### BaseFramework Hook Method Removal

```diff
export class CustomFramework extends BaseFramework {
- async beforeContainerReady() {
-   // Logic before container ready
- }
- 
- async afterContainerReady() {
-   // Logic after container ready
- }
}
```

#### DataSourceManager Configuration Deprecation

```diff
// Data source manager configuration
export const dataSourceConfig = {
- cacheInstance: true,
- validateConnection: true,
  // Other configurations remain unchanged
};
```

### @midwayjs/async-hooks-context-manager

#### Default Enable async_local_storage

Now async_local_storage is enabled by default, code is merged into the core module, users don't need to manually import:

### @midwayjs/axios

#### axios Export Removal

Removed the deprecated `axios` export:

```diff
- import { axios } from '@midwayjs/axios';
+ import { HttpService } from '@midwayjs/axios';

export class UserService {
- @Inject()
- axios: axios;

+ @Inject()
+ httpService: HttpService;

  async getUser() {
-   return this.axios.get('/api/user');
+   return this.httpService.get('/api/user');
  }
}
```

### @midwayjs/socketio

#### Built-in socket.io-redis Removal

Removed the built-in `socket.io-redis`, if you need Redis adapter, please manually install and configure `socket.io-redis`.

### @midwayjs/validate

No longer updated, recommend using @midwayjs/validation component.

### @midwayjs/mock

#### createApp Method Parameter Adjustment

Removed the last parameter of `createApp`, `createLightApp`, `createFunctionApp` methods, now additional components can be written in `options.imports`:

```diff
- createApp('path', {}, ['extra-component'])
+ createApp('path', { imports: ['extra-component'] })
```

If you have a lot of historical tests that are inconvenient to modify, you can use the provided `createLegacyApp`, `createLegacyLightApp`, `createLegacyFunctionApp`.

### @midwayjs/sequelize

#### @BaseTable Decorator Removal

```diff
- import { BaseTable } from '@midwayjs/sequelize';
- 
- @BaseTable()
- export class User extends Model {}

+ import { Table } from 'sequelize-typescript';
+ 
+ @Table
+ export class User extends Model {}
```

#### validateConnection Configuration Removal

```diff
// Configuration file
export default {
  sequelize: {
    dataSource: {
      default: {
        database: 'test',
        username: 'root',
        password: '',
-       validateConnection: true, // No longer validates connection by default
        // Can be manually enabled if needed
+       // validateConnection: true,
      }
    }
  }
}
```

### @midwayjs/tags

#### Package Completely Removed

This package is no longer provided in v4, need to remove related imports and configurations:

```diff
- import * as tags from '@midwayjs/tags';
- 
- @Configuration({
-   imports: [
-     // Other components
-     tags,
-   ],
- })
- export class MainConfiguration {}
```

### @midwayjs/processAgent

#### Package Completely Removed

This package is no longer provided in v4, need to remove related imports and configurations:

```diff
- import * as processAgent from '@midwayjs/processAgent';
- 
- @Configuration({
-   imports: [
-     // Other components
-     processAgent,
-   ],
- })
- export class MainConfiguration {}
```