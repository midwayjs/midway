# Consul

consul 用于微服务下的服务治理，主要特点有：服务发现、服务配置、健康检查、键值存储、安全服务通信、多数据中心等。

本文介绍了如何用 consul 作为 midway 的服务注册发现中心，以及如何使用 consul来做软负载的功能。



相关信息：

| 描述                 |      |
| -------------------- | ---- |
| 可作为主框架独立使用 | ❌    |
| 包含自定义日志       | ❌    |
| 可独立添加中间件     | ❌    |




感谢 [boostbob](https://github.com/boostbob) 提供的组件。


效果如下图：
![image.png](https://img.alicdn.com/imgextra/i3/O1CN01e5cFZx1I0draeZynr_!!6000000000831-2-tps-1500-471.png)

![image.png](https://img.alicdn.com/imgextra/i2/O1CN01iLYF8r1HQ0B3b47Fh_!!6000000000751-2-tps-1500-895.png)


## 安装组件

首先安装 consul 组件和类型：

```bash
$ npm i @midwayjs/consul@3 -S
$ npm i @types/consul -D
```


## 目前支持的能力

- 注册能力（可选）
- 在停止服务的时候反注册（可选）
- 服务选择（随机）
- 暴露原始的 consul 对象


## 使用方法：
```typescript
import * as consul from '@midwayjs/consul'

@Configuration({
  imports: [
    consul
  ],
  importConfigs: [join(__dirname, 'config')]
})
export class ContainerConfiguration {}
```


配置 `config.default.ts` 文件：
```typescript
config.consul =  {
  provider: {
    // 注册本服务
    register: true,
    // 应用正常下线反注册
    deregister: true,
    // consul server 主机
    host: '192.168.0.10',				// 此处修改 consul server 的地址
    // consul server 端口
    port: 8500,									// 端口也需要进行修改
    // 调用服务的策略(默认选取 random 具有随机性)
    strategy: 'random',
  },
  service: {
    address: '127.0.0.1',				// 此处是当前这个 midway 应用的地址
    port: 7001,									// midway应用的端口
    tags: ['tag1', 'tag2'],			// 做泳道隔离等使用
    name: 'my-midway-project'
    // others consul service definition
  }
}
```

然后启动 midway 项目，然后同时打开我们 consul server 的 ui 地址：
就呈现了如下效果：

![image.png](https://img.alicdn.com/imgextra/i1/O1CN01QI7A1d1dU3ECG8QxQ_!!6000000003738-2-tps-1500-471.png)

可以观察到 my-midway-project 项目已经注册完毕。

假如停止我们的 midway 项目。

![image.png](https://img.alicdn.com/imgextra/i3/O1CN01EDocUO1TIvRvpxXbw_!!6000000002360-2-tps-1500-401.png)

我们可以看到我们项目的状态就变为红色。

我们演示多台的情况，如下表现：（1台在线+1台不在线）

![image.png](https://img.alicdn.com/imgextra/i1/O1CN01kfmul91eSxu5EiJE3_!!6000000003871-2-tps-1500-405.png)

![image.png](https://img.alicdn.com/imgextra/i4/O1CN01PZrdpp21Sir5n3y9I_!!6000000006984-2-tps-1500-360.png)



## 作为客户端

例如我们作为客户端 A，需要调用服务 B 的接口，然后我们首先是查出 B 健康的服务，然后进行 http 请求。


此处为了方便理解，我们模拟查询刚刚注册的成功的服务：
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
输出的 service 的内容为：
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


如果需要查询不健康的，则 `select` 方法的第二个参数传入 false 值：
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
    await this.consul.kv.set(`name`, `juhai`)
    // let res = await this.consul.kv.get(`name`);
    // console.log(res);
    return 'Hello Midwayjs!';
  }
}

```
我们调用 `kv.set` 方法，我们可以设置对应的配置，通过 `kv.get`  方法可以拿到对应的配置。


注意：在代码中，有同学出现，在每次请求中去 get 对应的配置，这时你的 QPS 多少对 consul server 的压力。


所以在QPS比较大的情况，可以如下处理：
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
  async init(){
    setInterval(()=>{
      this.consul.kv.get(`name`).then(res=>{
        this.config = res;
      })
    }, 5000);
    this.config = await this.consul.kv.get(`name`);
  }

  async getConfig(){
    return this.config;
  }
}

```
上面的代码，相当于定时去获取对应的配置，当每个请求进来的时候，获取 Scope 为 ScopeEnum.Singleton 服务的 `getConfig` 方法，这样每5s一次获取请求，就减少了对服务的压力。

Consul 界面上如下图：

![image.png](https://img.alicdn.com/imgextra/i4/O1CN01V3P6uK1rIVs19JiWn_!!6000000005608-2-tps-1500-374.png)

![image.png](https://img.alicdn.com/imgextra/i2/O1CN014O2GyH1sMvIhmlbs4_!!6000000005753-2-tps-1500-667.png)


一共提供如下几种方法：

- [get](https://www.npmjs.com/package/consul#kv-get)，获取对应key的value
- [keys](https://www.npmjs.com/package/consul#kv-keys)，查询某个prefix的key的列表
- [set](https://www.npmjs.com/package/consul#kv-set)，设置对应的key的值
- [del](https://www.npmjs.com/package/consul#kv-del)，删除对应的key



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

![](https://img.alicdn.com/imgextra/i2/O1CN014O2GyH1sMvIhmlbs4_!!6000000005753-2-tps-1500-667.png)

然后我们的 `config.default.ts`  中的port就是 32779 端口。



## 下线服务
如果想要手动将consul界面上不需要的服务给下线掉，可以通过下面的方法：
```typescript
import { Controller, Get, Inject, Provide } from '@midwayjs/decorator';
import * as Consul from 'consul'

@Provide()
@Controller('/')
export class HomeController {

  @Inject('consul:consul')
  consul: Consul.Consul;

  @Get("/222")
  async home2(){
    let res = await this.consul.agent.service.deregister(`my-midway-project:30.10.72.195:7002`);
    console.log(res);
    
    // ...
  }

}

```
`deregister` 方法，对应 consul 界面上的名字。

![image.png](https://img.alicdn.com/imgextra/i2/O1CN01d5QMUJ1DULTKPSJsr_!!6000000000219-2-tps-1500-465.png)