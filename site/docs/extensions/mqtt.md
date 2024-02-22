# MQTT

MQTT是用于物联网 (IoT) 的OASIS标准消息传递协议。它被设计为非常轻量级的发布/订阅消息传输，非常适合以较小的代码占用空间和最小的网络带宽连接远程设备。MQTT目前广泛应用于汽车、制造、电信、石油和天然气等行业。

相关信息：

| 描述              |              |
| ----------------- | ------------ |
| 可用于标准项目    | ✅            |
| 可用于 Serverless | 可以发布消息 |
| 可用于一体化      | ✅            |
| 包含独立主框架    | ✅            |
| 包含独立日志      | ✅            |



## 版本要求

由于 [mqtt](https://github.com/mqttjs/MQTT.js) 库本身的要求，所需要的版本为 **Node.js >= 16**



## 前置依赖

由于 MQTT 需要 Broker 作为中转传输，你需要自行部署 MQTT Broker 服务，本文档不提供 MQTT 服务本身的部署指导。



## 安装组件


安装 mqtt 组件。


```bash
$ npm i @midwayjs/mqtt@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/mqtt": "^3.0.0",
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```



## 启用组件

在 `src/configuration.ts` 中引入组件

```typescript
// ...
import * as mqtt from '@midwayjs/mqtt';

@Configuration({
  imports: [
    // ...other components
    mqtt,
  ],
})
export class MainConfiguration {}
```



由于 MQTT 分为 **订阅者（subscriber）** 和 **发布者（publisher）**两部分，两个可以独立使用，我们将分别介绍。



## 订阅服务

### 基础配置

通过 `sub` 字段和 `@MqttSubscriber` 装饰器，我们可以配置多个订阅者。

比如，下面的 `sub1` 和 `sub2` 就是两个不同的订阅者。

```typescript
// src/config/config.default

export default {
  mqtt: {
    sub: {
      sub1: {
        // ...
      },
      sub2: {
        // ...
      }
    }
  }
}
```

最简单的订阅者配置需要几个字段，订阅的地址和订阅的 Topic。

```typescript
// src/config/config.default

export default {
  mqtt: {
    sub: {
      sub1: {
        connectOptions: {
          host: 'test.mosquitto.org',
          port: 1883,
        },
        subscribeOptions: {
          topicObject: 'test',
        },
      },
      sub2: {
        // ...
      }
    }
  }
}
```

 `sub1` 订阅者配置了 `connectOptions` 和 `subscribeOptions` ，分别代表连接配置和订阅配置。

### 订阅实现

我们可以在目录中提供一个标准的订阅器实现，比如 `src/consumer/sub1.subscriber.ts`。

```typescript
// src/consumer/sub1.subscriber.ts

import { ILogger, Inject } from '@midwayjs/core';
import { Context, IMqttSubscriber, MqttSubscriber } from '@midwayjs/mqtt';

@MqttSubscriber('test')
export class Sub1Subscriber implements IMqttSubscriber {

  @Inject()
  ctx: Context;

  async subscribe() {
    // ...
  }
}
```

`@MqttSubscriber` 装饰器声明了一个订阅类实现，它的参数为订阅者的名字，比如我们配置文件中的 `sub1`。

`IMqttSubscriber` 接口约定了一个 `subscribe` 方法，每当接收到新的消息时，这个方法就会被执行。

和其他消息订阅机制一样，消息本身通过 `Context` 字段来传递。

```typescript
// ...
export class Sub1Subscriber implements IMqttSubscriber {
  @Inject()
  ctx: Context;

  async subscribe() {
    const payload = this.ctx.message.toString();
    // ...
  }
}
```

`Context` 字段包括几个 mqtt 属性。

| 属性        | 类型                           | 描述             |
| ----------- | ------------------------------ | ---------------- |
| ctx.topic   | string                         | 订阅 Topic       |
| ctx.message | Buffer                         | 消息内容         |
| ctx.packet  | IPublishPacket（来自 mqtt 库） | publish 的包信息 |



## 消息发布

### 基础配置

消息发布也需要创建实例，配置本身使用了 [服务工厂](/docs/service_factory) 的设计模式。

比如多实例配置如下：

```typescript
// src/config/config.default

export default {
  mqtt: {
    pub: {
      clients: {
        default: {
          host: 'test.mosquitto.org',
          port: 1883,
        },
        pub2: {
          // ...
        }
      }
    }
  }
}
```

上面的配置创建了名为 `default` 和 `pub2` 的两个实例。



### 使用发布者

如果实例名为 `default` ，则可以使用默认的消息发布类。

比如：

```typescript
// src/service/user.service.ts
import { Provide, Inject } from '@midwayjs/core';
import { DefaultMqttProducer } from '@midwayjs/mqtt';

@Provide()
export class UserService {
  
  @Inject()
  producer: DefaultMqttProducer;
  
  async invoke() {
    // 同步发布消息
    this.producer.publish('test', 'hello world');
    
    // 异步发布
    await this.producer.publishAsync('test', 'hello world');
    
    // 增加配置
    await this.producer.publishAsync('test', 'hello world', {
      qos: 2
    });
  }
}
```

也可以使用内置的工厂类 `MqttProducerFactory` 注入不同的实例。

```typescript
// src/service/user.service.ts
import { Provide, Inject } from '@midwayjs/core';
import { MqttProducerFactory, DefaultMqttProducer } from '@midwayjs/mqtt';

@Provide()
export class UserService {
  
  @InjectClient(MqttProducerFactory, 'pub2')
  producer: DefaultMqttProducer;
  
  async invoke() {
    // ...
  }
}
```



## 组件日志

组件有着自己的日志，默认会将 `ctx.logger` 记录在 `midway-mqtt.log` 中。

我们可以单独配置这个 logger 对象。

```typescript
export default {
  midwayLogger: {
    // ...
    mqttLogger: {
      fileLogName: 'midway-mqtt.log',
    },
  }
}
```

这个日志的输出格式，我们也可以单独配置。

```typescript
export default {
  mqtt: {
    // ...
    contextLoggerFormat: info => {
      const { jobId, from } = info.ctx;
      return `${info.timestamp} ${info.LEVEL} ${info.pid} ${info.message}`;
    },
  }
}
```

