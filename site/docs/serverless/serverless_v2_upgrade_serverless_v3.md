# 从 Serverless v2 迁移到 v3

基于 Midway 升级到 v3 的缘故，Serverless 体系也同步升级到了 v3 版本。

本文章介绍如何从 Serverless v2.0 迁移到 Serverless v3.0，和传统应用升级非常的类似。



## 1、项目包版本的升级

一些依赖包升级，包括：

* midway 及组件版本升级到 3.x
* CLI，Jest 等版本升级
* 移除了一些不再使用的依赖，比如 `@midwayjs/serverless-app`

```diff
"scripts": {
	"dev": "cross-env NODE_ENV=local midway-bin dev --ts",
  "test": "cross-env midway-bin test --ts",
-  "deploy": "cross-env UDEV_NODE_ENV=production midway-bin deploy",
  "lint": "mwts check",
  "lint:fix": "mwts fix"
},
"dependencies": {
-   "@midwayjs/core": "^2.3.0",
-   "@midwayjs/decorator": "^2.3.0",
-   "@midwayjs/faas": "^2.0.0"
+   "@midwayjs/core": "^3.12.0",
+   "@midwayjs/faas": "^3.12.0",
+   "@midwayjs/fc-starter": "^3.12.0",
+   "@midwayjs/logger": "^2.0.0"
},
"devDependencies": {
-  "@midwayjs/cli": "^1.2.45",
-  "@midwayjs/cli-plugin-faas": "^1.2.45",
-  "@midwayjs/fcli-plugin-fc": "^1.2.45",
-  "@midwayjs/mock": "^2.8.7",
-  "@midwayjs/serverless-app": "^2.8.7",
-  "@midwayjs/serverless-fc-trigger": "^2.10.3",
-  "@midwayjs/serverless-fc-starter": "^2.10.3",
-  "@types/jest": "^26.0.10",
-  "@types/node": "14",
-  "cross-env": "^6.0.0",
-  "jest": "^26.4.0",
-  "mwts": "^1.0.5",
-  "ts-jest": "^26.2.0",
-  "typescript": "~4.6.0"
+  "@midwayjs/mock": "^3.12.0",
+  "@types/jest": "29",
+  "@types/node": "16",
+  "cross-env": "^7.0.3",
+  "jest": "29",
+  "mwts": "^1.3.0",
+  "ts-jest": "29",
+  "ts-node": "^10.9.1",
+  "typescript": "~5.1.0"
}
```



## 2、入口主框架的变化

显式声明 faas 作为主框架。

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



## 3、测试代码变化

移除了 `@midwayjs/serverless-app` 的依赖。

```diff
import { createFunctionApp, close, createHttpRequest } from '@midwayjs/mock';
- import { Framework, Application } from '@midwayjs/serverless-app';
+ import { Framework, Application } from '@midwayjs/faas';
```



## 5、部署方式的变化

不再使用 `midway-bin deploy` 进行部署，将采用平台自己的 CLI 工具，Midway 只提供框架和本地开发能力。
