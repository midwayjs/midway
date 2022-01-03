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


我们只需要继承它。
```typescript
import { ServiceFactory } from '@midwayjs/core';
import { Provide } from '@midwayjs/decorator';

@Provide()
export class HTTPClientServiceFactory extends ServiceFactory<HTTPClient> {
	// ...
}
```
由于是抽象类，我们需要实现其中的两个方法。
```typescript
import { ServiceFactory } from '@midwayjs/core';
import { Provide } from '@midwayjs/decorator';

@Provide()
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

`createClient` 方法用于传入一个创建服务配置（比如 httpClient 配置），返回一个具体的实例，就像示例的那样。


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
import { Provide } from '@midwayjs/decorator';

@Provide()
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


### 动态创建实例


也可以通过基类的 `createInstance` 方法动态获取实例。


:::warning
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