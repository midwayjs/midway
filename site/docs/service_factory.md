# 服务工厂

有时候编写组件或者编写服务，会碰到某个服务有多实例的情况，这个时候服务工厂（Service Factory）就适合这种场景。

比如我们的 oss 组件，由于会创建多个 oss 对象，在编写的时候就需要留好多实例的接口。为了这种场景，midway 抽象了 `ServiceFactory` 类。


`ServiceFactory` 是个抽象类，每个需要实现的服务，都需要继承他。


我们以一个 http 客户端为例，需要准备一个创建 http 客户端实例的方法，其中包含两个部分：


- 1、创建客户端实例的方法
- 2、客户端的配置

```typescript
// 创建客户端的配置
const config = {
  baseUrl: '',
  timeout: 1000,
};

// 创建客户端实例的方法
const httpClient = new HTTPClient(config);
```


## 实现一个服务类


我们希望实现一个上述 HTTPClient 的服务工厂，用于在 midway 体系中创建多个 httpClient 对象。


服务工厂在 midway 中也是一个普通的导出类，作为服务的一员，比如我们也可以把他放到 `src/service/httpServiceFactory.ts` 中。


### 1、实现创建实例接口

`ServiceFactory` 是个用于继承的抽象类，它包含一个泛型（创建的实例类型，比如下面就是创建出 HTTPClient 类型）。


我们只需要继承它，同时，一般服务工厂为单例。
```typescript
import { ServiceFactory } from '@midwayjs/core';
import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class HTTPClientServiceFactory extends ServiceFactory<HTTPClient> {
	// ...
}
```
由于是抽象类，我们需要实现其中的两个方法。
```typescript
import { ServiceFactory } from '@midwayjs/core';
import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class HTTPClientServiceFactory extends ServiceFactory<HTTPClient> {
  
  // 创建单个实例
  protected createClient(config: any): any {
    return new HTTPClient(config);
  }

  getName() {
    return 'httpClient';
  }
}
```

`createClient` 方法用于传入一个创建服务配置（比如 httpClient 配置），返回一个具体的实例，就像示例中的那样。


`getName` 方法用于返回这个服务工厂的名字，方便框架识别和日志输出。


### 2、增加配置和初始化方法


我们需要注入一个配置，比如我们使用 `httpClient` 作为这个服务的配置。
```typescript
// config.default.ts
export const httpClient = {
	// ...
}
```
然后注入到服务工厂中，同时，我们还需要在初始化时，调用创建多个实例的方法。
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
    // 创建实例
    return new HTTPClient(config);
  }

  getName() {
    return 'httpClient';
  }
}
```
`initClients` 方法是基类中实现的，它需要传递一个完整的用户配置，并循环调用 `createClient` 来创建对象，保存到内存中。



## 获取实例


`createClient` 方法只是定义了创建对象的方法，我们还需要定义配置的结构。

配置的结构分为几部分：

- 1、默认配置，即所有对象都能复用的配置
- 2、单个实例需要的配置
- 3、多个实例需要的配置



我们来分别说明，


**默认配置**


默认的配置，我们约定为 `default` 属性。
```typescript
// config.default.ts
export const httpClient = {
  default: {
    timeout: 3000
  }
}
```


### 单个实例


**单个配置**
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
`client` 用于单个实例结构的描述，创建对象时会和 `default` 做合并。使用 `get` 方法获取默认实例。
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


### 多个实例


使用 `clients` 来配置多个实例，每个 key 都是一个独立的实例配置。
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
通过 key 来获取实例。
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



### 装饰器获取实例

从 v3.9.0 开始，ServiceFactory 添加了一个 `@InjectClient` 装饰器，方便在多客户端的的时候选择注入。

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
    // ...
  }
}
```

`@InjectClient` 装饰器用于快速注入 `ServiceFactory` 派生实现的多实例，所有扩展与 `ServiceFactory` 的类，都能使用。

装饰器包含两个参数，定义如下：

```typescript
export function InjectClient(
  serviceFactoryClz: new (...args) => IServiceFactory<unknown>,
  clientName?: string
) {
  // ...
}
```

