
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 3.x 升级指南

本篇将介绍从 midway v3 升级为 midway v4 的方式。

从 Midway v3 升级到 Midway v4，会有一些 Breaking Change。本篇文档会详细列出这些 Breaking 的地方，让用户可以提前知道变化，做出应对。



:::tip

midway v4 支持从 node v18 起。

:::


## 包版本更新

所有的组件包，核心包都将升级为 4.x 版本。

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

`@midwyajs/luckeye`, `@midwayjs/logger` 的版本除外。


## 移除 `@midwayjs/decorator`

从 v4 开始，移除了 `@midwayjs/decorator` 包，用户可以直接使用 `@midwayjs/core` 来代替。


## 入口自动扫描能力

从 v4 开始，框架移除了隐式的自动扫描能力，建议用户显式的声明需要扫描的目录。

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

## 主框架日志配置

从 v4 开始，主框架日志格式回归到 midwayLogger 配置中。

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

其余的 `cron`、`mqtt`, `kafka` 等组件，如有相关配置，均和上述类似。
