# Role authentication

Casbin is a powerful and efficient open source access control framework, and its rights management mechanism supports multiple access control models.

Official website document: https://casbin.org/



## What is Casbin

Casbin can:

1. supports custom request formats. the default request format is `{subject, object, action}`.
2. It has two core concepts: access control model model and policy policy.
3. Support multi-layer role inheritance in RBAC, not only the main body can have roles, resources can also have roles.
4. Supports built-in superusers such as `root` or `administrator`. Super users can perform any operation without an explicit permission declaration.
5. Supports a variety of built-in operators, such as `keyMatch`, to facilitate the management of path-based resources, such as `/foo/bar`, which can be mapped to `/foo *`

Casbin cannot:

1. For authentication authentication (that is, to verify the user's user name and password),Casbin is only responsible for access control. There should be other specialized components responsible for identity authentication, and then Casbin will perform access control. The two are in a coordinated relationship.
2. Manage user lists or role lists.  Casbin believes that it is more appropriate to manage the list of users and roles by the project itself. Users usually have their passwords, but Casbin's design idea is not to use it as a container for storing passwords.  Instead, it stores the mapping relationship between users and roles in the RBAC scheme.

:::tip

Note:

- 1. Available after Midway v3.6.0
- 2. Midway only encapsulates the Casbin API and provides simple support. For more information about how to write policy rules, see [Official documentation](https://casbin.org/).
- 3. Casbin does not provide login, but only provides authentication for existing users. It needs to be used with components such as passport to obtain user information.

:::



Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |



## Installation dependency

```bash
$ npm i @midwayjs/casbin@3 --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/casbin": "^3.0.0",
    // ...
  },
}
```



## Enable components


First, introduce components and import them in `configuration.ts`:

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as casbin from '@midwayjs/casbin';
import { join } from 'path'

@Configuration({
  imports: [
    // ...
    casbin
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```



## Prepare models and strategies

Before using Casbin, you need to define the model and policy. The contents of these two files run through this article. It is recommended to go to the official website to learn about the relevant contents.

Let's take a basic model as an example, such:

```
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _,_
g2 = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && g2(r.obj, p.obj) && r.act == p.act || r.sub == "root"
```

Save it in the `basic_model.conf` file in the project root directory.

and a policy file containing the following.

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

Save it in the `basic_policy.conf` file in the project root directory.



## Configure models and policies

Here our strategy will be demonstrated in file form.

The configuration is as follows:

```typescript
import { MidwayAppInfo } from '@midwayjs/core';
import { join } from 'path';

export default (appInfo: MidwayAppInfo) => {
  return {
    // ...
    casbin: {
      modelPath: join(appInfo.appDir, 'basic_model.conf')
      policyAdapter: join(appInfo.appDir, 'basic_policy.csv')
    }
  };
}

```



## Authentication by decorator

There are many forms to use Casbin, here with a decorator as an example.

### Define resources

First, define resources, for example, put them in the `src/resource.ts` file, corresponding to the resources in the policy file.

```typescript
export enum Resource {
  USERS_LIST = 'users_list',
  USER_ROLES = 'user_roles',
  USER_PERMISSIONS = 'user_permissions',
  ROLES_LIST = 'roles_list',
  ROLE_PERMISSIONS = 'role_permission',
}
```



### Configure how to obtain users

When using decorator authentication, we need to configure a way to obtain users. For example, after passport components, we will obtain the user name from `ctx.user`.

```typescript
import { MidwayAppInfo } from '@midwayjs/core';
import { join } from 'path';

export default (appInfo: MidwayAppInfo) => {
  return {
    // ...
    casbin: {
      modelPath: join(appInfo.appDir, 'basic_model.conf')
      policyAdapter: join(appInfo.appDir, 'basic_policy.csv')
      usernameFromContext: (ctx) => {
        return ctx.user;
      }
    }
  };
}

```



### Add guards

Decorator authentication depends on guards, which can be turned on globally or on some routes. Please refer to the guard section for global guards.

For example, we only enable authentication on the following `findAllUsers` methods, `AuthGuard` the guards provided by `@midwayjs/casbin`, which can be used directly.

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



### Define permissions

Use the `UsePermission` decorator to define the permissions required for routing.

```typescript
import { Controller, Get, UseGuard } from '@midwayjs/decorator';
import { AuthActionVerb, AuthGuard, AuthPossession, UsePermission } from '@midwayjs/casbin';
import { Resource } from './resouce';

@Controller('/')
export class HomeController {

  @UseGuard(AuthGuard)
  @UsePermission({
    action: AuthActionVerb.READ
    resource: Resource.USER_ROLES
    possession: AuthPossession.ANY
  })
  @Get('/users')
  async findAllUsers() {
    // ...
  }
}
```

Users who do not have permission to read `USER_ROLES` cannot call findAllUsers methods and will return 403 status codes when requesting.

For example, the above `bob` user access will return 403, while the `tom` user access will return normally.



`UsePermission` need to provide an object parameter, including `action`, `resource`, `possession`, and an optional `isOwn` object.

- `action` is a `AuthActionVerb` enumeration that includes read and write operations.
- `resource` resource string
- `possession` is a `AuthPossession` enumeration
- `IsOwn` is a function that accepts `Context` (the parameter of the guard `canActivate`) as a unique parameter and returns a boolean value.  `AuthZGuard` use it to determine whether the user is the owner of the resource.  If it is not defined, the default function that returns `false` is used.

Multiple permissions can be defined at the same time, but the route can only be accessed if all permissions are satisfied.

For example:

```typescript
@UsePermissions({
  action: AuthActionVerb.READ
  resource: 'USER_ADDRESS',
  possession: AuthPossession.ANY
}, {
  action; AuthActionVerb.READ
  resource: 'USER_ROLES
  possession: AuthPossession.ANY
})
```

The route can only be accessed if the user is granted the read `USER_ADDRESS` and `USER_ROLES` permissions.



## API authentication

Casbin itself provides some common API and permission-related functions.

We can use it by injecting `CasbinEnforcerService` services directly.

For example, we can code in guards or middleware.

```typescript
import { CasbinEnforcerService } from '@midwayjs/casbin';
import { Guard, IGuard } from '@midwayjs/core';

@Guard()
export class UserGuard extends IGuard {

  @Inject()
  casbinEnforcerService: CasbinEnforcerService;

  async canActivate(ctx, clz, methodName) {
    // If the user is logged in and is a specific method, check the permissions
    if (ctx.user && methodName === 'findAllUsers') {
      return await this.casbinEnforcerService.enforce(ctx.user, 'USER_ROLES', 'read');
    }
    // Unlogged users are not allowed to access
    return false;
  }
}
```

After the guard is enabled, the effect is the same as the decorator above.

In addition, `CasbinEnforcerService` have more APIs, such as reloading policies.

```typescript
await this.casbinEnforcerService.loadPolicy();
```



## Distributed policy storage

In scenarios where multiple machines are deployed, policies need to be stored externally.

Currently implemented adapters are:

- Redis
- Typeorm



### Redis Adapter

You need to rely on the `@midwayjs/casbin-redis-adapter` package and Redis components.

```
$ npm i @midwayjs/casbin-redis-adapter @midwayjs/redis --save
```

enable the redis component.

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as redis from '@midwayjs/redis';
import * as casbin from '@midwayjs/casbin';
import { join } from 'path';

@Configuration({
  imports: [
    // ...
    redis
    casbin
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```

Configure the Redis connection and casbin adapter.

```typescript
import { MidwayAppInfo } from '@midwayjs/core';
import { join } from 'path';
import { createAdapter } from '@midwayjs/casbin-redis-adapter';

export default (appInfo: MidwayAppInfo) => {
  return {
    // ...
    redis: {
      clients: {
        // Defines a connection for casbin
        node-casbin-official ': {
          host: '127.0.0.1',
          port: 6379
          password: '',
          db: '0',
        }
      }
    },
    casbin: {
      policyAdapter: createAdapter({
        // The connection name above is configured
        clientName: 'node-casbin-official'
      }),
      // ...
    },
  };
}

```



### TypeORM Adapter

You need to rely on `@midwayjs/casbin-typeorm-adapter` packages and typeorm components.

```
$ npm i @midwayjs/casbin-typeorm-adapter @midwayjs/typeorm --save
```

Enable typeorm components.

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as typeorm from '@midwayjs/typeorm';
import * as casbin from '@midwayjs/casbin';
import { join } from 'path';

@Configuration({
  imports: [
    // ...
    typeorm
    casbin
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```

Configure the adapter. Take sqlite storage as an example. You can view the typeorm components for mysql configuration.

```typescript
import { MidwayAppInfo } from '@midwayjs/core';
import { join } from 'path';
import { CasbinRule, createAdapter } from '@midwayjs/casbin-typeorm-adapter';

export default (appInfo: MidwayAppInfo) => {
  return {
    // ...
    typeorm: {
      dataSource: {
        // Defines a connection for casbin
        node-casbin-official ': {
          type: 'sqlite',
          synchronize: true
          database: join(appInfo.appDir, 'casbin.sqlite')
          // Note that Entity is explicitly introduced here.
          entities: [CasbinRule]
        }
      }
    },
    casbin: {
      policyAdapter: createAdapter({
        // The connection name above is configured
        dataSourceName: 'node-casbin-official'
      }),
      // ...
    }
  };
}
```



## Monitor

Use a distributed messaging system such as [etcd](https://github.com/coreos/etcd) to maintain consistency across multiple Casbin executor instances. Therefore, our users can use multiple Casbin executors at the same time to handle a large number of permission checking requests.

Midway currently only provides one Redis update strategy. If you have other needs, you can submit an issue to us.

### Redis Watcher

It needs to depend on `@midwayjs/casbin-redis-adapter` package and redis component.

```bash
$ npm i @midwayjs/casbin-redis-adapter @midwayjs/redis --save
```

Enable the redis component.

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

Example usage:

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

Note that pub/sub connections require different clients, the code above defines two clients.

The pub client can be reused with common Redis client connections, while the sub requires an independent client.
