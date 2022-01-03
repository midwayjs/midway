# 缓存（Cache）

Midway Cache 是为了方便开发者进行缓存操作的组件，它有利于改善项目的性能。它为我们提供了一个数据中心以便进行高效的数据访问。


## 安装

首先安装相关的组件模块。

```bash
$ npm i @midwayjs/cache@3 cache-manager --save
$ npm i @types/cache-manager --save-dev
```


## 使用 Cache

Midway 为不同的 cache 存储提供了统一的 API。默认内置了一个基于内存数据存储的数据中心。如果想要使用别的数据中心，开发者也可以切换到例如 mongodb、fs 等模式。


首先，引入 Cache 组件，在 `configuration.ts` 中导入：

```typescript
import { Configuration, App } from '@midwayjs/decorator';
import { Application } from '@midwayjs/koa';
import * as bodyParser from 'koa-bodyparser';
import * as cache from '@midwayjs/cache';			// 导入cacheComponent模块
import { join } from 'path'

@Configuration({
  imports: [
    cache		// 导入 cache 组件
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class ContainerLifeCycle {
}
```

然后在业务代码中即可注入使用。

```typescript
import { Inject, Provide } from '@midwayjs/decorator';
import { IUserOptions } from '../interface';
import { CacheManager } from '@midwayjs/cache';

@Provide()
export class UserService {

  @Inject()
  cache: CacheManager;     			// 依赖注入CacheManager
}
```

通过提供的 API 来设置，获取缓存数据。


```typescript
import { Inject, Provide } from '@midwayjs/decorator';
import { IUserOptions } from '../interface';
import { CacheManager } from '@midwayjs/cache';

@Provide()
export class UserService {

  @Inject()
  cache: CacheManager;
  
  async getUser(options: IUserOptions) {
    // 设置缓存内容
    await this.cache.set(`name`, 'stone-jin'); 
    
    // 获取缓存内容
    let result = await this.cache.get(`name`);
    
    return result;
  }

  async getUser2(){
    //获取缓存内容
    let result = await this.cache.get(`name`); 
    return result;
  }

  async reset(){
    await this.cache.reset(); // 清空对应 store 的内容
  }
}
```


### 设置缓存


我们通过 `await this.cache.set(key, value)` 方法进行设置，此处默认过期时间是10s。


你也可以手动设置 TTL（过期时间），如下：
```typescript
await this.cache.set(key, value, {ttl: 1000});	// ttl的单位为秒
```
如果你想要禁止 Cache 不过期，则将 TTL 设置为 null 即可。
```typescript
await this.cache.set(key, value, {ttl: null});
```
同时你也可以通过全局的 `config.default.ts` 中进行设置。
```typescript
export const cache = {
  store: 'memory',
  options: {
    max: 100,
    ttl: 10,		// 修改默认的ttl配置
  },
};
```
### 获取缓存
```typescript
const value = await this.cache.get(key);
```
如果获取不到，则为 undefined。


### 移除缓存


移除缓存，可以通过 del 方法。
```typescript
await this.cache.del(key);
```


### 清空整体store数据（此处是整体清除，需要重点⚠️）


比如用户设置了某个 redis 为 store，调用的话，包括非 cache 模块设置的也会清除。
```typescript
await this.cache.reset(); // 这块需要注意
```


## 全局配置


当我们引用了这个 cache 组件后，我们能对其进行全局的配置。配置方法跟别的组件类似。


默认的配置：
```typescript
export const cache = {
  store: 'memory',
  options: {
    max: 100,
    ttl: 10,
  },
};

```
例如用户可以修改默认的 TTL，也就是过期时间。


## 其他Cache


用户也可以修改  store 方式，在 `config.default.ts` 中进行组件的配置：
```typescript
import * as redisStore from 'cache-manager-ioredis';

export const cache = {
  store: redisStore,
  options: {
    host: 'localhost', // default value
    port: 6379, // default value
    password: '',
    db: 0,
    keyPrefix: 'cache:',
    ttl: 100
  },
}
```
或者修改为 mongodb 的 cache。


:::danger
**再次注意⚠️：使用 redis 的作为 cache 的时候，代码里面慎用 reset 方法，因为会把整个 redis 给 flushdb，简称数据清空。**
:::


## 相关文档


由于 Midway Cache 是基于 cache-manager 封装，所以相关资料用户也可以查询：[cache-manger](https://www.npmjs.com/package/cache-manager)。


## 常见问题
### 1、set和get无法得到相同值？
用户使用了cache模块，默认是内存式的，例如在本地用dev模式，由于是单进程的，那set和get最终能达到相同的值。但是用户部署到服务器上面后，由于会有多worker，相当于第一次请求，落在进程1上，然后第二次落在进程2上，这样获得到空了。


解决办法：参考 其他Cache的章节，配置store为分布式的，例如redis的store等方式。
