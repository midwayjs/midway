# 角色鉴权

Casbin 是一个强大的、高效的开源访问控制框架，其权限管理机制支持多种访问控制模型。

官网文档：https://casbin.org/



## Casbin 是什么

Casbin 可以：

1. 支持自定义请求的格式，默认的请求格式为`{subject, object, action}`。
2. 具有访问控制模型model和策略policy两个核心概念。
3. 支持RBAC中的多层角色继承，不止主体可以有角色，资源也可以具有角色。
4. 支持内置的超级用户 例如：`root` 或 `administrator`。超级用户可以执行任何操作而无需显式的权限声明。
5. 支持多种内置的操作符，如 `keyMatch`，方便对路径式的资源进行管理，如 `/foo/bar` 可以映射到 `/foo*`

Casbin 不能：

1. 身份认证 authentication（即验证用户的用户名和密码），Casbin 只负责访问控制。应该有其他专门的组件负责身份认证，然后由 Casbin 进行访问控制，二者是相互配合的关系。
2. 管理用户列表或角色列表。 Casbin 认为由项目自身来管理用户、角色列表更为合适， 用户通常有他们的密码，但是 Casbin 的设计思想并不是把它作为一个存储密码的容器。 而是存储RBAC方案中用户和角色之间的映射关系。

:::tip

注意：

- 1、在 Midway v3.6.0 之后可用
- 2、Midway 只是封装了 Casbin 的 API 并提供简单的支持，策略规则编写请查看 [官方文档](https://casbin.org/)
- 3、Casbin 不提供登录，只提供现有用户的鉴权，需要搭配 passport 等获取用户信息的组件来使用

:::



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
$ npm i @midwayjs/casbin@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/casbin": "^3.0.0",
    // ...
  },
}
```



## 启用组件


首先，引入组件，在 `configuration.ts` 中导入：

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as casbin from '@midwayjs/casbin';
import { join } from 'path'

@Configuration({
  imports: [
    // ...
    casbin,
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```



## 准备模型和策略

使用 Casbin 前需要定义模型和策略，这两个文件的内容贯穿本文，建议先去官网了解相关内容。

我们以一个基础的模型为例，比如：

```
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _
g2 = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && g2(r.obj, p.obj) && r.act == p.act || r.sub == "root"
```

将其保存在项目根目录的 `basic_model.conf` 文件中。

以及包含下面内容的策略文件。

```
p, superuser, user, read:any
p, manager, user_roles, read:any
p, guest, user, read:own

g, alice, superuser
g, bob, guest
g, tom, manager

g, users_list, user
g, user_roles, user
g, user_permissions, user
g, roles_list, role
g, role_permissions, role
```

将其保存在项目根目录的 `basic_policy.conf` 文件中。



## 配置模型和策略

这里我们的策略将以文件形式进行演示。

配置如下：

```typescript
import { MidwayAppInfo } from '@midwayjs/core';
import { join } from 'path';

export default (appInfo: MidwayAppInfo) => {
  return {
    // ...
    casbin: {
      modelPath: join(appInfo.appDir, 'basic_model.conf'),
      policyAdapter: join(appInfo.appDir, 'basic_policy.csv'),
    }
  };
}

```



## 装饰器鉴权

有多种形式来使用 Casbin，这里以装饰器作为示例。

### 定义资源

首先定义资源，比如放在 `src/resource.ts` 文件中，对应策略文件中对应的资源。

```typescript
export enum Resource {
  USERS_LIST = 'users_list',
  USER_ROLES = 'user_roles',
  USER_PERMISSIONS = 'user_permissions',
  ROLES_LIST = 'roles_list',
  ROLE_PERMISSIONS = 'role_permission',
}
```



### 配置获取用户的方式

在使用装饰器鉴权时，我们需要配置一个获取用户的方式，比如在 passport 组件之后，我们会从 `ctx.user` 上获取用户名。

```typescript
import { MidwayAppInfo } from '@midwayjs/core';
import { join } from 'path';

export default (appInfo: MidwayAppInfo) => {
  return {
    // ...
    casbin: {
      modelPath: join(appInfo.appDir, 'basic_model.conf'),
      policyAdapter: join(appInfo.appDir, 'basic_policy.csv'),
      usernameFromContext: (ctx) => {
        return ctx.user;
      }
    }
  };
}

```



