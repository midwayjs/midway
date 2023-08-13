# Kafka

In the architecture of complex systems, event flow is a very important part, including real-time capture of data from event sources (databases, sensors, mobile devices, etc.) in the form of event flow, persistence of event flow for easy retrieval, and real-time and review of operations to process response event flow.

It is used for payment and financial transactions, tracking and monitoring the flow of information in industries such as automobiles, capturing and analyzing Internet of Things data, and so on.


In Midway, we provide the ability to subscribe to Kafka to meet such needs of users.

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


Distributed stream processing platform
* Publish and subscribe (stream) information
* Fault tolerance (failover) Store information (flow), store event flow
* When the message flow occurs, handle the event flow.

Understanding Producer (Producer)

* Publish messages to one topic or topics.

Understanding Consumer (Subject Consumers)
* Subscribe to one or more topics and process the generated information.

Understand Stream API
* Act as a stream processor, consume input streams from one or more topics, and produce an output stream to one or more output topics, effectively converting the input stream to the output stream.

Understanding Broker
* Published messages are kept in a group of servers, called a Kafka cluster. Each server in the cluster is a broker. Consumers can consume these published messages by subscribing to one or more topics and pulling data from the Broker.


![image.png](https://kafka.apache.org/images/streams-and-tables-p1_p4.png)



## Consumer  Usage


### Installation dependency


Midway provides the ability to subscribe to Kafka and can be deployed and used independently. Install the `@midwayjs/kafka` module and its definition.
```bash
$ npm i @midwayjs/kafka@3 --save
$ npm i kafkajs --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/kafka": "^3.0.0",
    "kafka": "^2.0.0 ",
    // ...
  }
}
```

## Open the component

`@midwayjs/kafka` can be used as an independent main framework.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as kafka from '@midwayjs/kafka';

@Configuration({
  imports: [
    Kafka
  ],
  // ...
})
export class MainConfiguration {
  async onReady() {
        // ...
  }
}
```

It can also be attached to other main frameworks, such as `@midwayjs/koa`.

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

### Directory structure


We generally divide capabilities into producers and consumers, and subscriptions are the capabilities of consumers.


We usually put consumers in consumer catalogues. For example, `src/consumer/userConsumer.ts`.
```
➜ my_midway_app tree
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
@Provide()
@Consumer(MSListenerType.KAFKA)
export class UserConsumer {

  @Inject()
  ctx: IMidwayKafkaContext;

  @Inject()
  logger;

  @KafkaListener('topic-test')
  async gotData(message: KafkaMessage) {
    this.logger.info('test output =>', message.offset + '' + message.key + '' + message.value.toString('utf8'));
  }
}
```
The `@Consumer` decorator provides the consumer identifier, and its parameters specify the type of a certain consumption framework. For example, here we specify the `MSListenerType.KFAKA` type, which refers to the kafka type.


The class that identifies the `@Consumer` can bind a topic after using the `@KafkaListener` decorator for the method.


The parameter of the method is the received message of type `ConsumeMessage`. Automatic confirmation is set by default. When is manual confirmation set? When an exception occurs, it is necessary to set the commitOffsets offset to the abnormal position for re-consumption.

If you need to subscribe to multiple topics, you can use multiple methods or multiple files.


### Kafka message context


The context for subscribing to `Kafka` data is the same as the Web, which contains a `requestContext` and a data binding for each message received.

The entire ctx is defined:
```typescript
export type Context = {
  requestContext: IMidwayContainer;
};
```


You can get the definition from the framework
```typescript
import { Context } from '@midwayjs/kafka';
```


### Configure consumers

We need to specify the address of Kafka in the configuration.

```typescript
// src/config/config.default
import { MidwayConfig } from '@midwayjs/core';

export default {
  // ...
  kafka: {
    kafkaConfig: {
      clientId: 'my-app',
      brokers: [process.env.KAFKA_URL || 'localhost:9092']
    },
    consumerConfig: {
      groupId: 'groupId-test'
    }
  },
} as MidwayConfig;
```

More configurations (see https://kafka.js.org/docs/consuming for more detailed configurations):

| Property | Description |
| --- | --- |
| kafkaConfig | Kafka connection information |
| - clientId | Specify client ID |
| - brokers | Kafka cluster brokers |
| consumerConfig | Consumer Configuration |
| - groupId | Packet ID |



### Manual-committing

Manually submit settings. By default, components submit automatically.

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
      fromBeginning: false
    },
    runConfig: {
      autoCommit: false
    }
  })
  async gotData(message: KafkaMessage) {
    console.info('gotData info');
    this.logger.info('test output =>', message.offset + '' + message.key + '' + message.value.toString('utf8'));
    try {
      // Throws an exception. When an exception occurs, you need to set the commitOffsets offset to the location of the exception to re-execute the consumption, so the consumption that should occur here is 2 times, and the total is 2
      throw new Error("error");
    } catch (error) {
      this.ctx.commitOffsets(message.offset);
    }
    this.app.setAttr('total', this.app.getAttr<number>('total') + 1);
  }
}
```

### Multi different Topic
the subscription of topic1 and topic2, and the consumption of both topics are called.

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
    this.logger.info('test output =>', message.offset + '' + message.key + '' + message.value.toString('utf8'));
    this.app.setAttr('total', this.app.getAttr<number>('total') + 1);
  }

  @KafkaListener('topic-test2')
  async gotData2(message: KafkaMessage) {
    console.info('gotData2 info');
    this.logger.info('test output =>', message.offset + '' + message.key + '' + message.value.toString('utf8'));
    this.app.setAttr('total', this.app.getAttr<number>('total') + 1);
  }

}

