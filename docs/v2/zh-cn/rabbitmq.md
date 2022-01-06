---
title: RabbitMQ
---

在复杂系统的架构中，会有负责处理消息队列的微服务，如下图：服务 A 负责产生消息给消息队列，而服务 B 则负责消费消息队列中的任务。

<img src="https://cdn.nlark.com/yuque/0/2021/png/187105/1610433906644-871308e0-01de-4f33-a9b2-b9c53fc362be.png#crop=0&crop=0&crop=1&crop=1&height=174&id=im7Ob&margin=%5Bobject%20Object%5D&name=image.png&originHeight=251&originWidth=646&originalType=binary&ratio=1&rotation=0&showTitle=false&size=26456&status=done&style=none&title=&width=448" width="448" />

在 Midway 中，我们提供了订阅 rabbitMQ 的能力，专门来满足用户的这类需求。
​

## 基础概念

RabbitMQ 的概念较为复杂，其基于高级消息队列协议即 Advanced Message Queuing Protocol（AMQP），如果第一次接触请阅读一下相关的参考文档。
​

AMQP 有一些概念，Queue、Exchange 和 Binding 构成了 AMQP 协议的核心，包括：

- Producer：消息生产者，即投递消息的程序。
- Broker：消息队列服务器实体。
  - Exchange：消息交换机，它指定消息按什么规则，路由到哪个队列。
  - Binding：绑定，它的作用就是把 Exchange 和 Queue 按照路由规则绑定起来。
  - Queue：消息队列载体，每个消息都会被投入到一个或多个队列。
- Consumer：消息消费者，即接受消息的程序。

​

​

简单的理解，消息通过 Publisher 发布到 Exchange（交换机），Consumer 通过订阅 Queue 来接受消息，Exchange 和 Queue 通过路由做连接。
​

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1623914924280-ad0d2f20-018f-4d5e-9825-1120c52c747f.png#clientId=u2ace4f48-26d7-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=328&id=uaa4f930a&margin=%5Bobject%20Object%5D&name=image.png&originHeight=328&originWidth=700&originalType=binary&ratio=1&rotation=0&showTitle=false&size=59458&status=done&style=none&taskId=ua324994f-d9b2-414c-960a-d20c5824834&title=&width=700" width="700" />

​

​

​

## 消费者（Consumer）使用方法

### 安装依赖

Midway 提供了订阅 rabbitMQ 的能力，并能够独立部署和使用。安装 `@midwayjs/rabbitmq`  模块及其定义。

```bash
$ npm i @midwayjs/rabbitmq amqplib --save
$ npm i @types/amqplib --save-dev
```

### 入口函数

和 Web 一样，创建一个入口文件，指定 Framework 即可。

```typescript
// server.js
const { Bootstrap } = require('@midwayjs/bootstrap');
const RabbitMQFramework = require('@midwayjs/rabbitmq').Framework;

const rabbitMQFramework = new RabbitMQFramework().configure({
  url: 'amqp://localhost',
});

Bootstrap.load(rabbitMQFramework).run();
```

整个启动的配置为：

```typescript
export type IMidwayRabbitMQConfigurationOptions = {
  url: string | Options.Connect;
  socketOptions?: any;
  reconnectTime?: number;
};
```

| url           | rabbitMQ 的连接信息              |
| ------------- | -------------------------------- |
| socketOptions | amqplib.connect 的第二个参数     |
| reconnectTime | 队列断连后的重试时间，默认 10 秒 |

### 订阅 rabbitMQ

我们一般把能力分为生产者和消费者，而订阅正是消费者的能力。

我们一般把消费者放在 consumer 目录。比如 `src/consumer/userConsumer.ts`  。

```
➜  my_midway_app tree
.
├── src
│   ├── consumer
│   │   └── userConsumer.ts
│   ├── interface.ts
│   └── service
│       └── userService.ts
├── test
├── package.json
└── tsconfig.json
```

代码示例如下。

```typescript
import { Provide, Consumer, MSListenerType, RabbitMQListener, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/rabbitmq';
import { ConsumeMessage } from 'amqplib';

@Provide()
@Consumer(MSListenerType.RABBITMQ)
export class UserConsumer {
  @Inject()
  ctx: Context;

  @RabbitMQListener('tasks')
  async gotData(msg: ConsumeMessage) {
    this.ctx.channel.ack(msg);
  }
}
```

`@Consumer`  装饰器，提供消费者标识，并且它的参数，指定了某种消费框架的类型，比如，我们这里指定了 `MSListenerType.RABBITMQ`  这个类型，指的就是 rabbitMQ 类型。

标识了 `@Consumer`  的类，对方法使用 `@RabbitMQListener`  装饰器后，可以绑定一个 RabbitMQ 的队列（Queue)。

方法的参数为接收到的消息，类型为 `ConsumeMessage` 。如果返回值需要确认，则需要对服务端进行 `ack`  操作，明确接收到的数据。

如果需要订阅多个队列，可以使用多个方法，也可以使用多个文件。

