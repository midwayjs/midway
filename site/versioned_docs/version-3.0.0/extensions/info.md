# 信息查看

Midway 提供了 info 组件，用于展示应用的基本信息，方便排查问题。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ✅    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |


## 安装依赖

```bash
$ npm i @midwayjs/info@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/info": "^3.0.0",
    // ...
  },
}
```



## 使用组件

将 info 组件配置到代码中。

```typescript
import { Configuration } from '@midwayjs/core';
import * as info from '@midwayjs/info';

@Configuration({
  imports: [
    // ...
    info
  ]
})
export class MainConfiguration {
  //...
}
```

在有些情况下，为了不想让应用信息透出，我们指定在特殊环境下生效。

```typescript
import { Configuration } from '@midwayjs/core';
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
export class MainConfiguration {
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
export default {
  // ...
  info: {
    infoPath: '/_my_info',
  }
}
```



## 隐藏信息

默认情况下，info 组件会隐藏秘钥等信息。我们可以配置增减隐藏的关键字，这个配置会对 **环境变量** 以及 **多环境配置** 生效。

关键字可以使用通配符，比如增加一些关键字。

```typescript
// src/config/config.default.ts
import { DefaultHiddenKey } from '@midwayjs/info';

export default {
  // ...
  info: {
    hiddenKey: DefaultHiddenKey.concat(['*abc', '*def', '*bbb*']),
  }
}
```



## 调用 API

info 组件默认提供了 `InfoService` 用于在非 Http 或是自定义的场景来使用。

比如：

```typescript
import { Provide } from '@midwayjs/core';
import { InfoService } from '@midwayjs/info';

@Provide()
export class userService {

  @Inject()
  inforService: InfoService

  async getInfo() {
    // 应用信息，应用名等
    this.inforService.projectInfo();
    // 系统信息
    this.inforService.systemInfo();
    // 堆内存，cpu 等
    this.inforService.resourceOccupationInfo();
    // midway 框架的信息
    this.inforService.softwareInfo();
    // 当前使用的环境配置
    this.inforService.midwayConfig();
    // 依赖注入容器中的服务
    this.inforService.midwayService();
    // 系统时间，时区，启动时常
    this.inforService.timeInfo();
    // 环境变量
    this.inforService.envInfo();
    // 依赖信息
    this.inforService.dependenciesInfo();
    // 网络信息
    this.inforService.networkInfo();
  }
}
```

