# Information

Midway 提供了 info 组件，用于展示应用的基本信息，方便排查问题。

相关信息：

| 描述                 |      |
| -------------------- | ---- |
| 可作为主框架独立使用 | ❌    |
| 包含自定义日志       | ❌    |
| 可独立添加中间件     | ❌    |



## 安装依赖

```bash
$ npm i @midwayjs/info --save
```



## 使用组件

将 info 组件配置到代码中。

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as info from '@midwayjs/info';

@Configuration({
  imports: [
    koa,
    info
  ]
})
export class AutoConfiguration {
  //...
}
```

在有些情况下，为了不想让应用信息透出，我们指定在特殊环境下生效。

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as info from '@midwayjs/info';

@Configuration({
  imports: [
    koa,
    {
      component: info,
      enabledEnvironment: ['local'],	// 只在本地启用
    }
  ]
})
export class AutoConfiguration {
  //...
}
```



## 查看信息

在默认情况下，info 组件会为 Http 场景自动添加一个中间件，我们可以通过 `/_info` 来访问。

默认情况下，会展示系统，进程，以及配置等关键信息。

效果如下：

![info](https://img.alicdn.com/imgextra/i3/O1CN01TCkSvr28x8T7gtnCl_!!6000000007998-2-tps-797-1106.png)



## 修改访问路由

为了安全，我们可以调整访问的路由。

```typescript
// src/config/config.default.ts

export const info = {
  infoPath: '/_my_info',
};
```



## 隐藏信息

默认情况下，info 组件会隐藏秘钥等信息。我们可以配置增减隐藏的关键字，这个配置会对 **环境变量** 以及 **多环境配置** 生效。

关键字可以使用通配符，比如增加一些关键字。

```typescript
// src/config/config.default.ts
import { DefaultHiddenKey } from '@midwayjs/info';

export const info = {
  hiddenKey: DefaultHiddenKey.concat(['*abc', '*def', '*bbb*']),
};
```

