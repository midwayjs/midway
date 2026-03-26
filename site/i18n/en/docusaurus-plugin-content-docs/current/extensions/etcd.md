# etcd

etcd is an important basic component in the cloud native architecture, hosted by CNCF incubation. etcd can be registered as a service in discovery in microservices and Kubernetes clusters, and can also be used as a middleware for key-value storage.

Midway provides components packaged based on the [etcd3](https://github.com/microsoft/etcd3) module, which provides etcd client calling capabilities.

Related Information:

| Description                     |      |
| ------------------------------- | ---- |
| Available for Standard Items    | ✅    |
| Available for Serverless        | ✅    |
| Can be used for integration     | ✅    |
| contains independent main frame | ❌    |
| Contains standalone logs        | ❌    |




## Install dependencies

```bash
$ npm i @midwayjs/etcd@4 --save
```

Or add the following dependencies in `package.json` and reinstall.

```json
{
  "dependencies": {
    "@midwayjs/etcd": "^4.0.0",
    //...
  },
}
```




## import component


First, import the component, import it in `configuration.ts`:

```typescript
import { Configuration } from '@midwayjs/core';
import * as etcd from '@midwayjs/etcd';
import { join } from 'path'

@Configuration({
  imports: [
    //...
    etcd,
  ],
  //...
})
export class MainConfiguration {
}
```



## Configure the default client

In most cases, we can only use the default client to complete the function.

```typescript
// src/config/config.default.ts
export default {
  //...
  etcd: {
    client: {
      host: [
        '127.0.0.1:2379'
      ]
    },
  },
}
```



## Use the default client

After the configuration is complete, we can use it in the code.

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

For more APIs, please refer to the ts definition or [official document](https://microsoft.github.io/etcd3/classes/etcd3.html).



## Multiple instance configuration

```typescript
// src/config/config.default.ts
export default {
  //...
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



## Get multiple instances

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
    //...

    const instance2 = this.etcdServiceFactory.get('instance2');
    //...
  }
}
```


## Service Discovery

From v4, Midway provides a unified abstract service discovery capability. Although ETCD is not ideal as a registration center, we still implement ETCD as a service discovery client.

Service discovery includes service registration and service retrieval.


### Configure service discovery

Configure at least one client; if multiple clients exist, specify the one used for discovery via `serviceDiscoveryClient`.

Configure discovery options via `serviceDiscovery`:

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
      // optional: loadBalancer: LoadBalancerType.ROUND_ROBIN
    }
  }
}
```

Notes: `namespace` is the keyspace prefix; instance keys follow `namespace/serviceName/instanceId`. `ttl` is the expiration time in seconds.


### Register a service

Register the current service to ETCD after startup:

```typescript
import { Configuration, Inject } from '@midwayjs/core';
import { EtcdServiceDiscovery } from '@midwayjs/etcd';

@Configuration({})
export class MainConfiguration {
  @Inject()
  etcdDiscovery: EtcdServiceDiscovery;

  async onServerReady() {
    // create discovery client (override options if needed)
    const client = this.etcdDiscovery.createClient();

    // register current service and bring it online (write key and bind lease)
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

Notes: Registration brings the instance online by default; no need to call `online`. ETCD maintains TTL via Lease with periodic renewal; `offline` deletes the key and revokes the lease; `deregister` unregisters and cleans state. Repeated calls to `register/online/offline/deregister` are idempotent.


### Get available services

Fetch all healthy instances or select one according to the load balancer:

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

Returned instances are the objects written during registration (`EtcdInstanceMetadata`), typically including `serviceName/id/ttl/meta/tags/status` fields.



## Create instance dynamically

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
    //...
  }
}
```
