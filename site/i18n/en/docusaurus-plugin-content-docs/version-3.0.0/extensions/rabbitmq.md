# RabbitMQ

In the architecture of a complex system, there will be microservices responsible for processing message queues, as shown in the following figure: service A is responsible for generating messages to the message queue, while service B is responsible for consuming tasks in the message queue.

![image.png](https://img.alicdn.com/imgextra/i3/O1CN01SYMbCz1moVSVLl7S2_!!6000000005001-2-tps-646-251.png)

In Midway, we provide the ability to subscribe to rabbitMQ specifically to meet such needs of users.

Related information:

**Subscribe to service**

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ❌ |
| Can be used for integration | ✅ |
| Contains independent main framework | ✅ |
| Contains independent logs | ❌ |



## Basic concept


The concept of RabbitMQ is more complicated. It is based on the Advanced Message Queuing Protocol, that is, the Advanced Message Queuing Protocol(AMQP). Please read the relevant reference documents for the first time.


AMQP has some concepts. Queue, Exchange and Binding form the core of AMQP protocol, including:

- Producer: message producer, that is, the program that delivers messages.
- Broker: Message Queuing Server Entity.
   - Exchange: Message Switch, which specifies which rules the message is routed to and to which queue.
   - Binding: Binding, its function is to bind Exchange and Queue according to routing rules.
   - Queue: Message queue carrier, where each message is put into one or more queues.
- Consumer: Message consumer, that is, the program that accepts messages.



Simply understand, messages are published to Exchange (switches) through Publisher, Consumer receive messages by subscribing to Queue, and Exchange and Queue are connected through routing.


![image.png](https://img.alicdn.com/imgextra/i3/O1CN01fLrucw1FVNbCx4NqG_!!6000000000492-2-tps-700-328.png)



## Consumer (Consumer) Usage


### Installation dependency


Midway provides the ability to subscribe to rabbitMQ and can be deployed and used independently. Install the `@midwayjs/rabbitmq` module and its definition.
```bash
$ npm i @midwayjs/rabbitmq@3 --save
$ npm i amqplib --save
$ npm i @types/amqplib --save-dev
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/rabbitmq": "^3.0.0",
    "amqplib": "^0.10.1 ",
    // ...
  },
  "devDependencies": {
    "@types/amqplib": "^0.8.2 ",
    // ...
  }
}
```

## Open the component

`@midwayjs/rabbmitmq` can be used as a separate main framework.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as rabbitmq from '@midwayjs/rabbitmq';

@Configuration({
  imports: [
    rabbitmq
  ],
  // ...
})
export class MainConfiguration {
  async onReady() {
        // ...
  }
}
```

It can also be attached to other mainframes, such as `@midwayjs/koa` .

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as rabbitmq from '@midwayjs/rabbitmq';

@Configuration({
  imports: [
    koa,
    rabbitmq
  ],
  // ...
})
export class MainConfiguration {
  async onReady() {
        // ...
  }
}
```

### Directory structure


We generally divide capabilities into producers and consumers, and subscriptions are the capabilities of consumers.


We usually put consumers in consumer catalogues. For example, `src/consumer/userConsumer.ts`.
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
The code example is as follows.

```typescript
import { Consumer, MSListenerType, RabbitMQListener, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/rabbitmq';
import { ConsumeMessage } from 'amqplib';

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
`@Consumer` the decorator, which provides the consumer identity, and its parameters specify the type of a certain consumption framework. For example, we specify the type of `MSListenerType.RABBITMQ` here, which refers to the rabbitMQ type.


The class that identifies the `@Consumer` can bind a RabbitMQ queue after using the `@RabbitMQListener` decorator for the method.


The parameter of the method is the received message of type `ConsumeMessage`. If you need to confirm the returned value, you must perform the `ack` operation on the server to specify the received data.


If you need to subscribe to multiple queues, you can use multiple methods or multiple files.


### RabbitMQ message context


The context of the subscription `RabbitMQ` data is the same as that of the Web, which contains a `requestContext` and a data binding for each message received.


`channel` can be taken from ctx. The entire ctx is defined:
```typescript
export type Context = {
  channel: amqp.Channel;
  requestContext: IMidwayContainer;
};
```


You can get the definition from the framework
```typescript
import { Context } from '@midwayjs/rabbitmq';
```


### Configure consumers

We need to specify the address of rabbitmq in the configuration.

```typescript
// src/config/config.default
import { MidwayConfig } from '@midwayjs/core';

export default {
  // ...
  rabbitmq: {
    url: 'amqp://localhost'
  }
} as MidwayConfig;
```

More configurations:

| Property | Description |
| --- | --- |
| url | rabbitMQ connection information |
| socketOptions | amqplib. The second parameter of the connect |
| reconnectTime | Retry time after queue disconnection, default 10 seconds |



### Fanout Exchange


Fanout is a specific switch that sends a message to the Queue to which the Exchange is bound if a match (binding) is met. Fanout Exchange ignores the RoutingKey settings and broadcasts the Message directly to all bound Queue.

That is, all Queues subscribing to the switch will receive messages.

For example, we have added two Queue and subscribed to the same switch.
```typescript
import { Consumer, MSListenerType, RabbitMQListener, Inject, App } from '@midwayjs/core';
import { Context, Application } from '@midwayjs/rabbitmq';
import { ConsumeMessage } from 'amqplib';

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
      durable: false
    },
    exclusive: true,
    consumeOptions: {
      noAck: true,
    }
  })
  async gotData(msg: ConsumeMessage) {
    this.logger.info('test output1 =>', msg.content.toString('utf8'));
    // TODO
  }

  @RabbitMQListener('bcd', {
    exchange: 'logs',
    exchangeOptions: {
      type: 'fanout',
      durable: false
    },
    exclusive: true
    consumeOptions: {
      noAck: true
    }
  })
  async gotData2(msg: ConsumeMessage) {
    this.logger.info('test output2 =>', msg.content.toString('utf8'));
    // TODO
  }

}

