# Consul

consul 用于微服务下的服务治理，主要特点有：服务发现、服务配置、健康检查、键值存储、安全服务通信、多数据中心等。

本文介绍了如何用 consul 作为 midway 的服务注册发现中心。

相关信息：

| 描述              |     |
| ----------------- | --- |
| 可用于标准项目    | ✅  |
| 可用于 Serverless | ❌  |
| 可用于一体化      | ✅  |
| 包含独立主框架    | ❌  |
| 包含独立日志      | ❌  |

感谢 [boostbob](https://github.com/boostbob),[flyingCrp](https://github.com/flyingCrp) 完善和维护组件。

效果如下图：
![image.png](https://img.alicdn.com/imgextra/i3/O1CN01e5cFZx1I0draeZynr_!!6000000000831-2-tps-1500-471.png)

![image.png](https://img.alicdn.com/imgextra/i2/O1CN01iLYF8r1HQ0B3b47Fh_!!6000000000751-2-tps-1500-895.png)

## 安装组件

首先安装 consul 组件和类型：

```bash
$ npm i @midwayjs/consul@3 --save
$ npm i @types/consul --save-dev
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/consul": "^3.0.0"
  },
  "devDependencies": {
    "@types/consul": "^0.40.0"
  }
}
```

## 目前支持的能力

- 注册能力（可选）
- 在停止服务的时候反注册（可选）
- 服务选择（随机）
- 暴露原始的 consul 对象

## 启用组件

```typescript
import * as consul from '@midwayjs/consul';

@Configuration({
  imports: [
    // ..
    consul,
  ],
  importConfigs: [join(__dirname, 'config')],
})
export class MainConfiguration {}
```

## 配置文件

配置 `config.default.ts` 文件：

```typescript
// src/config/config.default
export default {
  // ...
  consul: {
    // {可选}, 默认是 undefined
    // 如果需要将应用注册到consul,则需要配置该选项,如果仅作为客户端使用,则不需要配置
    // 完整可用配置请查看 https://github.com/silas/node-consul#consulagentserviceregisteroptions
    register: {
      address: '127.0.0.1',
      port: 7001,
      //服务名称,默认使用package.json中的name
      name: 'SERVICE_NAME',
      //服务ID,默认为 `name:address:port`
      id: 'SERVICE_ID',
    },
    //{必填},consul服务端配置,可用参数:https://github.com/silas/node-consul#consuloptions
    options: {
      host: '127.0.0.1',
      port: '8500',
      defaults:{
          token:'566e93b6-0740-54ff-3a3a-ecb3f5479859'
      }
    },
    //{可选},默认为true,会在应用停止时自动反注册
    deregister: true,
  },
};
```
其中:
>`options`与[node-consul-初始化参数](https://github.com/silas/node-consul#common-method-call-options) 保持一致;
>
>`register`与[node-consul-注册参数](https://github.com/silas/node-consul#consulagentserviceregisteroptions) 保持一致;



打开我们 consul server 的 ui 地址，效果如下：

![image.png](https://img.alicdn.com/imgextra/i1/O1CN01QI7A1d1dU3ECG8QxQ_!!6000000003738-2-tps-1500-471.png)

可以观察到 my-midway-project 项目已经注册完毕。

假如停止我们的 midway 项目。

![image.png](https://img.alicdn.com/imgextra/i3/O1CN01EDocUO1TIvRvpxXbw_!!6000000002360-2-tps-1500-401.png)

我们可以看到我们项目的状态就变为红色。

我们演示多台的情况，如下表现：（1 台在线+1 台不在线）

![image.png](https://img.alicdn.com/imgextra/i1/O1CN01kfmul91eSxu5EiJE3_!!6000000003871-2-tps-1500-405.png)

![image.png](https://img.alicdn.com/imgextra/i4/O1CN01PZrdpp21Sir5n3y9I_!!6000000006984-2-tps-1500-360.png)

## 作为客户端

例如我们作为客户端 A，需要调用服务 B 的接口，然后我们首先是查出 B 健康的服务，然后进行 http 请求。

此处为了方便理解，我们模拟查询刚刚注册的成功的服务：

```typescript
import { Controller, Get, Inject, Provide } from '@midwayjs/core';
import { ConsulService } from '@midwayjs/consul';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  consulSrv: ConsulService;

  @Get('/')
  async home() {
    const service = await this.consulSrv.select('my-midway-project');
    console.log(service);
  }
}
```

输出的 [service 结构](https://developer.hashicorp.com/consul/api-docs/catalog#sample-response-3)：

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

此时，我们只要通过 `ServiceAddress` 和 `ServicePort` 去连接服务 B,如果`ServiceAddress`为空则应该使用`Address`,比如做 http 请求。

## 配置中心(KV Store)

同时 consul 也能作为一个服务配置的地方，如下代码：

```typescript
import { Controller, Get, Inject } from '@midwayjs/core';
import { ConsulService } from '@midwayjs/consul';

@Controller('/')
export class HomeController {
  @Inject()
  consulSrv: ConsulService;

  @Get('/')
  async home() {
    await this.consulSrv.consul.kv.set(`name`, `Hello Midwayjs!`);
    // let res = await this.consulSrv.kv.get(`name`);
    // console.log(res.Value);
    return 'Hello Midwayjs!';
  }
}
```

我们调用 `kv.set` 方法，我们可以设置对应的配置，通过 `kv.get` 方法可以拿到对应的配置。

注意：在代码中，有同学出现，在每次请求中去 get 对应的配置，这时你的 QPS 多少对 Consul server 的压力。

所以在 QPS 比较大的情况，可以如下处理：

```typescript
import { Init, Inject, Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { ConsulService } from '@midwayjs/consul';

@Provide()
@Scope(ScopeEnum.Singleton)
export class ConfigService {
  @Inject()
  consulSrv: ConsulService;

  config: any;

  @Init()
  async init() {
    setInterval(() => {
      this.consulSrv.consul.kv.get(`name`).then((res) => {
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

上面的代码，相当于定时去获取对应的配置，当每个请求进来的时候，获取 Scope 为 ScopeEnum.Singleton 服务的 `getConfig` 方法，这样每 5s 一次获取请求，就减少了对服务的压力。

Consul 界面上如下图：

![image.png](https://img.alicdn.com/imgextra/i4/O1CN01V3P6uK1rIVs19JiWn_!!6000000005608-2-tps-1500-374.png)

![image.png](https://img.alicdn.com/imgextra/i2/O1CN014O2GyH1sMvIhmlbs4_!!6000000005753-2-tps-1500-667.png)

一共提供如下几种方法：

- [get](https://www.npmjs.com/package/consul#kv-get)，获取对应 key 的 value
- [keys](https://www.npmjs.com/package/consul#kv-keys)，查询某个 prefix 的 key 的列表
- [set](https://www.npmjs.com/package/consul#kv-set)，设置对应的 key 的值
- [del](https://www.npmjs.com/package/consul#kv-del)，删除对应的 key

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

然后我们的 `config.default.ts` 中的 port 就是 32779 端口。

## 下线服务

如果想要手动将 consul 界面上不需要的服务给下线掉，可以通过下面的方法：

```typescript
import { Controller, Get, Inject, Provide } from '@midwayjs/core';
import { ConsulService } from '@midwayjs/consul';

@Provide()
@Controller('/')
export class HomeController {
    @Inject()
    consulSrv: ConsulService;

  @Get('/222')
  async home2() {
    let res = await this.consulSrv.consul.agent.service.deregister(`my-midway-project:30.10.72.195:7002`);
    console.log(res);

    // ...
  }
}
```

`deregister` 方法，对应 consul 界面上的名字。

![image.png](https://img.alicdn.com/imgextra/i2/O1CN01d5QMUJ1DULTKPSJsr_!!6000000000219-2-tps-1500-465.png)
