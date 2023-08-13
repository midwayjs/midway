# Kafka

在复杂系统的架构中，事件流是很重要的一环，包括从事件源中(数据库、传感器、移动设备等)以事件流的方式去实时捕获数据，持久化事件流方便检索，并实时和回顾操作处理响应事件流。

应用于支付和金融交易、实施跟踪和监控汽车等行业信息流动、捕获分析物联网数据等等。


在 Midway中，我们提供了订阅 Kafka 的能力，专门来满足用户的这类需求。

相关信息：

**订阅服务**

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ❌    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ✅     |
| 包含独立日志      | ❌    |



## 基础概念


分布式流处理平台
* 发布订阅（流）信息
* 容错（故障转移）存储信息（流），存储事件流
* 在消息流发生的时候进行处理，处理事件流

理解Producer（生产者）

* 发布消息到一个主题或多个 topic (主题)。

理解 Consumer（主题消费者）
* 订阅一个或者多个 topic,并处理产生的信息。

理解 Stream API
* 充当一个流处理器，从 1 个或多个 topic 消费输入流，并生产一个输出流到1个或多个输出 topic，有效地将输入流转换到输出流。

理解 Broker
* 已发布的消息保存在一组服务器中，称之为 Kafka 集群。集群中的每一个服务器都是一个代理（Broker）。 消费者可以订阅一个或多个主题（topic），并从Broker拉数据，从而消费这些已发布的消息。