### 增加守卫

装饰器鉴权依赖守卫，我们可以在全局或者某些路由上开启，全局守卫使用请参考守卫章节。

比如，我们只在下面的 `findAllUsers` 方法上开启鉴权，`AuthGuard` 是 `@midwayjs/casbin` 提供的守卫，可以直接使用。

```typescript
import { Controller, Get, UseGuard } from '@midwayjs/decorator';
import { AuthGuard } from '@midwayjs/casbin';
import { Resource } from './resouce';

@Controller('/')
export class HomeController {

  @UseGuard(AuthGuard)
  @Get('/users')
  async findAllUsers() {
    // ...
  }
}
```



### 定义权限

使用 `UsePermission` 装饰器定义路由需要的权限。

```typescript
import { Controller, Get, UseGuard } from '@midwayjs/decorator';
import { AuthActionVerb, AuthGuard, AuthPossession, UsePermission } from '@midwayjs/casbin';
import { Resource } from './resouce';

@Controller('/')
export class HomeController {

  @UseGuard(AuthGuard)
  @UsePermission({
    action: AuthActionVerb.READ,
    resource: Resource.USER_ROLES,
    possession: AuthPossession.ANY
  })
  @Get('/users')
  async findAllUsers() {
    // ...
  }
}
```

没有权限读取 `USER_ROLES` 的用户不能调用 findAllUsers 方法，在请求时会返回 403 状态码。

比如，上面的 `bob` 用户访问则会返回 403， 而 `tom` 用户访问则正常返回。



`UsePermission` 需要提供一个对象参数，包括 `action`、`resource`、`possession` 和一个可选的 `isOwn` 的对象。

- `action` 是一个 `AuthActionVerb` 枚举，包含读，写等操作
- `resource` 资源字符串
- `possession` 是一个 `AuthPossession` 枚举
- `isOwn` 是一个接受`Context`（守卫 `canActivate`的参数）作为唯一参数并返回布尔值的函数。 `AuthZGuard` 使用它来确定用户是否是资源的所有者。 如果未定义，将使用返回 `false` 的默认函数。

可以同时定义多个权限，但只有当所有权限都满足时，才能访问该路由。 

比如：

```typescript
@UsePermissions({
  action: AuthActionVerb.READ,
  resource: 'USER_ADDRESS',
  possession: AuthPossession.ANY
}, {
  action; AuthActionVerb.READ,
  resource: 'USER_ROLES,
  possession: AuthPossession.ANY
})
```

只有当用户被授予读取 `USER_ADDRESS` 和 `USER_ROLES` 这两个权限时，才能访问该路由。



## API 鉴权

Casbin 本身提供了一些通用的 API 和权限相关的功能。

我们可以通过直接注入 `CasbinEnforcerService` 服务来使用。

比如，我们可以在守卫或者中间件中编码。

```typescript
import { CasbinEnforcerService } from '@midwayjs/casbin';
import { Guard, IGuard } from '@midwayjs/core';

@Guard()
export class UserGuard extends IGuard {
  
  @Inject()
  casbinEnforcerService: CasbinEnforcerService;
  
  async canActivate(ctx, clz, methodName) {
    // 用户登录了，并且是特定的方法，则检查权限
    if (ctx.user && methodName === 'findAllUsers') {
      return await this.casbinEnforcerService.enforce(ctx.user, 'USER_ROLES', 'read');
    }
    // 未登录用户不允许访问
    return false;
  }
}
```

在启用守卫后，效果和上面的装饰器相同。

此外，`CasbinEnforcerService` 还有更多的 API，比如重新加载策略。

```typescript
await this.casbinEnforcerService.loadPolicy();
```



## 分布式策略存储

在多台机器部署的场景下，需要将策略存储到外部。

当前已经实现的适配器有：

- Redis
- Typeorm



### Redis Adapter

需要依赖 `@midwayjs/casbin-redis-adapter` 包和 redis 组件。

```bash
$ npm i @midwayjs/casbin-redis-adapter @midwayjs/redis --save
```

