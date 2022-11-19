# ETCD

etcd 是云原生架构中重要的基础组件，由 CNCF 孵化托管。etcd 在微服务和 Kubernates 集群中可以作为服务注册于发现，也可以作为 key-value 存储的中间件。

Midway 提供基于 [etcd3](https://github.com/microsoft/etcd3) 模块封装的组件，提供 etcd 的客户端调用能力。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ✅    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |




## 安装依赖

```bash
$ npm i @midwayjs/etcd@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/etcd": "^3.0.0",
    // ...
  },
}
```




## 引入组件


首先，引入 组件，在 `configuration.ts` 中导入：

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as etcd from '@midwayjs/etcd';
import { join } from 'path'

@Configuration({
  imports: [
    // ...
    etcd,
  ],
  // ...
})
export class MainConfiguration {
}
```



## 配置默认客户端

大部分情况下，我们可以只使用默认客户端来完成功能。

```typescript
// src/config/config.default.ts
export default {
  // ...
  etcd: {
    client: {
      host: [
        '127.0.0.1:2379'
      ]
    },
  },
}
```



## 使用默认客户端

配置完成后，我们就可以在代码中使用了。

```typescript
import { Provide } from '@midwayjs/decorator';
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

更多 API 请参考 ts 定义或者 [官网文档](https://microsoft.github.io/etcd3/classes/etcd3.html)。



## 多实例配置

```typescript
// src/config/config.default.ts
export default {
  // ...
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



## 多实例获取

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
    // ...
    
    const instance2 = this.etcdServiceFactory.get('instance2');
    // ...
  }
}
```



## 动态创建实例

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
    // ...
  }
}
```

