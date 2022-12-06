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
$ npm i @midwayjs/etcd@3 --save
```

Or add the following dependencies in `package.json` and reinstall.

```json
{
  "dependencies": {
    "@midwayjs/etcd": "^3.0.0",
    //...
  },
}
```




## import component


First, import the component, import it in `configuration.ts`:

```typescript
import { Configuration } from '@midwayjs/decorator';
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
import { Provide } from '@midwayjs/decorator';
import { ETCDService } from '@midwayjs/etcd';
import { join } from 'path';

@Provide()
export class UserService {

  @Inject()
  etcdService: etcdService;

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
import { Provide } from '@midwayjs/decorator';
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



## Create instance dynamically

```typescript
import { Provide } from '@midwayjs/decorator';
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