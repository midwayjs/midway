# ETCD

etcd 是云原生架构中重要的基础组件，由 CNCF 孵化托管。etcd 在微服务和 Kubernates 集群中可以作为服务注册于发现，也可以作为 key-value 存储的中间件。

Midway 提供基于 [etcd3](https://github.com/microsoft/etcd3) 模块封装的组件，提供 etcd 的客户端调用能力。

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
$ npm i @midwayjs/etcd@4 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/etcd": "^4.0.0",
    // ...
  },
}
```




## 引入组件


首先，引入 组件，在 `configuration.ts` 中导入：

```typescript
import { Configuration } from '@midwayjs/core';
import * as etcd from '@midwayjs/etcd';
import { join } from 'path'

@Configuration({
  imports: [
    // ...
    etcd,
  ],
  // ...
})
export class MainConfiguration {
}
```



## 配置默认客户端

大部分情况下，我们可以只使用默认客户端来完成功能。

```typescript
// src/config/config.default.ts
export default {
  // ...
  etcd: {
    client: {
      host: [
        '127.0.0.1:2379'
      ]
    },
  },
}
```



## 使用默认客户端

配置完成后，我们就可以在代码中使用了。

```typescript
import { Provide } from '@midwayjs/core';
import { ETCDService } from '@midwayjs/etcd';
import { join } from 'path';

@Provide()
export class UserService {

  @Inject()
  etcdService: ETCDService;

  async invoke() {

    await this.etcdService.put('foo').value('bar');

    const fooValue = await this.etcdService.get('foo').string();
    console.log('foo was:', fooValue);

    const allFValues = await this.etcdService.getAll().prefix('f').keys();
    console.log('all our keys starting with "f":', allFValues);

    await this.etcdService.delete().all();
  }
}
```

更多 API 请参考 ts 定义或者 [官网文档](https://microsoft.github.io/etcd3/classes/etcd3.html)。



## 多实例配置

```typescript
// src/config/config.default.ts
export default {
  // ...
  etcd: {
    clients: {
      instance1: {
        {
          host: [
            '127.0.0.1:2379'
          ]
        },
      },
  		instance2: {
        {
          host: [
            '127.0.0.1:2379'
          ]
        },
      }
    }
  },
}
```



## 多实例获取

```typescript
import { Provide } from '@midwayjs/core';
import { ETCDServiceFactory } from '@midwayjs/etcd';
import { join } from 'path';

@Provide()
export class UserService {

  @Inject()
  etcdServiceFactory: ETCDServiceFactory;

  async invoke() {
    const instance1 = this.etcdServiceFactory.get('instance1');
    // ...

    const instance2 = this.etcdServiceFactory.get('instance2');
    // ...
  }
}
```



## 动态创建实例

```typescript
import { Provide } from '@midwayjs/core';
import { ETCDServiceFactory } from '@midwayjs/etcd';
import { join } from 'path';

@Provide()
export class UserService {

  @Inject()
  etcdServiceFactory: ETCDServiceFactory;

  async invoke() {
    const instance3 = await this.etcdServiceFactory.createInstance({
      host: [
        '127.0.0.1:2379'
      ]
    }, 'instance3');
    // ...
  }
}
```



## 服务发现

从 v4 开始提供基于统一抽象的服务发现能力，虽然 ETCD 并不太适合作为服务发现的注册中心来使用，但是我们仍实现了 ETCD 作为服务发现的客户端能力。

服务发现包括 **注册服务** 和 **获取服务** 两部分。


### 配置服务发现

你需要先配置一个客户端；若存在多个客户端，可通过 `serviceDiscoveryClient` 指定用于服务发现的客户端。

通过 `serviceDiscovery` 配置服务发现选项：

```typescript
// src/config/config.default.ts
export default {
  etcd: {
    clients: {
      default: { hosts: ['127.0.0.1:2379'] }
    },
    serviceDiscovery: {
      namespace: 'services',
      ttl: 30,
      // 可选：loadBalancer: LoadBalancerType.ROUND_ROBIN
    }
  }
}
```

说明：`namespace` 为键空间前缀，实例键结构为 `namespace/serviceName/instanceId`；`ttl` 为实例过期时间（秒）。


### 注册服务发现

服务启动后，将当前服务注册到 ETCD：

```typescript
import { Configuration, Inject } from '@midwayjs/core';
import { EtcdServiceDiscovery } from '@midwayjs/etcd';

@Configuration({})
export class MainConfiguration {
  @Inject()
  etcdDiscovery: EtcdServiceDiscovery;

  async onServerReady() {
    // 创建服务发现客户端（可传入覆盖项）
    const client = this.etcdDiscovery.createClient();

    // 注册当前服务并上线（写入键并绑定租约）
    await client.register({
      id: client.defaultMeta.id,
      serviceName: 'order',
      ttl: 30,
      meta: {
        version: '1.0.0',
        host: client.defaultMeta.host,
        port: '7001'
      }
    });
  }
}
```

说明：注册时会默认上线，无需显式调用 `online`。ETCD 通过 Lease 维持 TTL，定时续约保证存活；`offline` 删除键并撤销租约；`deregister` 注销并清理状态。重复调用 `register/online/offline/deregister` 具有幂等性。


### 获取可用服务

在任意位置获取可用实例或按负载均衡选择一个实例：

````typescript
@Provide()
export class OrderService {
  @Inject()
  etcdDiscovery: EtcdServiceDiscovery;

  async getService() {
    const instances = await this.etcdDiscovery.getInstances('order');
    const one = await this.etcdDiscovery.getInstance('order');
    return { instances, one };
  }
}
````

返回的实例为注册时写入的对象（`EtcdInstanceMetadata`），通常包含 `serviceName/id/ttl/meta/tags/status` 等字段。
