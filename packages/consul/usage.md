# midway consul

## How to use

```shell
npm i @midwayjs/consul -S
npm i @types/consul -D
```

## Support

- [x] register (optional)
- [x] deregister on the shutdown (optional)
- [x] expose the origin consul object

## Usage age

### 1. import component firstly.

```
import * as consul from '@midwayjs/consul'

@Configuration({
  imports: [
    consul
  ],
  importConfigs: [join(__dirname, 'config')]
})
export class ContainerConfiguration {}

```

### 2. config consul server and service definition.

```typescript
export default {
  consul: {
    // {Optional}, Default is undefined
    // If you need to register your current application with consul;or you can also use it as a client without registering
    // full parameter? here ->  https://github.com/silas/node-consul#consulagentserviceregisteroptions
    register: {
      //{Required}
      address: '127.0.0.1',
      //{Required}
      port: 7001,
      //{Optional},Default to the name value of package.json
      name: 'SERVICE_NAME',
      //{Optional},Default is `name:address:port`
      id: 'SERVICE_ID',
    },
    // {Required},Service configuration of consul,All parameters -> https://github.com/silas/node-consul#consuloptions,
    options: {
      host: '127.0.0.1',
      port: '8500',
    },
    //{Optional},Default is true;When value true is yes,will deregister the service after the application stops
    deregister: true,
  },
};
```

### 3. lookup the service instance to call.

- Get Service

```typescript
// There are two ways to get a service
import {ConsulService} from '@midwayjs/consul';
import { App, IMidwayApplication } from '@midwayjs/core';
export class Home {
  //1. with Inject
  @Inject()
  consulSrv: ConsulService;
  @App()
  app: IMidwayApplication;

  //2. with Code;
  async home() {
    const consulSrv = await app.getApplicationContext().getAsync<ConsulService>(ConsulService);
  }
}
```

- Get service information by name ( and datacenter),and You can get the same structure
  as [consul's api response](https://developer.hashicorp.com/consul/api-docs/agent/service#sample-response)

```typescript
try {
  const serviceInfo = await consulSrv.select('SERVICE_NAME', 'DATACENTER');
  // You can do whatever you want with serviceInfo,like service calls, etc
  // By the way,select will only get services that are in a healthy(status is passing) state,If there are multiple instances, select one at random
} catch (e) {
  // if an exception occurs, you can get an instance of MidwayConsulError,so you can do some magic..
}
```
### 4. Gets the original object of Consul,You can use the original object do you need(likes:KV,Query,etc...)

```typescript
import {ConsulService} from '@midwayjs/consul';

export class Home {
  @Inject()
  consulSrv: ConsulService;

  async home() {
    const consulObj =this.consulSrv.consul
  }
}

```
