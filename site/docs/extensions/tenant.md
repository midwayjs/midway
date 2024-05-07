# 租户

这里介绍如何快速在 Midway 中使用租户组件。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ✅    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |



## 租户定义

租户管理是中后台业务开发过程中经常需要的功能。

在开发中，不同的用户需要保存在不同的数据源、命名空间或是区域中，这些不同的数据区域我们统称为 “租户”。



## 安装依赖

`@midwayjs/tenant` 是主要的功能包。

```bash
$ npm i @midwayjs/tenant@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/tenant": "^3.0.0",
    // ...
  }
}
```




## 引入组件


首先，引入 组件，在 `src/configuration.ts` 中导入：

```typescript
import { Configuration } from '@midwayjs/core';
import * as tenant from '@midwayjs/tenant';

@Configuration({
  imports: [
    // ...
    tenant,
  ],
})
export class MainConfiguration {
}
```



## 租户信息存取

不同的租户数据相互隔离，一般来说，每个用户数据都会关联相关的租户信息，在用户认证拿到用户信息之后，获取其对应的租户数据，以便后续数据读写使用。

在 Midway 中，可以将租户数据保存在请求对象 ctx 中，后续的所有请求作用域对象可以使用。但是租户信息仅仅在请求链路中使用是不够的，需要在不同的作用域都生效，这就需要新的架构来支持。

组件提供了一个 `TenantManager` 来管理租户信息。

你需要在每个请求链路中保存租户信息，之后才能获取。

租户信息的格式可以按需求定义。

比如：

```typescript
interface TenantInfo {
  id: string;
  name: string;
}
```

比如，在中间件中保存。

```typescript
import { TenantManager } from '@midwayjs/tenant';
import { Middleware, Inject } from '@midwayjs/core';

@Middleware()
class TenantMiddleware {
  @Inject()
  tenantManager: tenant.TenantManager;

  resolve() {
    return async(ctx, next) => {
      // 请求链路中设置租户信息
      this.tenantManager.setCurrentTenant({
        id: '123',
        name: '我的租户'
      });
    }
  }
}
```

在后续的单例服务中获取。

```typescript
import { TenantManager } from '@midwayjs/tenant';
import { Inject, Singleton } from '@midwayjs/core';
import { TenantInfo } from '../interface';

@Singleton()
class TenantService {
  @Inject()
  tenantManager: tenant.TenantManager;

  async getTenantInfo() {
    const tenantInfo = await this.tenantManager.getCurrentTenant<TenantInfo>();
    if (tenantInfo) {
      console.log(tenantInfo.name);
    	// output => 我的租户
    }
  }
}
```



:::tip

* 1、租户信息一定会关联请求，如有需求，你可以在不同的 Framework 中都加入中间件
* 2、每个请求保存的租户信息是隔离的
* 3、不管是单例还是请求作用域，你都仅能获取到当前请求对应的租户数据

:::
