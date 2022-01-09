---
title: Consul
---

consul 用于微服务下的服务治理，主要特点有：服务发现、服务配置、健康检查、键值存储、安全服务通信、多数据中心等。

本文介绍了如何用 consul 作为 midway 的服务注册发现中心，以及如何使用 consul 来做软负载的功能。

感谢 [boostbob](https://github.com/boostbob) 提供的组件。

效果如下图：

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617690430023-1749c2da-14f3-4064-9388-b3e15669d7a2.png#height=494&id=zSztd&margin=%5Bobject%20Object%5D&name=image.png&originHeight=988&originWidth=3144&originalType=binary&ratio=1&size=245867&status=done&style=none&width=1572" width="1572" />

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617690444687-cf583ac5-82ec-4f31-a528-772491964184.png#height=937&id=X6FNK&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1874&originWidth=3140&originalType=binary&ratio=1&size=682382&status=done&style=none&width=1570" width="1570" />

## 安装组件

首先安装 consul 的组件：

```bash
npm i @midwayjs/consul -S
npm i @types/consul -D
```

## 目前支持的能力

- 注册能力（可选）
- 在停止服务的时候反注册（可选）
- 服务选择（随机）
- 暴露原始的 consul 对象

## 使用方法：

```typescript
import * as consul from '@midwayjs/consul';

@Configuration({
  imports: [consul],
  importConfigs: [join(__dirname, 'config')],
})
export class ContainerConfiguration {}
```

配置 `config.default.ts`  文件：

```typescript
config.consul = {
  provider: {
    // 注册本服务
    register: true,
    // 应用正常下线反注册
    deregister: true,
    // consul server 主机
    host: '192.168.0.10', // 此处修改 consul server 的地址
    // consul server 端口
    port: 8500, // 端口也需要进行修改
    // 调用服务的策略(默认选取 random 具有随机性)
    strategy: 'random',
  },
  service: {
    address: '127.0.0.1', // 此处是当前这个 midway 应用的地址
    port: 7001, // midway应用的端口
    tags: ['tag1', 'tag2'], // 做泳道隔离等使用
    name: 'my-midway-project',
    // others consul service definition
  },
};
```

然后启动 midway 项目，然后同时打开我们 consul server 的 ui 地址：
就呈现了如下效果：

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617690430023-1749c2da-14f3-4064-9388-b3e15669d7a2.png#height=494&id=N82Ws&margin=%5Bobject%20Object%5D&name=image.png&originHeight=988&originWidth=3144&originalType=binary&ratio=1&size=245867&status=done&style=none&width=1572" width="1572" />

相当于我们的 my-midway-project 项目注册上来了。

然后我们停止我们的 midway 项目。

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617690952779-9b4b5293-47ca-4379-a7cb-2e1033785fc2.png#height=417&id=1RHPp&margin=%5Bobject%20Object%5D&name=image.png&originHeight=834&originWidth=3122&originalType=binary&ratio=1&size=280981&status=done&style=none&width=1561" width="1561" />

我们可以看到我们项目的状态就变为红色了。

我们演示多台的情况，如下表现：（1 台在线+1 台不在线）

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617691097036-3484b9c1-0825-4890-a275-59140ca57f1b.png#height=420&id=dW4kg&margin=%5Bobject%20Object%5D&name=image.png&originHeight=840&originWidth=3108&originalType=binary&ratio=1&size=293770&status=done&style=none&width=1554" width="1554" />

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617691111593-4ef18594-179e-45bf-ac34-8bd16839a13b.png#height=369&id=AnxNA&margin=%5Bobject%20Object%5D&name=image.png&originHeight=738&originWidth=3076&originalType=binary&ratio=1&size=419244&status=done&style=none&width=1538" width="1538" />

## 作为客户端

例如我们作为客户端 A，需要调用服务 B 的接口，然后我们首先是查出 B 健康的服务，然后进行 http 请求。

此处为了方便理解，我们模拟查询刚刚注册的成功的服务：

```typescript
import { Controller, Get, Inject, Provide } from '@midwayjs/decorator';
import { BalancerService } from '@midwayjs/consul';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  balancerService: BalancerService;

  @Get('/')
  async home() {
    const service = await this.balancerService.getServiceBalancer().select('my-midway-project');
    console.log(service);
    return 'Hello Midwayjs!';
  }
}
```

然后我们看到 14 行打印的这个 service 的内容了：

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

此时，我们只要通过 Address 和 ServicePort 去连接服务 B，比如做 http 请求。

查询不健康的：

```typescript
import { Controller, Get, Inject, Provide } from '@midwayjs/decorator';
import { BalancerService } from '@midwayjs/consul';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  balancerService: BalancerService;

  @Get('/')
  async home() {
    const service = await this.balancerService.getServiceBalancer().select('my-midway-project', false);

    console.log(service);

    return 'Hello Midwayjs!';
  }
}
```

13 行，第二个参数是不健康的表现。

## 配置中心

同时 consul 也能作为一个服务配置的地方，如下代码：

```typescript
import { Controller, Get, Inject, Provide } from '@midwayjs/decorator';
import * as Consul from 'consul';

@Provide()
@Controller('/')
export class HomeController {
  @Inject('consul:consul')
  consul: Consul.Consul;

  @Get('/')
  async home() {
    await this.consul.kv.set(`name`, `juhai`);
    // let res = await this.consul.kv.get(`name`);
    // console.log(res);
    return 'Hello Midwayjs!';
  }
}
```

第 13 行，比如我们调用 set 方法，我们可以设置对应的配置，然后我们 14 行也可以拿到对应的配置。

注意：在代码中，有同学出现，在每次请求中去 get 对应的配置，这时你的 QPS 多少对 consul server 的压力。

所以在 QPS 比较大的情况，可以如下处理：

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
    setInterval(() => {
      this.consul.kv.get(`name`).then((res) => {
        this.config = res;
      });
    }, 5000);
    this.config = await this.consul.kv.get(`name`);
  }

  async getConfig() {
    return this.config;
  }
}
```

上面的代码，相当于定时去获取对应的配置，当每个请求进来的时候，获取 Scope 为 ScopeEnum.Singleton 服务的 `getConfig`  方法，这样每 5s 一次获取请求，就减少了对服务的压力。

Consul 界面上如下图：

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617703213009-850f48b3-e3ef-4036-bb8e-c7999986e668.png#height=391&id=4ccIQ&margin=%5Bobject%20Object%5D&name=image.png&originHeight=782&originWidth=3140&originalType=binary&ratio=1&size=193680&status=done&style=none&width=1570" width="1570" />

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617703225726-5e069b9d-cddd-4777-9a42-df4a1d30443d.png#height=619&id=1jAvc&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1238&originWidth=2784&originalType=binary&ratio=1&size=213448&status=done&style=none&width=1392" width="1392" />

一共提供如下几种方法：

- [get](https://www.npmjs.com/package/consul#kv-get)，获取对应 key 的 value
- [keys](https://www.npmjs.com/package/consul#kv-keys)，查询某个 prefix 的 key 的列表
- [set](https://www.npmjs.com/package/consul#kv-set)，设置对应的 key 的值
- [del](https://www.npmjs.com/package/consul#kv-del)，删除对应的 key

## 其他说明

这样的好处，就是 A->B，B 也可以进行扩展，并且可以通过 tags 做泳道隔离。例如做单元隔离等。并且可以通过 ServiceWeights 做对应的权重控制。

consul 还能做 Key/Value 的配置中心的作用，这个后续我们考虑支持。

## 搭建 Consul 测试服务

下面描述了单机版本的 consul 搭建流程。

```bash
docker run -itd -P consul
```

然后执行 `docker ps`

```bash
➜  my_consul_app docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                                                                                                                                                                                    NAMES
1b2d5b8771cb        consul              "docker-entrypoint.s…"   4 seconds ago       Up 2 seconds        0.0.0.0:32782->8300/tcp, 0.0.0.0:32776->8301/udp, 0.0.0.0:32781->8301/tcp, 0.0.0.0:32775->8302/udp, 0.0.0.0:32780->8302/tcp, 0.0.0.0:32779->8500/tcp, 0.0.0.0:32774->8600/udp, 0.0.0.0:32778->8600/tcp   cocky_wing
```

然后我们打开 8500 所对应的端口：（上图比如我的对应端口是 32779）

[http://127.0.0.1:32779/ui/](http://127.0.0.1:32779/ui/dc1/kv)

打开后效果如下：

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617690430023-1749c2da-14f3-4064-9388-b3e15669d7a2.png#height=494&id=pZQL5&margin=%5Bobject%20Object%5D&name=image.png&originHeight=988&originWidth=3144&originalType=binary&ratio=1&size=245867&status=done&style=none&width=1572" width="1572" />

然后我们的 `config.default.ts`  中的 port 就是 32779 端口。

## 常用问题

### 下线服务

如果想要手动将 consul 界面上不需要的服务给下线掉，可以通过下面的方法：

```typescript
import { Controller, Get, Inject, Provide } from '@midwayjs/decorator';
import * as Consul from 'consul';

@Provide()
@Controller('/')
export class HomeController {
  @Inject('consul:consul')
  consul: Consul.Consul;

  @Get('/222')
  async home2() {
    let res = await this.consul.agent.service.deregister(`my-midway-project:30.10.72.195:7002`);
    console.log(res);
    return 'Hello Midwayjs2!';
  }
}
```

13 行的 deregister 里面，就是对应 consul 界面上的名字了：

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1617707700852-c21f6855-e587-4b1c-affb-b96dc576ff4a.png#height=577&id=IgPIB&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1154&originWidth=3724&originalType=binary&ratio=1&size=836136&status=done&style=none&width=1862" width="1862" />
