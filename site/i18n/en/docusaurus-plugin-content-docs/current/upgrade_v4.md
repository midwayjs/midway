import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Upgrading to v4

This guide will help you upgrade from Midway v3 to Midway v4.

There are some breaking changes when upgrading from Midway v3 to Midway v4. This document will list these breaking changes in detail so users can be aware of the changes and prepare accordingly.

:::tip
Midway v4 supports Node.js v18 and above.
:::

## Package Version Updates

All component packages and core packages will be upgraded to version 4.x.

```diff
{
  "dependencies": {
-    "@midwayjs/bootstrap": "^3.0.0",
-    "@midwayjs/core": "^3.0.0", 
-    "@midwayjs/koa": "^3.0.0",
+    "@midwayjs/bootstrap": "^4.0.0",
+    "@midwayjs/core": "^4.0.0",
+    "@midwayjs/koa": "^4.0.0",
  },
  "devDependencies": {
-    "@midwayjs/mock": "^3.0.0",
+    "@midwayjs/mock": "^4.0.0",
    // ...
  }
}
```

Except for `@midwyajs/luckeye` and `@midwayjs/logger` versions.

## Removal of `@midwayjs/decorator`

Starting from v4, the `@midwayjs/decorator` package has been removed. Users can directly use `@midwayjs/core` instead.

## Automatic Entry Scanning Capability

Starting from v4, the framework removes implicit automatic scanning capability. It is recommended that users explicitly declare the directories that need to be scanned.

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

## Main Framework Log Configuration

Starting from v4, the main framework log format returns to the midwayLogger configuration.

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
+          const ctx = info.ctx;
+          return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
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
+          const ctx = info.ctx;
+          return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
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
+          const ctx = info.ctx;
+          return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
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

Similar changes apply to other components like `cron`, `mqtt`, `kafka`, etc., if they have related configurations.