# MQTT

MQTT is an OASIS standard messaging protocol for the Internet of Things (IoT). It is designed as an extremely lightweight publish/subscribe messaging transport that is ideal for connecting remote devices with a small code footprint and minimal network bandwidth. MQTT today is used in a wide variety of industries, such as automotive, manufacturing, telecommunications, oil and gas, etc.

Related Information:

| Description                     |                      |
| ------------------------------- | -------------------- |
| Available for standard projects | ✅                    |
| Can be used for Serverless      | Can publish messages |
| Available for integration       | ✅                    |
| Contains independent main frame | ✅                    |
| Contains independent log        | ✅                    |



## Version requirements

Due to the requirements of the [mqtt](https://github.com/mqttjs/MQTT.js) library itself, the required version is **Node.js >= 16**



## Prerequisites

Since MQTT requires Broker as a transit transport, you need to deploy the MQTT Broker service yourself. This document does not provide deployment guidance for the MQTT service itself.



## Install components


Install the mqtt component.


```bash
$ npm i @midwayjs/mqtt@3 --save
```

Or add the following dependencies in `package.json` and reinstall.

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



## Enable component

Introduce components in `src/configuration.ts`

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



Since MQTT is divided into two parts: **subscriber** and **publisher**, the two can be used independently, and we will introduce them separately.



## Subscription service

### Basic configuration

Through the `sub` field and the `@MqttSubscriber` decorator, we can configure multiple subscribers.

For example, `sub1` and `sub2` below are two different subscribers.

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

The simplest subscriber configuration requires several fields, the subscribed address and the subscribed Topic.

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

  The `sub1` subscriber is configured with `connectOptions` and `subscribeOptions`, which represent connection configuration and subscription configuration respectively.

### Subscription implementation

We can provide a standard subscriber implementation in a directory, such as `src/consumer/sub1.subscriber.ts`.

```typescript
// src/consumer/sub1.subscriber.ts

import { ILogger, Inject } from '@midwayjs/core';
import { Context, IMqttSubscriber, MqttSubscriber } from '@midwayjs/mqtt';

@MqttSubscriber('sub1')
export class Sub1Subscriber implements IMqttSubscriber {

   @Inject()
   ctx: Context;

   async subscribe() {
     // ...
   }
}
```

The `@MqttSubscriber` decorator declares a subscription class implementation, and its parameter is the name of the subscriber, such as `sub1` in our configuration file.

The `IMqttSubscriber` interface specifies a `subscribe` method, which will be executed whenever a new message is received.

Like other message subscription mechanisms, the message itself is passed through the `Context` field.

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

The `Context` field includes several mqtt properties.

| Properties  | Type                               | Description                 |
| ----------- | ---------------------------------- | --------------------------- |
| ctx.topic   | string                             | Subscribe to Topic          |
| ctx.message | Buffer                             | Message content             |
| ctx.packet  | IPublishPacket (from mqtt library) | publish package information |



## Message publish

### Basic configuration

Message publishing also requires the creation of instances, and the configuration itself uses the [Service Factory](/docs/service_factory) design pattern.

For example, the multi-instance configuration is as follows:

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

The above configuration creates two instances named `default` and `pub2`.



### Use publisher

If the instance name is `default`, the default message publishing class can be used.

for example:

```typescript
// src/service/user.service.ts
import { Provide, Inject } from '@midwayjs/core';
import { DefaultMqttProducer } from '@midwayjs/mqtt';

@Provide()
export class UserService {
  
   @Inject()
   producer: DefaultMqttProducer;
  
   async invoke() {
     // Publish messages synchronously
     this.producer.publish('test', 'hello world');
    
     //Asynchronous release
     await this.producer.publishAsync('test', 'hello world');
    
     //Add configuration
     await this.producer.publishAsync('test', 'hello world', {
       qos: 2
     });
   }
}
```

You can also use the built-in factory class `MqttProducerFactory` to inject different instances.

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



## Component log

The component has its own log, and `ctx.logger` will be recorded in `midway-mqtt.log` by default.

We can configure this logger object separately.

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

We can also configure the output format of this log separately.

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