### RabbitMQ 消息上下文

订阅 `RabbitMQ`  数据的上下文，和 Web 同样的，其中包含一个 `requestContext` ，和每次接收消息的数据绑定。

从 ctx 上可以取到 `channel` ，整个 ctx 的定义为：

```typescript
export type Context = {
  channel: amqp.Channel;
  requestContext: IMidwayContainer;
};
```

可以从框架获取定义

```typescript
import { Context } from '@midwayjs/rabbitmq';
```

### Fanout Exchange

Fanout 是一种特定的交换机，如果满足匹配（binding），就往 Exchange 所绑定的 Queue 发送消息。Fanout Exchange 会忽略 RoutingKey 的设置，直接将 Message 广播到所有绑定的 Queue 中。
​

即所有订阅该交换机的 Queue 都会收到消息。
​

比如，下面我们添加了两个 Queue，订阅了相同的交换机。

```typescript
import { Provide, Consumer, MSListenerType, RabbitMQListener, Inject, App } from '@midwayjs/decorator';
import { Context, Application } from '@midwayjs/rabbitmq';
import { ConsumeMessage } from 'amqplib';

@Provide()
@Consumer(MSListenerType.RABBITMQ)
export class UserConsumer {
  @App()
  app: Application;

  @Inject()
  ctx: Context;

  @Inject()
  logger;

  @RabbitMQListener('abc', {
    exchange: 'logs',
    exchangeOptions: {
      type: 'fanout',
      durable: false,
    },
    exclusive: true,
    consumeOptions: {
      noAck: true,
    },
  })
  async gotData(msg: ConsumeMessage) {
    this.logger.info('test output1 =>', msg.content.toString('utf8'));
    // TODO
  }

  @RabbitMQListener('bcd', {
    exchange: 'logs',
    exchangeOptions: {
      type: 'fanout',
      durable: false,
    },
    exclusive: true,
    consumeOptions: {
      noAck: true,
    },
  })
  async gotData2(msg: ConsumeMessage) {
    this.logger.info('test output2 =>', msg.content.toString('utf8'));
    // TODO
  }
}
```

订阅的 abc 和 bcd 队列，绑定了相同的交换机 logs，最终的结果是，两个方法都会被调用。
​

### Direct Exchange

Direct Exchange 是 RabbitMQ 默认的 Exchange，完全根据 RoutingKey 来路由消息。设置 Exchange 和 Queue 的 Binding 时需指定 RoutingKey（一般为 Queue Name），发消息时也指定一样的 RoutingKey，消息就会被路由到对应的 Queue。
​

​

下面的示例代码，我们不填写 Queue Name，只添加一个 routingKey，交换机类型为 direct。

```typescript
import { Provide, Consumer, MSListenerType, RabbitMQListener, Inject, App } from '@midwayjs/decorator';
import { Context, Application } from '../../../../../src';
import { ConsumeMessage } from 'amqplib';

@Provide()
@Consumer(MSListenerType.RABBITMQ)
export class UserConsumer {
  @App()
  app: Application;

  @Inject()
  ctx: Context;

  @Inject()
  logger;

  @RabbitMQListener('', {
    exchange: 'direct_logs',
    exchangeOptions: {
      type: 'direct',
      durable: false,
    },
    routingKey: 'direct_key',
    exclusive: true,
    consumeOptions: {
      noAck: true,
    },
  })
  async gotData(msg: ConsumeMessage) {
    // TODO
  }
}
```

direct 类型的消息，会根据 routerKey 做定向过滤，所以只有特定订阅能收到消息。
​

​

### 装饰器参数

`@RabbitMQListener` 装饰器的第一个参数为 queueName，代表需要监听的队列。
​

第二个参数是一个对象，包含队列，交换机等参数，详细定义如下：

```typescript
export interface RabbitMQListenerOptions {
  exchange?: string;
  /**
   * queue options
   */
  exclusive?: boolean;
  durable?: boolean;
  autoDelete?: boolean;
  messageTtl?: number;
  expires?: number;
  deadLetterExchange?: string;
  deadLetterRoutingKey?: string;
  maxLength?: number;
  maxPriority?: number;
  pattern?: string;
  /**
   * prefetch
   */
  prefetch?: number;
  /**
   * router
   */
  routingKey?: string;
  /**
   * exchange options
   */
  exchangeOptions?: {
    type?: 'direct' | 'topic' | 'headers' | 'fanout' | 'match' | string;
    durable?: boolean;
    internal?: boolean;
    autoDelete?: boolean;
    alternateExchange?: string;
    arguments?: any;
  };
  /**
   * consumeOptions
   */
  consumeOptions?: {
    consumerTag?: string;
    noLocal?: boolean;
    noAck?: boolean;
    exclusive?: boolean;
    priority?: number;
    arguments?: any;
  };
}
```

### 本地测试