| 参数              | 描述                                                         |
| ----------------- | ------------------------------------------------------------ |
| serviceFactoryClz | 必填，`ServiceFactory` 的派生类，装饰器会从中获取查找实例。  |
| clientName        | 可选，如果不填，默认会查找配置中的默认实例名 `defaultClientName` 配置项。 |



### 动态创建实例


也可以通过基类的 `createInstance` 方法动态获取实例。


:::caution
注意，这里使用的不是子类的 createClient，createClient 不包含和默认配置的逻辑。
:::


```typescript
import { HTTPClientServiceFactory } from './service/httpClientServiceFactory';
import { join } from 'path';

@Provide()
export class UserService {
  
  @Inject()
  serviceFactory: HTTPClientServiceFactory;
  
  async invoke() {
    
    // 会合并 config.bucket3 和 config.default
    let customHttpClient = await this.serviceFactory.createInstance({
    	baseUrl: 'xxxxx'
    }, 'custom');
    
    // 传了名字之后也可以从 factory 中获取
    customHttpClient = this.serviceFactory.get('custom');
   
  }
}
```
`createInstance` 方法的第一个参数是配置，如果动态调用的时候，可以手动传参，第二个参数是一个字符串名称，如果传入了名称，创建完的实例将会保存到内存中，后续可以从服务工厂中再次获取。



## 实例配置合并逻辑

在实际代码运行时，即使是单实例，配置一个 `client`，也会在内存中将配置变换为 `clients`。

比如下面的代码：

```typescript
// config.default.ts
export const httpClient = {
  client: {
  	baseUrl: ''
  }
}
```

在内存中会变为：

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

会多出一个名为 `default` 的默认实例，服务工厂会以 `clients` 的配置进行初始化。



## 默认实例代理（可选）

如果用户每次使用时，都通过 `serviceFactory` 去获取，会非常的繁琐，对于最常用的默认实例，可以提供一个代理类，使其代理所有的目标实例方法。

```typescript
import { ServiceFactory, MidwayCommonError, delegateTargetAllPrototypeMethod } from '@midwayjs/core';
import { Provide, Scope, ScopeEnum, Init } from '@midwayjs/decorator';

// ...
export class HTTPClientServiceFactory extends ServiceFactory<HTTPClient> {
  // ...
}

// 下面是默认代理类
@Provide()
@Scope(ScopeEnum.Singleton)
export class HTTPClientService implements HTTPClient {
  @Inject()
  private serviceFactory: HTTPClientServiceFactory;

  // 这个属性用于保存实际的实例
  private instance: HTTPClient;

  @Init()
  async init() {
    // 在初始化阶段，从工厂拿到默认实例
    this.instance = this.serviceFactory.get(
      this.serviceFactory.getDefaultClientName() || 'default'
    );
    if (!this.instance) {
      throw new MidwayCommonError('http client default instance not found.');
    }
  }
}

// 下面这段代码，用于默认实例类的 ts 定义正确被继承

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HTTPClientService extends HTTPClient {
  // empty
}

// 下面这段代码，用于默认实例类的实现可以被代理
delegateTargetAllPrototypeMethod(HTTPClientService, HTTPClient);

```

通过上面的代码，我们就可以直接使用 `HTTPClientService` ，而无需从 `HTTPClientServiceFactory` 获取默认实例。

`delegateTargetAllPrototypeMethod` 是 Midway 提供的代理实例方法的工具方法。

此外，还有一些其他可用的工具方法，列举如下：

- `delegateTargetAllPrototypeMethod` 用于代理目标所有的原型方法，包括原型链，不包括构造器和内部隐藏方法
- `delegateTargetPrototypeMethod` 用于代理目标所有的原型方法，不包括构造器和内部隐藏方法
- `delegateTargetMethod` 代理目标上指定的方法



## 修改默认实例名

默认情况下，默认的实例名为 `default` ，默认的实例代理内部会根据该实例进行代理。

假如用户没有配置 `default` 实例，或者希望修改默认实例，用户通过配置修改。

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

在默认的实例代理中，会通过 `this.serviceFactory.getDefaultClientName()` 来获取这个值。

```typescript
import { HTTPClientService } from './service/httpClientServiceFactory';
import { join } from 'path';

@Provide()
export class UserService {
  
  @Inject()
  httpClientService: HTTPClientService;
  
  async invoke() {
		// this.httpClientService 中指向的是 default2
  }
}
```

