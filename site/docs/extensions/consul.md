# Consul

consul 用于微服务下的服务治理，主要特点有：服务发现、服务配置、健康检查、键值存储、安全服务通信、多数据中心等。

本文基于最新组件实现，介绍 Consul 客户端的配置与使用，以及统一抽象的服务发现能力。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ❌    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |

从 v4 开始 Consul 组件基于 Service Factory 进行了重构，API 有着非常大的变化，并提供了服务发现等抽象能力。

感谢 [boostbob](https://github.com/boostbob) 提供的组件。


效果如下图：
![image.png](https://img.alicdn.com/imgextra/i3/O1CN01e5cFZx1I0draeZynr_!!6000000000831-2-tps-1500-471.png)

![image.png](https://img.alicdn.com/imgextra/i2/O1CN01iLYF8r1HQ0B3b47Fh_!!6000000000751-2-tps-1500-895.png)


## 安装组件

首先安装 Consul 组件：

```bash
$ npm i @midwayjs/consul@4 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/consul": "^4.0.0",
    // ...
  },
}
```



## 引入组件

```typescript
import { Configuration } from '@midwayjs/core';
import * as consul from '@midwayjs/consul';
import { join } from 'path';

@Configuration({
  imports: [consul],
  importConfigs: [join(__dirname, 'config')]
})
export class MainConfiguration {}
```



## 配置客户端

支持单客户端与多客户端，遵循 ServiceFactory 配置结构。

**单客户端**

```typescript
// src/config/config.default.ts
export default {
  consul: {
    client: {
      host: '127.0.0.1',
      port: '8500'
    }
  }
}
```

**多客户端**

```typescript
// src/config/config.default.ts
export default {
  consul: {
    clients: {
      a: { host: '127.0.0.1', port: '8500' },
      b: { host: '127.0.0.1', port: '8501' }
    },
    defaultClientName: 'a'
  }
}
```

**使用默认实例**

`ConsulService` 作为默认实例代理，直接暴露原生 Consul 客户端方法。

```typescript
import { Provide, Inject } from '@midwayjs/core';
import { ConsulService } from '@midwayjs/consul';

@Provide()
export class UserService {
  @Inject()
  consul: ConsulService;

  async register() {
     await this.consul.kv.set('name', 'juhai');
  }
}
```



**获取指定实例**

通过 `ConsulServiceFactory` 获取指定命名的客户端实例。

```typescript
import { Provide, Inject } from '@midwayjs/core';
import { ConsulServiceFactory } from '@midwayjs/consul';

@Provide()
export class UserService {
  @Inject()
  consulFactory: ConsulServiceFactory;

  async invoke() {
    const consulA = this.consulFactory.get('a');
    const consulB = this.consulFactory.get('b');
    await consulA.agent.service.register({ name: 'svc-a', id: 'svc-a-1' });
    await consulB.agent.service.register({ name: 'svc-b', id: 'svc-b-1' });
  }
}
```





## 服务发现

从 v4 开始提供基于统一抽象的服务发现能力，Consul 将成为服务发现的客户端来使用。

服务发现包括 **注册服务** 和 **获取服务** 两部分。



### 配置服务发现

你需要先配置一个客户端，如果配置了多个，可以使用 `serviceDiscoveryClient` 来指定。

通过 `serviceDiscovery` 来配置服务发现。

```typescript
// src/config/config.default.ts
export default {
  consul: {
    clients: {
      default: { host: '127.0.0.1', port: '8500' },
    },
    serviceDiscovery: {
      // ...
    }
  }
}
```



### 注册服务发现

当服务启动后，你可以将当前的服务注册到 Consul 注册中心。

```typescript
import { Configuration, Inject } from '@midwayjs/core';
import { ConsulServiceDiscovery } from '@midwayjs/consul';
import { LoadBalancerType } from '@midwayjs/core';

@Configuration({
  // ...
})
export class MainConfiguration {
  @Inject()
  consulDiscovery: ConsulServiceDiscovery;

  async onServerReady() {
    // 创建一个服务发现客户端
    const client = this.consulDiscovery.createClient();

    // 注册当前服务
    await client.register({
      id: client.defaultMeta.id,
      name: 'order',
      tags: ['test'],
      address: client.defaultMeta.host,
      port: 7001,
      meta: {
        version: '1.0.0'
      },
      check: {
        name: 'TTL Health Check',
        timeout: '30s',
        ttl: '10s'
      }
    });
  }
}
```

`register` 方法需要传递一些基础的信息。

最重要的有 id，name，以及 address。

```typescript
interface RegisterOptions extends CommonOptions {
  name: string;
  id?: string;
  tags?: string[];
  address?: string;
  taggedaddresses?: Record<string, any>;
  meta?: Record<string, string>;
  namespace?: string;
  port?: number;
  kind?: string;
  proxy?: any;
  connect?: RegisterConnect;
  check?: CheckOptions;
  checks?: CheckOptions[];
}
```

`client.defaultMeta` 提供了一些默认生成的数据，包括 id，serviceName, host。



### 获取可用服务

你可以在任意需要的地方，动态获取到一个服务来调用。

````typescript
@Provide()
export class OrderService {
  
  @Inject()
  consulDiscovery: ConsulServiceDiscovery;
  
  async getSerivce() {
  	const instance = await this.consulDiscovery.getInstance({ service: 'order'});
    // instance.name
  }
}
````

返回的 instance 类型为 `ConsulHealthItem`，结构如下。

```typescript
export interface ConsulHealthItem {
  Node: {
    ID: string;
    Node: string;
    Address: string;
    Datacenter: string;
    TaggedAddresses: Record<string, any>;
    Meta: Record<string, any>;
    CreateIndex: number;
    ModifyIndex: number;
  };
  Service: {
    ID: string;
    Service: string;
    Tags: string[];
    Address: string;
    TaggedAddresses: Record<string, any>;
    Meta: Record<string, any>;
    Port: number;
    Weights: Record<string, any>;
    EnableTagOverride: boolean;
    Proxy: Record<string, any>;
    Connect: Record<string, any>;
    PeerName: string;
    CreateIndex: number;
    ModifyIndex: number;
  };
  Checks: Array<{
    Node: string;
    CheckID: string;
    Name: string;
    Status: 'passing' | 'warning' | 'critical';
    Notes: string;
    Output: string;
    ServiceID: string;
    ServiceName: string;
    ServiceTags: string[];
    Type: string;
    Interval: string;
    Timeout: string;
    ExposedPort: number;
    Definition: Record<string, any>;
    CreateIndex: number;
    ModifyIndex: number;
  }>;
}

```



## 配置中心


同时 consul 也能作为一个服务配置的地方，如下代码：

```typescript
import { Controller, Get, Inject } from '@midwayjs/core';
import { ConsulService } from '@midwayjs/consul';

@Controller('/')
export class HomeController {

  @Inject()
  consul: ConsulService;

  @Get('/')
  async home() {
    await this.consul.kv.set('name', 'juhai');
    const res = await this.consul.kv.get('name');
    return res;
  }
}

```

我们调用 `kv.set` 方法，我们可以设置对应的配置，通过 `kv.get`  方法可以拿到对应的配置。


注意：在代码中，有同学出现，在每次请求中去 get 对应的配置，这时你的 QPS 多少对 Consul server 的压力。


所以在QPS比较大的情况，可以如下处理：

```typescript
import { Init, Inject, Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { ConsulService } from '@midwayjs/consul';

@Provide()
@Scope(ScopeEnum.Singleton)
export class ConfigService {

  @Inject()
  consul: ConsulService;

  config: any;

  @Init()
  async init() {
    setInterval(async () => {
      this.config = await this.consul.kv.get('name');
    }, 5000);
    this.config = await this.consul.kv.get('name');
  }

  async getConfig(){
    return this.config;
  }
}

```

上面的代码，相当于定时去获取对应的配置，当每个请求进来的时候，获取 Scope 为 ScopeEnum.Singleton 服务的 `getConfig` 方法，这样每 5s 一次获取请求，就减少了对服务的压力。

Consul 界面上如下图：

![image.png](https://img.alicdn.com/imgextra/i4/O1CN01V3P6uK1rIVs19JiWn_!!6000000005608-2-tps-1500-374.png)

![image.png](https://img.alicdn.com/imgextra/i2/O1CN014O2GyH1sMvIhmlbs4_!!6000000005753-2-tps-1500-667.png)


一共提供如下几种方法：

- [get](https://www.npmjs.com/package/consul#kv-get)，获取对应key的value
- [keys](https://www.npmjs.com/package/consul#kv-keys)，查询某个prefix的key的列表
- [set](https://www.npmjs.com/package/consul#kv-set)，设置对应的key的值
- [del](https://www.npmjs.com/package/consul#kv-del)，删除对应的key