![image.png](https://kafka.apache.org/images/streams-and-tables-p1_p4.png)



## 消费者（Consumer）使用方法


### 安装依赖


Midway 提供了订阅 Kafka 的能力，并能够独立部署和使用。安装 `@midwayjs/kafka` 模块及其定义。
```bash
$ npm i @midwayjs/kafka --save
$ npm i kafkajs --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/kafka": "^3.0.0",
    "kafka": "^2.0.0",
    // ...
  }
}
```

## 开启组件

`@midwayjs/kafka` 可以作为独立主框架使用。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as kafka from '@midwayjs/kafka';

@Configuration({
  imports: [
    kafka
  ],
  // ...
})
export class MainConfiguration {
  async onReady() {
        // ...
  }
}
```

也可以附加在其他的主框架下，比如 `@midwayjs/koa` 。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as kafka from '@midwayjs/kafka';

@Configuration({
  imports: [
    koa,
    kafka
  ],
  // ...
})
export class MainConfiguration {
  async onReady() {
        // ...
  }
}
```

### 目录结构


我们一般把能力分为生产者和消费者，而订阅正是消费者的能力。


我们一般把消费者放在 consumer 目录。比如 `src/consumer/userConsumer.ts`  。
```
➜  my_midway_app tree
.
├── src
│   ├── consumer
│   │   └── user.consumer.ts
│   ├── interface.ts
│   └── service
│       └── user.service.ts
├── test
├── package.json
└── tsconfig.json
```
代码示例如下。

```typescript
@Provide()
@Consumer(MSListenerType.KAFKA)
export class UserConsumer {

  @Inject()
  ctx: IMidwayKafkaContext;

  @Inject()
  logger;

  @KafkaListener('topic-test')
  async gotData(message: KafkaMessage) {
    this.logger.info('test output =>', message.offset + ' ' + message.key + ' ' + message.value.toString('utf8'));
  }
}
```
`@Consumer` 装饰器，提供消费者标识，并且它的参数，指定了某种消费框架的类型，比如，我们这里指定了 `MSListenerType.KFAKA` 这个类型，指的就是 kafka 类型。


标识了 `@Consumer` 的类，对方法使用 `@KafkaListener` 装饰器后，可以绑定一个topic。


方法的参数为接收到的消息，类型为 `ConsumeMessage` 。默认设置了自动确认，什么时候设置手动确认？当出现异常的时候，需要设置commitOffsets偏移到异常的位置，用于重新执行消费。

如果需要订阅多个topic，可以使用多个方法，也可以使用多个文件。


### Kafka 消息上下文


订阅 `Kafka` 数据的上下文，和 Web 同样的，其中包含一个 `requestContext` ，和每次接收消息的数据绑定。

整个 ctx 的定义为：
```typescript
export type Context = {
  requestContext: IMidwayContainer;
};
```


可以从框架获取定义
```typescript
import { Context } from '@midwayjs/kafka';
```


### 配置消费者

我们需要在配置中指定 kafka 的地址。

```typescript
// src/config/config.default
import { MidwayConfig } from '@midwayjs/core';

export default {
  // ...
  kafka: {
    kafkaConfig: {
      clientId: 'my-app',
      brokers: [process.env.KAFKA_URL || 'localhost:9092'],
    },
    consumerConfig: {
      groupId: 'groupId-test'
    }
  },
} as MidwayConfig;
```

更多配置(更详细的配置，参考 https://kafka.js.org/docs/consuming)：

| 属性 | 描述 |
| --- | --- |
| kafkaConfig | kafka 的连接信息 |
| - clientId | 指定客户端ID |
| - brokers | Kafka集群brokers |
| consumerConfig | 消费者配置 |
| - groupId | 分组ID |



### Manual-committing

手动提交设置，组件默认是自动提交。

```typescript
import { Provide, Consumer, MSListenerType, Inject, App, KafkaListener } from '@midwayjs/core';
import { KafkaMessage } from 'kafkajs';
import { Context, Application } from '../../../../../src';

@Provide()
@Consumer(MSListenerType.KAFKA)
export class UserConsumer {

  @App()
  app: Application;

  @Inject()
  ctx: Context;

  @Inject()
  logger;

  @KafkaListener('topic-test0', {
    subscription: {
      fromBeginning: false,
    },
    runConfig: {
      autoCommit: false,
    }
  })
  async gotData(message: KafkaMessage) {
    console.info('gotData info');
    this.logger.info('test output =>', message.offset + ' ' + message.key + ' ' + message.value.toString('utf8'));
    try {
      // 抛出异常，当出现异常的时候，需要设置commitOffsets偏移到异常的位置，用于重新执行消费，所以这里应该出现的消费是2次，total为2
      throw new Error("error");
    } catch (error) {
      this.ctx.commitOffsets(message.offset);
    }
    this.app.setAttr('total', this.app.getAttr<number>('total') + 1);
  }
}
```

### Multi different Topic
订阅的 topic1 和 topic2， 两个主题的消费都会被调用。

```typescript
import { Provide, Consumer, MSListenerType, Inject, App, KafkaListener } from '@midwayjs/core';
import { KafkaMessage } from 'kafkajs';
import { Context, Application } from '../../../../../src';

@Provide()
@Consumer(MSListenerType.KAFKA)
export class UserConsumer {

  @App()
  app: Application;

  @Inject()
  ctx: Context;

  @Inject()
  logger;

  @KafkaListener('topic-test')
  async gotData(message: KafkaMessage) {
    console.info('gotData info');
    this.logger.info('test output =>', message.offset + ' ' + message.key + ' ' + message.value.toString('utf8'));
    this.app.setAttr('total', this.app.getAttr<number>('total') + 1);
  }

  @KafkaListener('topic-test2')
  async gotData2(message: KafkaMessage) {
    console.info('gotData2 info');
    this.logger.info('test output =>', message.offset + ' ' + message.key + ' ' + message.value.toString('utf8'));
    this.app.setAttr('total', this.app.getAttr<number>('total') + 1);
  }

}

```

### 装饰器参数


`@kafkaListener` 装饰器的第一个参数为 topic ，代表需要消费的主题。


第二个参数是一个对象，包含注册的配置`subscription`、运行的配置`runConfig`等参数，详细定义如下：

```typescript
export interface KafkaListenerOptions {
  propertyKey?: string;
  topic?: string;

  subscription?: ConsumerSubscribeTopics | ConsumerSubscribeTopic;
  runConfig?: ConsumerRunConfig;
}
```



**示例一**


创建一个手动提交，设置消费者在开始获取消息时将使用最新提交的偏移量`fromBeginning: false`，设置运行时的提交方式为手动提交`autoCommit: false`
```typeScript
import { Provide, Consumer, MSListenerType, Inject, App, KafkaListener } from '@midwayjs/core';
import { KafkaMessage } from 'kafkajs';
import { Context, Application } from '../../../../../src';

@Provide()
@Consumer(MSListenerType.KAFKA)
export class UserConsumer {

  @App()
  app: Application;

  @Inject()
  ctx: Context;

  @Inject()
  logger;

  @KafkaListener('topic-test0', {
    subscription: {
      fromBeginning: false,
    },
    runConfig: {
      autoCommit: false,
    }
  })
  async gotData(message: KafkaMessage) {
    console.info('gotData info');
    this.logger.info('test output =>', message.offset + ' ' + message.key + ' ' + message.value.toString('utf8'));
    try {
      // 抛出异常，当出现异常的时候，需要设置commitOffsets偏移到异常的位置，用于重新执行消费
      throw new Error("error");
    } catch (error) {
      this.ctx.commitOffsets(message.offset);
    }
  }
}

```




## 生产者（Producer）使用方法


生产者（Producer）也就是第一节中的消息生产者，简单的来说就是会创建一个客户端，将消息发送到 Kafka 服务。


注意：当前 Midway 并没有使用组件来支持消息发送，这里展示的示例只是使用纯 SDK 在 Midway 中的写法。


### 安装依赖


```bash
$ npm i kafkajs --save
```


### 调用服务发送消息


比如，我们在 service 文件下，新增一个 `kafka.ts` 文件。
```typescript
import {
  Provide,
  Scope,
  ScopeEnum,
  Init,
  Autoload,
  Destroy,
  Config,
} from '@midwayjs/core';
import { ProducerRecord } from 'kafkajs';
const { Kafka } = require('kafkajs');

@Autoload()
@Provide()
@Scope(ScopeEnum.Singleton) // Singleton 单例，全局唯一（进程级别）
export class KafkaService {
  @Config('kafka')
  kafkaConfig: any;

  private producer;

  @Init()
  async connect() {
    // 创建连接，你可以把配置放在 Config 中，然后注入进来
    const { brokers, clientId, producerConfig = {} } = this.kafkaConfig;
    const client = new Kafka({
      clientId: clientId,
      brokers: brokers,
    });
    this.producer = client.producer(producerConfig);
    await this.producer.connect();
  }

  // 发送消息
  public async send(producerRecord: ProducerRecord) {
    return this.producer.send(producerRecord);
  }

  @Destroy()
  async close() {
    await this.producer.disconnect();
  }
}

```
大概就是创建了一个用来封装消息通信的 service，同时他是全局唯一的 Singleton 单例。由于增加了 `@AutoLoad` 装饰器，可以自执行初始化。


这样基础的调用服务就抽象好了，我们只需要在用到的地方，调用 `send` 方法即可。


比如：


```typescript
@Provide()
export class UserService {

  @Inject()
  kafkaService: KafkaService;

  async invoke() {
    // TODO

    // 发送消息
    const result = this.kafkaService.send({
      topic: 'test',
      messages: [
        {
          value: JSON.stringify(messageValue),
        },
      ],
    });
  }
}
```


## 参考文档

- [KafkaJS](https://kafka.js.org/docs/introduction)
- [apache kafka官网](https://kafka.apache.org/intro)