```


The subscribed ABC and BCD queues are bound to the same switch logs. As a result, both methods will be called.


### Direct Exchange


Direct Exchange is the RabbitMQ default Exchange that routes messages based entirely on RoutingKey. When setting the Binding between Exchange and Queue, you need to specify the RoutingKey (usually Queue Name). When sending a message, you also specify the same RoutingKey, and the message will be routed to the corresponding Queue.


In the following sample code, we do not fill in Queue Name, only add a routingKey, and the switch type is direct.
```typescript
import { Consumer, MSListenerType, RabbitMQListener, Inject, App } from '@midwayjs/core';
import { Context, Application } from '../../../../../src';
import { ConsumeMessage } from 'amqplib';

@Consumer(MSListenerType.RABBITMQ)
export class UserConsumer {

  @App()
  app: Application;

  @Inject()
  ctx: Context;

  @Inject()
  logger;

  @RabbitMQListener ('', {
    exchange: 'direct_logs',
    exchangeOptions: {
      type: 'direct',
      durable: false
    },
    routingKey: 'direct_key',
    exclusive: true,
    consumeOptions: {
      noAck: true
    }
  })
  async gotData(msg: ConsumeMessage) {
    // TODO
  }
}

```


Direct messages are filtered according to routerKey, so only specific subscriptions can receive messages.




### Decorator parameters


The first parameter of the `@RabbitMQListener` decorator is queueName, which represents the queue to be listened.


The second parameter is an object, including queue, switch and other parameters. The detailed definition is as follows:
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
  exchangeOptions ?: {
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
  consumeOptions ?: {
    consumerTag?: string;
    noLocal?: boolean;
    noAck?: boolean;
    exclusive?: boolean;
    priority?: number;
    arguments?: any;
  }
}
```




### Local test


Midway provides a simple test method for testing subscriptions to a certain data.  The `@midwayjs/mock` tool provides a `createRabbitMQProducer` method for creating a producer through which you can create a queue and send messages to the queue.


Then, we start an app to automatically listen to the data in this queue and execute subsequent logic.