启用 redis 组件。

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as redis from '@midwayjs/redis';
import * as casbin from '@midwayjs/casbin';
import { join } from 'path';

@Configuration({
  imports: [
    // ...
    redis,
    casbin,
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```

配置 redis 连接和 casbin 适配器。

```typescript
import { MidwayAppInfo } from '@midwayjs/core';
import { join } from 'path';
import { createAdapter } from '@midwayjs/casbin-redis-adapter';

export default (appInfo: MidwayAppInfo) => {
  return {
    // ...
    redis: {
      clients: {
        // 为 casbin 定义了一个连接
        'node-casbin-official': {
          host: '127.0.0.1',
          port: 6379,
          password: '',
          db: '0',
        }
      }
    },
    casbin: {
      policyAdapter: createAdapter({
        // 配置了上面的连接名
        clientName: 'node-casbin-official'
      }),
      // ...
    },
  };
}

```



### TypeORM Adapter

需要依赖 `@midwayjs/casbin-typeorm-adapter` 包和 typeorm 组件。

```
$ npm i @midwayjs/casbin-typeorm-adapter @midwayjs/typeorm --save
```

启用 typeorm 组件。

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as typeorm from '@midwayjs/typeorm';
import * as casbin from '@midwayjs/casbin';
import { join } from 'path';

@Configuration({
  imports: [
    // ...
    typeorm,
    casbin,
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```

配置适配器，下面以 sqlite 存储为例，mysql 的配置可以查看 typeorm 组件。

```typescript
import { MidwayAppInfo } from '@midwayjs/core';
import { join } from 'path';
import { CasbinRule, createAdapter } from '@midwayjs/casbin-typeorm-adapter';

export default (appInfo: MidwayAppInfo) => {
  return {
    // ...
    typeorm: {
      dataSource: {
        // 为 casbin 定义了一个连接
        'node-casbin-official': {
          type: 'sqlite',
          synchronize: true,
          database: join(appInfo.appDir, 'casbin.sqlite'),
          // 注意这里显式引入了 Entity
          entities: [CasbinRule],
        }
      }
    },
    casbin: {
      policyAdapter: createAdapter({
        // 配置了上面的连接名
        dataSourceName: 'node-casbin-official'
      }),
      // ...
    }
  };
}
```



## 监视器

使用分布式消息系统，例如 [etcd](https://github.com/coreos/etcd) 来保持多个Casbin执行器实例之间的一致性。 因此，我们的用户可以同时使用多个Casbin 执行器来处理大量的权限检查请求。

Midway 当前只提供一种 Redis 更新策略，如有其他需求，可以给我们提交 issue。

### Redis Watcher

需要依赖 `@midwayjs/casbin-redis-adapter` 包和 redis 组件。

```bash
$ npm i @midwayjs/casbin-redis-adapter @midwayjs/redis --save
```

启用 redis 组件。

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as redis from '@midwayjs/redis';
import * as casbin from '@midwayjs/casbin';
import { join } from 'path';

@Configuration({
  imports: [
    // ...
    redis,
    casbin,
  ],
  // ...
})
export class MainConfiguration {
}
```

使用示例：

```typescript
import { MidwayAppInfo } from '@midwayjs/core';
import { join } from 'path';
import { createAdapter, createWatcher } from '@midwayjs/casbin-redis-adapter';

export default (appInfo: MidwayAppInfo) => {
  return {
    // ...
    redis: {
      clients: {
        'node-casbin-official': {
          host: '127.0.0.1',
          port: 6379,
          db: '0',
        },
        'node-casbin-sub': {
          host: '127.0.0.1',
          port: 6379,
          db: '0',
        }
      }
    },
    casbin: {
      // ...
      policyAdapter: createAdapter({
        clientName: 'node-casbin-official'
      }),
      policyWatcher: createWatcher({
        pubClientName: 'node-casbin-official',
        subClientName: 'node-casbin-sub',
      })
    },
  };
}
```

注意，pub/sub 连接需要不同的客户端，上面代码定义了两个客户端。

pub 客户端可以和普通 Redis 客户端连接复用，而 sub 需要一个独立的客户端。
