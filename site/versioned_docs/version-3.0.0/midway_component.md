# 使用组件

组件是 Midway 的扩展机制，我们会将复用的业务代码，或者逻辑，抽象的公共的能力开发成组件，使得这些代码能够在所有的 Midway 场景下复用。



## 启用组件

组件一般以 npm 包形式进行复用。每个组件都是一个可以被直接 `require` 的代码包。我们以 `@midwayjs/validate` 组件为例。

首先，在应用中加入依赖。

```json
// package.json
{
  "dependencies": {
    "@midwayjs/validate": "^3.0.0"
  }
}
```

我们需要在代码中启用这个组件，Midway 的组件加载能力设计在 `src/configuration.ts` 文件中。

```typescript
// 应用或者函数的 src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as validate from '@midwayjs/validate';

@Configuration({
  imports: [validate],
})
export class MainConfiguration {}
```



## 不同环境启用组件

有时候，我们需要在特殊环境下才使用组件，比如本地开发时。 `imports` 属性可以传入对象数组，我们可以在对象中针对组件启用的环境进行配置。

比如常用的 `info` 组件，为了安全考虑，我们就可以只让他在本地环境启用。

```typescript
// 应用或者函数的 src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as info from '@midwayjs/info';

@Configuration({
  imports: [
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
})
export class MainConfiguration {}
```

- `component` 用于指定组件对象，组件对象必须包含一个 `Configuration` 导出的属性
- `enabledEnvironment` 组件启用的环境数组



## 开发组件

参见文档：[组件开发](component_development)。
