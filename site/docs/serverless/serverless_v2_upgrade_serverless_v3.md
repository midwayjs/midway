# 从 Serverless v2 迁移到 v3

基于 Midway 升级到 v3 的缘故，Serverless 体系也同步升级到了 v3 版本。

本文章介绍如何从 Serverless v2.0 迁移到 Serverless v3.0，和传统应用升级非常的类似。

:::caution

v3 版本的函数我们仍在调整，主要为部署生成的入口部分和测试部分，用户代码应该不会变动。

:::

## 手动升级

**midway v3 支持从 node v12 起，所以相关函数的容器环境，必须选择 node.js v12 以上的版本。**

### 1、项目包版本的升级

依赖包升级，相关包升级为 3.0。

```json
{
  "dependencies": {
    "@midwayjs/core": "^3.0.0",
    "@midwayjs/decorator": "^3.0.0",
  	"@midwayjs/faas": "^3.0.0"
  },
  "devDependencies": {
    "@midwayjs/cli": "^1.2.45",
    "@midwayjs/mock": "^3.0.0",
    "@midwayjs/serverless-app": "^3.0.0",
    // ...
  }
}
```



### 2、入口主框架的变化

比如提供 faas 作为主框架。

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

:::tip

由于还在调整，当前的修改项不一定完整，有顾虑的用户暂时不要使用 v3 的函数。

:::
