# Consul

consul is used for service governance under microservices. Its main features include service discovery, service configuration, health check, key value storage, secure service communication, and multiple data centers.

This article describes how to use consul as the service registration discovery center of midway and how to use consul to do soft load functions.

Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ❌ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |



Thank you for the components provided by [boostbob](https://github.com/boostbob).


The effect is as follows:
![image.png](https://img.alicdn.com/imgextra/i3/O1CN01e5cFZx1I0draeZynr_!!6000000000831-2-tps-1500-471.png)

![image.png](https://img.alicdn.com/imgextra/i2/O1CN01iLYF8r1HQ0B3b47Fh_!!6000000000751-2-tps-1500-895.png)


## Installation Components

First install consul components and types:

```bash
$ npm i @midwayjs/consul@3 --save
$ npm i @types/consul --save-dev
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/consul": "^3.0.0",
    // ...
  },
  "devDependencies": {
    "@types/consul": "^0.40.0 ",
    // ...
  }
}
```



## Capacity currently supported

- Registration capability (optional)
- Anti-registration when service is stopped (optional)
- Service Selection (Random)
- Expose the original consul object



## Enable components

```typescript
import * as consul from '@midwayjs/consul'

@Configuration({
  imports: [
    // ..
    consul
  ],
  importConfigs: [join(__dirname, 'config')]
})
export class MainConfiguration {}
```



## Configuration

Configure the `config.default.ts` file:

```typescript
// src/config/config.default
export default {
  // ...
  consul: {
    provider: {
      // Register for this service
      register: true
      // Apply normal offline anti-registration
      deregister: true
      // consul server service address
      host: '192.168.0.10',
      // consul server service port
      port: '8500',
      // Policy for invoking the service (random is selected by default)
      strategy: 'random',
    },
    service: {
      // This is the address of the current midway application.
      address: '127.0.0.1',
      // The port of the current midway application
      port: 7001
      // Use for lane isolation, etc.
      tags: ['tag1', 'tag2']			
      name: 'my-midway-project'
      // others consul service definition
    }
  },
}
```

Open the ui address of our consul server with the following effect:

![image.png](https://img.alicdn.com/imgextra/i1/O1CN01QI7A1d1dU3ECG8QxQ_!!6000000003738-2-tps-1500-471.png)

It can be observed that my-midway-project project has been registered.

If we stop our midway project.

![image.png](https://img.alicdn.com/imgextra/i3/O1CN01EDocUO1TIvRvpxXbw_!!6000000002360-2-tps-1500-401.png)

We can see that the status of our project turns red.

We demonstrate the situation of multiple units, as follows:(1 online +1 offline)

![image.png](https://img.alicdn.com/imgextra/i1/O1CN01kfmul91eSxu5EiJE3_!!6000000003871-2-tps-1500-405.png)

![image.png](https://img.alicdn.com/imgextra/i4/O1CN01PZrdpp21Sir5n3y9I_!!6000000006984-2-tps-1500-360.png)



## As a client

For example, as client A, we need to call the interface of service B. Then we first find out the healthy service of B and then make an http request.


Here, for the convenience of understanding, we simulate the successful service that has just been registered:
```typescript
import { Controller, Get, Inject, Provide } from '@midwayjs/decorator';
import { BalancerService } from '@midwayjs/consul'

@Provide()
@Controller('/')
export class HomeController {

  @Inject()
  balancerService: BalancerService;

  @Get('/')
  async home() {
    const service = await this.balancerService.getServiceBalancer().select('my-midway-project');

    // output
    console.log(service)

    // ...
  }
}

```
The content of the output service is:
```typescript
{
  ID: 'c434e36b-1b62-c4e1-c4ec-76c5d3742ff8',
  Node: '1b2d5b8771cb',
  Address: '127.0.0.1',
  Datacenter: 'dc1',
  TaggedAddresses: {
    lan: '127.0.0.1',
    lan_ipv4: '127.0.0.1',
    wan: '127.0.0.1',
    wan_ipv4: '127.0.0.1'
  },
  NodeMeta: { 'consul-network-segment': '' },
  ServiceKind: '',
  ServiceID: 'my-midway-project:xxx:7001',
  ServiceName: 'my-midway-project',
  ServiceTags: [ 'tag1', 'tag2' ],
  ServiceAddress: 'xxxxx',
  ServiceTaggedAddresses: {
    lan_ipv4: { Address: 'xxxxx', Port: 7001 },
    wan_ipv4: { Address: 'xxxxxx', Port: 7001 }
  },
  ServiceWeights: { Passing: 1, Warning: 1 },
  ServiceMeta: {},
  ServicePort: 7001,
  ServiceEnableTagOverride: false,
  ServiceProxy: { MeshGateway: {}, Expose: {} },
  ServiceConnect: {},
  CreateIndex: 14,
  ModifyIndex: 14
}
```
At this time, we only need to connect to service B through Address and ServicePort, such as making http requests.


If you need to query for unhealthy ones, the second parameter of the `select` method is passed the value of false:
```typescript
import { Controller, Get, Inject, Provide } from '@midwayjs/decorator';
import { BalancerService } from '@midwayjs/consul'

@Provide()
@Controller('/')
export class HomeController {

  @Inject()
  balancerService: BalancerService;

  @Get('/')
  async home() {

    const service = await this.balancerService
      .getServiceBalancer()
      .select('my-midway-project', false);

    console.log(service);

    // ...
  }
}

```



## Configuration center


At the same time, consul can also be used as a service configuration place, as follows:
```typescript
import { Controller, Get, Inject } from '@midwayjs/decorator';
import * as Consul from 'consul';

@Controller('/')
export class HomeController {

  @Inject('consul:consul')
  consul: Consul.Consul;

  @Get('/')
  async home() {
    await this.consul.kv.set(`name`, `juhai`)
    // let res = await this.consul.kv.get('name');
    // console.log(res);
    return 'Hello Midwayjs!';
  }
}

```
You can call the `kv.set` method to set the corresponding configuration. You can use the `kv.get` method to obtain the corresponding configuration.


Note: In the code, some students appear and get the corresponding configuration in each request. How much pressure does your QPS put on Consul server.


Therefore, in the case of large QPS, it can be handled as follows:
```typescript
import { Init, Inject, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import * as Consul from 'consul';

@Provide()
@Scope(ScopeEnum.Singleton)
export class ConfigService {

  @Inject('consul:consul')
  consul: Consul.Consul;

  config: any;

  @Init()
  async init() {
    setInterval(()=> {
      this.consul.kv.get('name').then(res=> {
        this.config = res;
      })
    }, 5000);
    this.config = await this.consul.kv.get('name');
  }

  async getConfig() {
    return this.config;
  }
}

```
The above code is equivalent to obtaining the corresponding configuration regularly. When each request comes in, the `getConfig` method of obtaining Scope as the ScopeEnum.Singleton service is obtained. This reduces the pressure on the service every 5S.

The following figure on the Consul interface:

![image.png](https://img.alicdn.com/imgextra/i4/O1CN01V3P6uK1rIVs19JiWn_!!6000000005608-2-tps-1500-374.png)

![image.png](https://img.alicdn.com/imgextra/i2/O1CN014O2GyH1sMvIhmlbs4_!!6000000005753-2-tps-1500-667.png)


A total of the following methods are provided:

- [get](https://www.npmjs.com/package/consul#kv-get) to obtain the value of the key.
- [keys](https://www.npmjs.com/package/consul#kv-keys): queries the key list of a prefix.
- [set](https://www.npmjs.com/package/consul#kv-set) to set the value of the key.
- [del](https://www.npmjs.com/package/consul#kv-del): deletes the key.



## Other instructions


The advantage of this is that A->B, B can also be extended, and can be isolated by tags. For example, do unit isolation, etc. And the corresponding weight control can be done through ServiceWeights.


Consul can also function as the configuration center of Key/Value. We will consider supporting this later.


## Building Consul Test Service


The following describes the construction process of the stand-alone version of consul.
```bash
docker run -itd -P consul
```
Then run the `docker ps`
```bash
➜  my_consul_app docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                                                                                                                                                                                    NAMES
1b2d5b8771cb        consul              "docker-entrypoint.s…"   4 seconds ago       Up 2 seconds        0.0.0.0:32782->8300/tcp, 0.0.0.0:32776->8301/udp, 0.0.0.0:32781->8301/tcp, 0.0.0.0:32775->8302/udp, 0.0.0.0:32780->8302/tcp, 0.0.0.0:32779->8500/tcp, 0.0.0.0:32774->8600/udp, 0.0.0.0:32778->8600/tcp   cocky_wing
```
Then we open the port corresponding to the 8500: (for example, in the above figure, my corresponding port is 32779)

[http://127.0.0.1:32779/ui/](http://127.0.0.1:32779/ui/dc1/kv)

After opening, the effect is as follows:

![](https://img.alicdn.com/imgextra/i2/O1CN014O2GyH1sMvIhmlbs4_!!6000000005753-2-tps-1500-667.png)

Then the port in our `config.default.ts` is the 32779 port.



## Offline service
If you want to manually offline services that are not needed on the consul interface, you can use the following methods:
```typescript
import { Controller, Get, Inject, Provide } from '@midwayjs/decorator';
import * as Consul from 'consul'

@Provide()
@Controller('/')
export class HomeController {

  @Inject('consul:consul')
  consul: Consul.Consul;

  @Get("/222")
  async home2() {
    let res = await this.consul.agent.service.deregister('my-midway-project:30.10.72.195:7002');
    console.log(res);

    // ...
  }

}

```
The `deregister` method corresponds to the name on the consul interface.

![image.png](https://img.alicdn.com/imgextra/i2/O1CN01d5QMUJ1DULTKPSJsr_!!6000000000219-2-tps-1500-465.png)