```

### Decorator parameters


`@kafkaListener` the first parameter of the decorator is topic, which represents the topic to be consumed.


The second parameter is an object, including the registered configuration `subscription`, the running configuration `runConfig` and other parameters. The detailed definition is as follows:

```typescript
export interface KafkaListenerOptions {
  propertyKey?: string;
  topic?: string;

  subscription?: ConsumerSubscribeTopics | ConsumerSubscribeTopic;
  runConfig?: ConsumerRunConfig;
}
```



**Example 1**


Create a manual submission, set the offset of the latest submission to be used by the consumer when starting to get the message `fromBeginning: false`, and set the submission method at runtime to manual submission `autoCommit: false`
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
      fromBeginning: false
    },
    runConfig: {
      autoCommit: false
    }
  })
  async gotData(message: KafkaMessage) {
    console.info('gotData info');
    this.logger.info('test output =>', message.offset + '' + message.key + '' + message.value.toString('utf8'));
    try {
      // Throws an exception. When an exception occurs, you need to set the commitOffsets offset to the location of the exception to re-execute the consumption.
      throw new Error("error");
    } catch (error) {
      this.ctx.commitOffsets(message.offset);
    }
  }
}

```




## Producer Usage Method


The producer (Producer) is also the message producer in the first section. In short, it will create a client and send messages to the Kafka service.


Note: Midway currently does not use components to support message sending. The example shown here is only the writing method of pure SDK in Midway.


### Install dependencies


```bash
$ npm i kafkajs --save
```


### Call the service to send a message


For example, we add a `Kafka. ts` file under the service file.
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
@Scope(ScopeEnum.Singleton) // Singleton singleton, globally unique (process level)
export class KafkaService {
  @Config('kafka')
  kafkaConfig: any;

  private producer;

  @Init()
  async connect() {
    // To create a connection, you can put the configuration in Config and inject it into it.
    const { brokers, clientId, producerConfig = {} } = this.kafkaConfig;
    const client = new Kafka({
      clientId: clientId
      brokers: brokers
    });
    this.producer = client.producer(producerConfig);
    await this.producer.connect();
  }

  // Send a message
  public async send(producerRecord: ProducerRecord) {
    return this.producer.send(producerRecord);
  }

  @Destroy()
  async close() {
    await this.producer.disconnect();
  }
}

```
Probably created a service to encapsulate message communication, and it is the only Singleton singleton in the world. Due to the addition of `@AutoLoad` decorator, initialization can be self-executed.


In this way, the basic calling service is abstract. You only need to call the `send` method where it is used.


For example:


```typescript
@Provide()
export class UserService {

  @Inject()
  kafkaService: KafkaService;

  async invoke() {
    // TODO

    // Send a message
    const result = this.kafkaService.send({
      topic: 'test',
      messages: [
        {
          value: JSON.stringify(messageValue)
        },
      ],
    });
  }
}
```


## Reference document

- [KafkaJS](https://kafka.js.org/docs/introduction)
- [apache kafka official website](https://kafka.apache.org/intro)
