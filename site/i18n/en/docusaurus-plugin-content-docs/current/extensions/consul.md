# Consul

Consul is used for service governance under microservices. Its main features include service discovery, service configuration, health checks, key–value storage, secure service communication, and multi–datacenter support.

This article is based on the latest component implementation. It introduces Consul client configuration and usage, along with the unified abstract service discovery capability.

Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ❌ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |

From v4, the Consul component is refactored based on Service Factory with significant API changes and provides abstract service discovery capabilities.

Thanks to [boostbob](https://github.com/boostbob) for the component.


The effect is as follows:
![image.png](https://img.alicdn.com/imgextra/i3/O1CN01e5cFZx1I0draeZynr_!!6000000000831-2-tps-1500-471.png)

![image.png](https://img.alicdn.com/imgextra/i2/O1CN01iLYF8r1HQ0B3b47Fh_!!6000000000751-2-tps-1500-895.png)


## Install Component

First install the Consul component:

```bash
$ npm i @midwayjs/consul@4 --save
```

Or add the following dependency to `package.json` and reinstall.

```json
{
  "dependencies": {
    "@midwayjs/consul": "^4.0.0",
    // ...
  }
}
```


## Import Component

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


## Configure Client

Supports single-client and multi-client setups, following the ServiceFactory configuration structure.

Single client

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

Multiple clients

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

Use default instance

`ConsulService` proxies the default instance and exposes the native Consul client methods directly.

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

Get a named instance

Use `ConsulServiceFactory` to fetch a specifically named client instance.

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


## Service Discovery

From v4, Midway provides unified abstract service discovery; Consul acts as the service discovery client.

Service discovery includes service registration and service retrieval.


### Configure service discovery

You need to configure at least one client. If multiple clients are configured, use `serviceDiscoveryClient` to specify one.

Set up service discovery via `serviceDiscovery`.

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


### Register a service

Register the current service to Consul after the server is ready.

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
    // create a service discovery client
    const client = this.consulDiscovery.createClient();

    // register current service
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

`register` requires basic fields. The most important ones are `id`, `name`, and `address`.

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

`client.defaultMeta` provides defaults like `id`, `serviceName`, and `host`.


### Get an available service

Fetch a healthy instance dynamically wherever needed.

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

The returned `instance` is of type `ConsulHealthItem` with the following structure.

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


## Configuration Center

Consul can also act as a service configuration store.

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

You can set configuration via `kv.set` and retrieve it via `kv.get`.

Note: Do not fetch configuration from Consul on every request at high QPS, which would overload the Consul server.

In high-QPS scenarios, cache config in a singleton and refresh periodically:

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

Consul interface examples:

![image.png](https://img.alicdn.com/imgextra/i4/O1CN01V3P6uK1rIVs19JiWn_!!6000000005608-2-tps-1500-374.png)

![image.png](https://img.alicdn.com/imgextra/i2/O1CN014O2GyH1sMvIhmlbs4_!!6000000005753-2-tps-1500-667.png)


Available methods:

- [get](https://www.npmjs.com/package/consul#kv-get): get the value of a key
- [keys](https://www.npmjs.com/package/consul#kv-keys): list keys under a prefix
- [set](https://www.npmjs.com/package/consul#kv-set): set the value of a key
- [del](https://www.npmjs.com/package/consul#kv-del): delete a key
