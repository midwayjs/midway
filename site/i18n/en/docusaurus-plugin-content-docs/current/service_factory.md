# Service factory

Sometimes when writing components or services, you will encounter the situation that a service has multiple instances. At this time, the service factory (Service Factory) is suitable for this scenario.

for example, our oss component creates multiple oss objects, so you need to leave many instance interfaces when writing. For this scenario, midway abstracted `ServiceFactory` class.


`ServiceFactory` is an abstract class, and every service that needs to be implemented needs to be inherited.


Take an http client as an example, we need to prepare a method to create an http client instance, which contains two parts:


- 1. Method for creating a client instance
- 2. Configuration of Client

```typescript
// Create client configuration
const config = {
  baseUrl: '',
  timeout: 1000
};

// Method for creating a client instance
const httpClient = new HTTPClient(config);
```


## Implement a service class


We hope to implement a service factory of the above HTTPClient to create multiple httpClient objects in midway system.


The service factory is also a common export class in midway. As a member of the service, for example, we can also put it in `src/service/httpServiceFactory.ts`.


### 1. Implement the interface to create an instance

`ServiceFactory` is an abstract class for inheritance, which contains a generic type (the instance type created, for example, the following is the HTTPClient type created).


We only need to inherit it, and at the same time, the general service factory is a single case.
```typescript
import { ServiceFactory } from '@midwayjs/core';
import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class HTTPClientServiceFactory extends ServiceFactory<HTTPClient> {
	// ...
}
```
Since it is an abstract class, we need to implement two of these methods.
```typescript
import { ServiceFactory } from '@midwayjs/core';
import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class HTTPClientServiceFactory extends ServiceFactory<HTTPClient> {

  // Create a single instance
  protected createClient(config: any): any {
    return new HTTPClient(config);
  }

  getName() {
    return 'httpClient';
  }
}
```

`createClient` method is used to pass in a create service configuration (such as httpClient configuration) and return a specific instance, as in the example.


`getName` method is used to return the name of this service factory to facilitate frame identification and log output.


### 2. Add configuration and initialization methods


We need to inject a configuration, for example, we use `httpClient` as the configuration of this service.
```typescript
// config.default.ts
export const httpClient = {
	// ...
}
```
Then inject it into the service factory. At the same time, we also need to call the method of creating multiple instances during initialization.
```typescript
import { ServiceFactory } from '@midwayjs/core';
import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class HTTPClientServiceFactory extends ServiceFactory<HTTPClient> {

  @Config('httpClient')
  httpClientConfig;

  @Init()
  async init() {
    await this.initClients(this.httpClientConfig);
  }

  protected createClient(config: any): any {
    // Create an instance
    return new HTTPClient(config);
  }

  getName() {
    return 'httpClient';
  }
}
```
`initClients` method is implemented in the base class. It needs to pass a complete user configuration and call the `createClient` in a loop to create the object and save it to memory.


## Get instance


`createClient` method only defines the method of creating objects, and we also need to define the structure of the configuration.

The structure of the configuration is divided into several parts:

- 1. The default configuration, that is, the configuration in which all objects can be reused
- 2. Configuration required by a single instance
- 3. Configuration required by multiple instances



Let's explain separately,

**Default Configuration**


The default configuration, we agreed to `default` the attribute.
```typescript
// config.default.ts
export const httpClient = {
  default: {
    timeout: 3000
  }
}
```


### Single instance


**Single Configuration**
```typescript
// config.default.ts
export const httpClient = {
  default: {
    timeout: 3000
  },
  client: {
  	baseUrl: ''
  }
}
```
`client` is used to describe the structure of a single instance. The object is merged with the `default` when it is created. Use the `get` method to obtain the default instance.
```typescript
import { HTTPClientServiceFactory } from './service/httpClientServiceFactory';
import { join } from 'path';

@Provide()
export class UserService {
  
  @Inject()
  serviceFactory: HTTPClientServiceFactory;
  
  async invoke() {
    const httpClient = this.serviceFactory.get();
  }
}

```


### Multiple instances


Use `clients` to configure multiple instances. Each key is an independent instance configuration.
```typescript
// config.default.ts
export const httpClient = {
  default: {
    timeout: 3000
  },
  clients: {
  	aaa: {
    	baseUrl: ''
    },
    bbb: {
    	baseUrl: ''
    }
  }
}
```
use the key to obtain the instance.
```typescript
import { HTTPClientServiceFactory } from './service/httpClientServiceFactory';
import { join } from 'path';

@Provide()
export class UserService {
  
  @Inject()
  serviceFactory: HTTPClientServiceFactory;
  
  async invoke() {
    
    const aaaInstance = this.serviceFactory.get('aaa');
    // ...
        
    const bbbInstance = this.serviceFactory.get('bbb');
    // ...

  }
}
```



### Decorator gets instance

Starting from v3.9.0, ServiceFactory has added an `@InjectClient` decorator to facilitate the selection of injection when multiple clients are involved.