```typescript
import { createRabbitMQProducer, close, creatApp } from '@midwayjs/mock';

describe('/test/index.test.ts', () => {
  it('should test create message and get from app', async () => {
    // create a queue and channel
    const channel = await createRabbitMQProducer('tasks', {
      isConfirmChannel: true
      mock: false
      url: 'amqp://localhost',
    });

    // send data to queue
    channel.sendToQueue('tasks', Buffer.from('something to do'))

    // create app and got data
    const app = await creatApp();

    // wait a moment

    await close(app);
  });
});

```


**Example 1**


Create a fanout exchange.
```typescript
const manager = await createRabbitMQProducer('tasks-fanout', {
  isConfirmChannel: false
  mock: false
  url: 'amqp://localhost',
});

// Name of the exchange
const ex = 'logs';
// Write a message
const msg = "Hello World!";

// Declare Switch
manager.assertExchange(ex, 'fanout', { durable: false }) // 'fanout' will broadcast all messages to all the queues it knows

// Start the service
const app = await creatApp('base-app-fanout', {
  url: 'amqp://localhost',
  reconnectTime: 2000
});

// Sent to the switch, because it is not persistent, you need to wait until the subscription service is up before sending it.
manager.sendToExchange(ex, '', Buffer.from(msg))

// Wait for a while
await sleep(5000);

// Check result

// Close producer
await manager.close();

// Close app
await close(app);
```


**Example 2**


Create a direct exchange.
```typescript
/**
  * direct type messages, targeted filtering according to routerKey
  */
const manager = await createRabbitMQProducer('tasks-direct', {
  isConfirmChannel: false
  mock: false
  url: 'amqp://localhost',
});

// Name of the exchange
const ex = 'direct_logs';
// Write a message
const msg = "Hello World!";

// Declare Switch
manager.assertExchange(ex, 'direct', { durable: false }) // 'fanout' will broadcast all messages to all the queues it knows

const app = await creatApp('base-app-direct', {
  url: 'amqp://localhost',
  reconnectTime: 2000
});

// Specify the routerKey here and send it to the switch
manager.sendToExchange(ex, 'direct_key', Buffer.from(msg))

// Check result

await manager.close();
await close(app);
```


## Producer  Usage Method


The producer (Producer), that is, the message producer in the first section, simply creates a client to send the message to the RabbitMQ service.


Note: Currently Midway does not use components to support message sending, the examples shown here are just written in Midway using pure SDK.


### Installation dependency


```bash
$ npm i amqplib amqp-connection-manager --save
$ npm i @types/amqplib --save-dev
```


### Call the service to send a message


For example, we add a `rabbitmq.ts` file under the service file.
```typescript
import { Provide, Scope, ScopeEnum, Init, Autoload, Destroy } from '@midwayjs/core';
import * as amqp from 'amqp-connection-manager'

@Autoload()
@Provide()
@Scope(ScopeEnum.Singleton) // Singleton singleton, globally unique (process level)
export class RabbitmqService {

  private connection: amqp.AmqpConnectionManager;

  private channelWrapper;

  @Init()
  async connect() {
    // To create a connection, you can put the configuration in Config and inject it into it.
    this.connection = await amqp.connect('amqp://localhost');

    // Create channel
    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: function(channel) {
        return Promise.all ([
          // Binding queue
        	channel.assertQueue("tasks", { durable: true })
        ]);
      }
    });
  }

  // Send a message
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
Probably created a service to encapsulate message communication, and it is the only Singleton singleton in the world. Due to the addition of `@AutoLoad` decorator, initialization can be self-executed.


In this way, the basic calling service is abstract. We only need to call `sendToQueue` method where it is used.


For example:


```typescript
@Provide()
export class UserService {

  @Inject()
  rabbitmqService: RabbitmqService;

	async invoke() {
    // TODO

    // Send a message
  	await this.rabbitmqService.sendToQueue('tasks', {hello: 'world'});
  }
}
```


## Reference document


- [Understanding RabbitMQ Exchange](https://zhuanlan.zhihu.com/p/37198933)
- [RabbitMQ for Node.js in 30 steps](https://github.com/Gurenax/node-rabbitmq)
