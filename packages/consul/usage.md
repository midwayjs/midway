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
    // more parameter? here ->  https://github.com/silas/node-consul#consulagentserviceregisteroptions
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
    // {Required},Configuration of consul,All parameters -> https://github.com/silas/node-consul#consuloptions,
    options: {
      host: '127.0.0.1',
      port: '8500',
    },
    //{Optional},Default is true;When value true is yes,will deregister the service after the application stops
    deregister: true,
  },
};
```
Notes:`options` and `register` are consisitent with [Common Method Call Options](https://github.com/silas/node-consul#common-method-call-options) and  [consul agent service register options](https://github.com/silas/node-consul#consulagentserviceregisteroptions)




### 3. lookup the service instance to call.

- Get ConsulService with two ways

```typescript
import { ConsulService } from '@midwayjs/consul';
import { App, IMidwayApplication } from '@midwayjs/core';

export class Home {
  //1. with Inject
  @Inject()
  consulSrv: ConsulService;
  @App()
  app: IMidwayApplication;

  //2. with Code;
  async home() {
    const consulSrv = await app
      .getApplicationContext()
      .getAsync<ConsulService>(ConsulService);
  }
}
```

- Find service information by name,and You can get the same structure
  as [consul's api response](https://developer.hashicorp.com/consul/api-docs/catalog#sample-response-3)

```typescript
// You can do whatever you want with serviceInfo,like service calls, etc
// By the way,select will only get services that are in a healthy(status is passing) state,If there are multiple instances, select one at random
import console = require("console");

try {
  const service = await consulSrv.select('SERVICE_NAME');
  console.log(service)
} catch (e) {
  // if an exception occurs, you can get an instance of MidwayConsulError,so you can do some magic..
}
```
the output [structure](https://developer.hashicorp.com/consul/api-docs/catalog#sample-response-3) is :
```json
[
  {
    "ID": "40e4a748-2192-161a-0510-9bf59fe950b5",
    "Node": "t2.320",
    "Address": "192.168.10.10",
    "Datacenter": "dc1",
    "TaggedAddresses": {
      "lan": "192.168.10.10",
      "wan": "10.0.10.10"
    },
    "NodeMeta": {
      "somekey": "somevalue"
    },
    "CreateIndex": 51,
    "ModifyIndex": 51,
    "ServiceAddress": "172.17.0.3",
    "ServiceEnableTagOverride": false,
    "ServiceID": "32a2a47f7992:nodea:5000",
    "ServiceName": "web",
    "ServicePort": 5000,
    "ServiceMeta": {
      "web_meta_value": "baz"
    },
    "ServiceTaggedAddresses": {
      "lan": {
        "address": "172.17.0.3",
        "port": 5000
      },
      "wan": {
        "address": "198.18.0.1",
        "port": 512
      }
    },
    "ServiceTags": ["prod"],
    "ServiceProxy": {
      "DestinationServiceName": "",
      "DestinationServiceID": "",
      "LocalServiceAddress": "",
      "LocalServicePort": 0,
      "Config": null,
      "Upstreams": null
    },
    "ServiceConnect": {
      "Native": false,
      "Proxy": null
    },
    "Namespace": "default"
  }
]



```

### 4. Gets the original object of Consul,You can use the original object do you need(likes:KVStore,Events,etc...)

```typescript
import { ConsulService } from '@midwayjs/consul';

export class Home {
  @Inject()
  consulSrv: ConsulService;

  async home() {
    const consulObj = this.consulSrv.consul;
  }
}
```