Midway 提供了一个简单的测试方法用于测试订阅某个数据。 `@midwayjs/mock` 工具提供了一个 `createRabbitMQProducer` 的方法，用于创建一个生产者，通过它，你可以创建一个队列（Queue），以及向这个队列发消息。

然后，我们启动一个 app，就可以自动监听到这个队列中的数据，并执行后续逻辑。

```typescript
import { createRabbitMQProducer, closeApp, creatApp } from '@midwayjs/mock';

describe('/test/index.test.ts', () => {
  it('should test create message and get from app', async () => {
    // create a queue and channel
    const channel = await createRabbitMQProducer('tasks', {
      isConfirmChannel: true,
      mock: false,
      url: 'amqp://localhost',
    });

    // send data to queue
    channel.sendToQueue('tasks', Buffer.from('something to do'));

    // create app and got data
    const app = await creatApp('base-app', { url: 'amqp://localhost' });
    await closeApp(app);
  });
});
```

**示例一**
​

创建一个 fanout exchange。

```typescript
const manager = await createRabbitMQProducer('tasks-fanout', {
  isConfirmChannel: false,
  mock: false,
  url: 'amqp://localhost',
});

// Name of the exchange
const ex = 'logs';
// Write a message
const msg = 'Hello World!';

// 声明交换机
manager.assertExchange(ex, 'fanout', { durable: false }); // 'fanout' will broadcast all messages to all the queues it knows

// 启动服务
const app = await creatApp('base-app-fanout', {
  url: 'amqp://localhost',
  reconnectTime: 2000,
});

// 发送到交换机，由于不持久化，需要等订阅服务起来之后再发
manager.sendToExchange(ex, '', Buffer.from(msg));

// 等一段时间
await sleep(5000);

// 校验结果

// 关闭 producer
await manager.close();

// 关闭 app
await closeApp(app);
```

**示例二**
**​**

创建一个 direct exchange。

```typescript
/**
 * direct 类型的消息，根据 routerKey 做定向过滤
 */
const manager = await createRabbitMQProducer('tasks-direct', {
  isConfirmChannel: false,
  mock: false,
  url: 'amqp://localhost',
});

// Name of the exchange
const ex = 'direct_logs';
// Write a message
const msg = 'Hello World!';

// 声明交换机
manager.assertExchange(ex, 'direct', { durable: false }); // 'fanout' will broadcast all messages to all the queues it knows

const app = await creatApp('base-app-direct', {
  url: 'amqp://localhost',
  reconnectTime: 2000,
});

// 这里指定 routerKey，发送到交换机
manager.sendToExchange(ex, 'direct_key', Buffer.from(msg));

// 校验结果

await manager.close();
await closeApp(app);
```

​

## 生产者（Producer）使用方法

生产者（Producer）也就是第一节中的消息产生者，简单的来说就是会创建一个客户端，将消息发送到 RabbitMQ 服务。
​

注意：当前 Midway 并没有使用组件来支持消息发送，这里展示的示例只是使用纯 SDK 在 Midway 中的写法。
​

### 安装依赖

```bash
$ npm i amqplib amqp-connection-manager --save
$ npm i @types/amqplib --save-dev
```

### 调用服务发送消息

比如，我们在 service 文件下，新增一个 `rabbitmq.ts`  文件。

```typescript
import { Provide, Scope, ScopeEnum, Init, Autoload, Destroy } from '@midwayjs/decorator';
import * as amqp from 'amqp-connection-manager';

@Autoload()
@Provide()
@Scope(ScopeEnum.Singleton) // Singleton 单例，全局唯一（进程级别）
export class RabbitmqService {
  private connection: amqp.AmqpConnectionManager;

  private channelWrapper;

  @Init()
  async connect() {
    // 创建连接，你可以把配置放在 Config 中，然后注入进来
    this.connection = await amqp.connect('amqp://localhost');

    // 创建 channel
    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: function (channel) {
        return Promise.all([
          // 绑定队列
          channel.assertQueue('tasks', { durable: true }),
        ]);
      },
    });
  }

  // 发送消息
  public async sendToQueue(queueName: string, data: any) {
    return this.channelWrapper.sendToQueue(queueName, data);
  }

  @Destroy()
  async close() {
    await this.channelWrapper.close();
    await this.connection.close();
  }
}
```

大概就是创建了一个用来封装消息通信的 service，同时他是全局唯一的 Singleton 单例。由于增加了 `@AutoLoad` 装饰器，可以自执行初始化。
​

这样基础的调用服务就抽象好了，我们只需要在用到的地方，调用 `sendToQueue` 方法即可。
​

比如：
​

```typescript
@Provide()
export class UserService {
  @Inject()
  rabbitmqService: RabbitmqService;

  async invoke() {
    // TODO

    // 发送消息
    await this.rabbitmqService.sendToQueue('tasks', { hello: 'world' });
  }
}
```

​

## 参考文档

- [理解 RabbitMQ Exchange](https://zhuanlan.zhihu.com/p/37198933)
- [RabbitMQ for Node.js in 30 steps](https://github.com/Gurenax/node-rabbitmq)