```typescript
import { HTTPClientServiceFactory } from './service/httpClientServiceFactory';
import { join } from 'path';
import { InjectClient } from '@midwayjs/core';

@Provide()
export class UserService {
  
   @InjectClient(HTTPClientServiceFactory, 'aaa')
   aaaInstance: HTTPClientServiceFactory;
  
   @InjectClient(HTTPClientServiceFactory, 'bbb')
   bbbInstance: HTTPClientServiceFactory;
  
   async invoke() {
     // this.aaaInstance.xxx
// this.bbbInstance.xxx
     //...
   }
}
```

The `@InjectClient` decorator is used to quickly inject multiple instances of `ServiceFactory` derived implementations, and all classes that extend `ServiceFactory` can be used.

The decorator takes two parameters, defined as follows:

```typescript
export function InjectClient(
   serviceFactoryClz: new (...args) => IServiceFactory<unknown>,
   clientName?: string
) {
   //...
}
```

| Parameters        | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| serviceFactoryClz | Required, the derived class of `ServiceFactory`, from which the decorator will get the lookup instance. |
| clientName        | Optional, if not filled, the default instance name `defaultClientName` configuration item in the configuration will be searched by default. |



### Dynamically create an instance


Instances can also be obtained dynamically through `createInstance` methods of the base class.


:::caution
Note that the createClient used here is not subclass, createClient does not contain and default configuration logic.
:::


```typescript
import { HTTPClientServiceFactory } from './service/httpClientServiceFactory';
import { join } from 'path';

@Provide()
export class UserService {

  @Inject()
  serviceFactory: HTTPClientServiceFactory;

  async invoke() {

    // config.bucket3 and config.default will be merged
    let customHttpClient = await this.serviceFactory.createInstance({
    	baseUrl: 'xxxxx'
    }, 'custom');

    // After passing the name, you can also get it from the factory.
    customHttpClient = this.serviceFactory.get('custom');

  }
}
```
The first parameter of the `createInstance` method is configuration. If you call dynamically, you can manually pass the parameter. The second parameter is a string name. If the name is passed in, the created instance will be saved in memory and can be obtained from the service factory again later.



## Instance configuration merge logic

When the actual code is running, even if it is a single instance, configuring a `client` will transform the configuration into `clients` in memory.

For example the following code:

```typescript
// config.default.ts
export const httpClient = {
  client: {
  baseUrl: ''
  }
}
```

in memory becomes:

```typescript
// config.default.ts
export const httpClient = {
  clients: {
    default: {
      baseUrl: ''
    }
  }
}
```

There will be an extra default instance called `default`, and the service factory will be initialized with the configuration of `clients`.



## Default instance proxy (optional)

It will be very cumbersome if the user needs to obtain it through `serviceFactory` every time they use it. For the most commonly used default instance, a proxy class can be provided to make it proxy all the target instance methods.

```typescript
import { ServiceFactory, MidwayCommonError, delegateTargetAllPrototypeMethod } from '@midwayjs/core';
import { Provide, Scope, ScopeEnum, Init } from '@midwayjs/decorator';

//...
export class HTTPClientServiceFactory extends ServiceFactory<HTTPClient> {
  //...
}

// The following is the default proxy class
@Provide()
@Scope(ScopeEnum. Singleton)
export class HTTPClientService implements HTTPClient {
  @Inject()
  private serviceFactory: HTTPClientServiceFactory;

  // This property is used to hold the actual instance
  private instance: HTTPClient;

  @Init()
  async init() {
    // In the initialization phase, get the default instance from the factory
    this.instance = this.serviceFactory.get(
      this.serviceFactory.getDefaultClientName() || 'default'
    );
    if (!this. instance) {
      throw new MidwayCommonError('http client default instance not found.');
    }
  }
}

// In the code below, the ts definition for the default instance class is correctly inherited

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HTTPClientService extends HTTPClient {
  //empty
}

// The following code, for the implementation of the default instance class can be proxied
delegateTargetAllPrototypeMethod(HTTPClientService, HTTPClient);

```

With the above code, we can use `HTTPClientService` directly without getting the default instance from `HTTPClientServiceFactory`.

`delegateTargetAllPrototypeMethod` is a utility method provided by Midway to delegate instance methods.

In addition, there are some other available tool methods, listed below:

- `delegateTargetAllPrototypeMethod` is used to delegate all prototype methods of the target, including the prototype chain, excluding constructors and internal hidden methods
- `delegateTargetPrototypeMethod` is used to delegate all prototype methods of the target, excluding constructors and inner hidden methods
- `delegateTargetMethod` specifies the method on the proxy target



## Modify the default instance name

By default, the default instance name is `default`, and the default instance proxy will be proxied internally based on this instance.

If the user does not configure the `default` instance, or wants to modify the default instance, the user can modify it through configuration.

```typescript
// config.default.ts
export const httpClient = {
  clients: {
    default: {
      baseUrl: ''
    },
    default2: {
      baseUrl: ''
    }
  },
  defaultClientName: 'default2',
}
```

In the default instance proxy, this value will be obtained through `this.serviceFactory.getDefaultClientName()`.

```typescript
import { HTTPClientService } from './service/httpClientServiceFactory';
import { join } from 'path';

@Provide()
export class UserService {
  
  @Inject()
  httpClientService: HTTPClientService;
  
  async invoke() {
    // this.httpClientService points to default2
  }
}
```