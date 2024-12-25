# Kafka

In the architecture of complex systems, event streams are a crucial part, including capturing data in real-time from event sources (databases, sensors, mobile devices, etc.) as event streams, persisting event streams for easy retrieval, and processing and responding to event streams in real-time and retrospectively.

Applicable to industries such as payment and financial transactions, implementing tracking and monitoring of automotive information flow, capturing and analyzing IoT data, etc.

In Midway, we provide the ability to subscribe to Kafka to meet such user needs.

Related Information:

**Subscription Service**

| Description       |      |
| ----------------- | ---- |
| Available for standard projects | ✅    |
| Available for Serverless | ❌    |
| Available for integrated projects | ✅    |
| Includes standalone main framework | ✅     |
| Includes standalone logging | ✅     |

## Basic Concepts

Distributed stream processing platform
* Publish-subscribe (stream) information
* Fault-tolerant (failover) storage of information (streams), storing event streams
* Process event streams as they occur

Understanding Producer

* Publish messages to one or more topics.

Understanding Consumer
* Subscribe to one or more topics and process the generated information.

Understanding Stream API
* Acts as a stream processor, consuming input streams from one or more topics and producing an output stream to one or more output topics, effectively transforming input streams into output streams.

Understanding Broker
* Published messages are stored in a set of servers called a Kafka cluster. Each server in the cluster is a broker. Consumers can subscribe to one or more topics and pull data from brokers to consume these published messages.

![image.png](https://kafka.apache.org/images/streams-and-tables-p1_p4.png)

:::tip
From v3.19, the Kafka component has been refactored, and the configuration and usage methods of the Kafka component have changed significantly from before. The original usage method is compatible, but the documentation is no longer retained.
:::

## Install Dependencies

Install the `@midwayjs/kafka` module.

```bash
$ npm i @midwayjs/kafka --save
```

Or add the following dependency to `package.json` and reinstall.

```json
{
  "dependencies": {
    "@midwayjs/kafka": "^3.0.0",
    // ...
  }
}
```

## Enable Component

`@midwayjs/kafka` can be used as a standalone main framework.

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

Since Kafka is divided into **Consumer** and **Producer** parts, both can be used independently, and we will introduce them separately.

## Consumer

### Directory Structure

We usually place consumers in the consumer directory, such as `src/consumer/user.consumer.ts`.
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

### Basic Configuration

We can configure multiple consumers through the `consumer` field and the `@KafkaConsumer` decorator.

For example, `sub1` and `sub2` below are two different consumers.

```typescript
// src/config/config.default
export default {
  kafka: {
    consumer: {
      sub1: {
        // ...
      },
      sub2: {
        // ...
      },
    }
  }
}
```

The simplest consumer configuration requires several fields: Kafka connection configuration, consumer configuration, and subscription configuration.

```typescript
// src/config/config.default
export default {
  kafka: {
    consumer: {
      sub1: {
        connectionOptions: {
          // ...
        },
        consumerOptions: {
          // ...
        },
        subscribeOptions: {
          // ...
        },
      },
    }
  }
}
```

For example:

```typescript
// src/config/config.default
export default {
  kafka: {
    consumer: {
      sub1: {
        connectionOptions: {
          clientId: 'my-app',
          brokers: ['localhost:9092'],
        },
        consumerOptions: {
          groupId: 'groupId-test-1',
        },
        subscribeOptions: {
          topics: ['topic-test-1'],
        }
      },
    }
  }
}
```

Complete configurable parameters include:

- `connectionOptions`: Kafka connection configuration, i.e., parameters for `new Kafka(consumerOptions)`
- `consumerOptions`: Kafka consumer configuration, i.e., parameters for `kafka.consumer(consumerOptions)`
- `subscribeOptions`: Kafka subscription configuration, i.e., parameters for `consumer.subscribe(subscribeOptions)`
- `consumerRunConfig`: Consumer run configuration, i.e., parameters for `consumer.run(consumerRunConfig)`

For detailed explanations of these parameters, refer to the [KafkaJS Consumer](https://kafka.js.org/docs/consuming) documentation.

### Reuse Kafka Instance

If you need to reuse a Kafka instance, you can specify it through the `kafkaInstanceRef` field.

```typescript
// src/config/config.default
export default {
  kafka: {
    consumer: {
      sub1: {
        connectionOptions: {
          clientId: 'my-app',
          brokers: ['localhost:9092'],
        },
        consumerOptions: {
          groupId: 'groupId-test-1',
        },
        subscribeOptions: {
          topics: ['topic-test-1'],
        }
      },
      sub2: {
        kafkaInstanceRef: 'sub1',
        consumerOptions: {
          groupId: 'groupId-test-2',
        },
        subscribeOptions: {
          topics: ['topic-test-2'],
        }
      }
    }
  }
}
```

Note that `sub1` and `sub2` above are two different consumers, but they share the same Kafka instance, and `sub2`'s `groupId` needs to be different from `sub1`.

The Kafka SDK writing is similar to the following:

```typescript
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
});

const consumer1 = kafka.consumer({ groupId: 'groupId-test-1' });
const consumer2 = kafka.consumer({ groupId: 'groupId-test-2' });
```

### Consumer Implementation

We can provide a standard consumer implementation in the directory, such as `src/consumer/sub1.consumer.ts`.

```typescript
// src/consumer/sub1.consumer.ts
import { KafkaConsumer, IKafkaConsumer, EachMessagePayload } from '@midwayjs/kafka';

@KafkaConsumer('sub1')
class Sub1Consumer implements IKafkaConsumer {
  async eachMessage(payload: EachMessagePayload) {
    // ...
  }
}
```

`sub1` is the consumer name, using the `sub1` consumer in the configuration.

You can also implement the `eachBatch` method to process batch messages.

```typescript
// src/consumer/sub1.consumer.ts
import { KafkaConsumer, IKafkaConsumer, EachBatchPayload } from '@midwayjs/kafka';

@KafkaConsumer('sub1')
class Sub1Consumer implements IKafkaConsumer {
  async eachBatch(payload: EachBatchPayload) {
    // ...
  }
}
```

### Message Context

Like other message subscription mechanisms, the message itself is passed through the `Context` field.

```typescript
// src/consumer/sub1.consumer.ts
import { KafkaConsumer, IKafkaConsumer, EachMessagePayload, Context } from '@midwayjs/kafka';
import { Inject } from '@midwayjs/core';

@KafkaConsumer('sub1')
class Sub1Consumer implements IKafkaConsumer {

  @Inject()
  ctx: Context;

  async eachMessage(payload: EachMessagePayload) {
    // ...
  }
}
```

The `Context` field includes several properties:

| Property     | Type                           | Description      |
| ------------ | ------------------------------ | ---------------- |
| ctx.payload  | EachMessagePayload, EachBatchPayload | Message content  |
| ctx.consumer | Consumer                       | Consumer instance |

You can call Kafka's API through `ctx.consumer`, such as `ctx.consumer.commitOffsets` to manually commit offsets or `ctx.consumer.pause` to pause consumption.

## Producer

### Basic Configuration

Service producers also need to create instances, and the configuration itself uses the [Service Factory](/docs/service_factory) design pattern.

The configuration is as follows:

```typescript
// src/config/config.default
export default {
  kafka: {
    producer: {
      clients: {
        pub1: {
          // ...
        },
        pub2: {
          // ...
        }
      }
    }
  }
}
```

Each Producer instance's configuration also includes `connectionOptions` and `producerOptions`.

```typescript
// src/config/config.default
export default {
  kafka: {
    producer: {
      clients: {
        pub1: {
          connectionOptions: {
            clientId: 'my-app',
            brokers: ['localhost:9092'],
          },
          producerOptions: {
            // ...
          }
        }
      }
    }
  }
}
```

For specific parameters, refer to the [KafkaJS Producer](https://kafka.js.org/docs/producing) documentation.

Additionally, since Kafka Consumer and Producer can both be created from the same Kafka instance, they can reuse the same Kafka instance.

If the Producer is created after the Consumer, it can also reuse the Kafka instance using the `kafkaInstanceRef` field.

```typescript
// src/config/config.default
export default {
  kafka: {
    consumer: {
      sub1: {
        connectionOptions: {
          clientId: 'my-app',
          brokers: ['localhost:9092'],
        },
      }
    },
    producer: {
      clients: {
        pub1: {
          kafkaInstanceRef: 'sub1',
        }
      }
    }
  }
}
```

### Using Producer

There is no default instance for Producer. Since the service factory design pattern is used, it can be injected through `@InjectClient()`.

```typescript
// src/service/user.service.ts
import { Provide, InjectClient } from '@midwayjs/core';
import { KafkaProducerFactory, Producer } from '@midwayjs/kafka';

@Provide()
export class UserService {
  
  @InjectClient(KafkaProducerFactory, 'pub1')
  producer: Producer;
  
  async invoke() {
    await this.producer.send({
      topic: 'topic-test-1',
      messages: [{ key: 'message-key1', value: 'hello consumer 11 !' }],
    });
  }
}
```

## Admin

Kafka's Admin functionality can be used to create, delete, view topics, view configurations, and ACLs, etc.

### Basic Configuration

Like Producer, Admin also uses the service factory design pattern.

```typescript
// src/config/config.default
export default {
  kafka: {
    admin: {
      clients: {
        admin1: {
          // ...
        }
      }
    }
  }
}
```

Similarly, Admin can also reuse the Kafka instance.

```typescript
// src/config/config.default
export default {
  kafka: {
    consumer: {
      sub1: {
        connectionOptions: {
          clientId: 'my-app',
          brokers: ['localhost:9092'],
        },
      }
    },
    admin: {
      clients: {
        admin1: {
          kafkaInstanceRef: 'sub1',
        }
      }
    }
  }
}
```

### Using Admin

There is no default instance for Admin. Since the service factory design pattern is used, it can be injected through `@InjectClient()`.

```typescript
// src/service/admin.service.ts
import { Provide, InjectClient } from '@midwayjs/core';
import { KafkaAdminFactory, Admin } from '@midwayjs/kafka';

@Provide()
export class AdminService {
  
  @InjectClient(KafkaAdminFactory, 'admin1')
  admin: Admin;
}
```

For more Admin usage methods, refer to the [KafkaJS Admin](https://kafka.js.org/docs/admin) documentation.

## Component Logging

The Kafka component uses the `kafkaLogger` log by default, which will record `ctx.logger` in `midway-kafka.log`.

You can modify it through configuration.

```typescript
// src/config/config.default
export default {
  midwayLogger: {
    clients: {
      kafkaLogger: {
        fileLogName: 'midway-kafka.log',
      },
    },
  },
}
```

The output format of this log can also be configured separately.

```typescript
export default {
  kafka: {
    // ...
    contextLoggerFormat: info => {
      const { jobId, from } = info.ctx;
      return `${info.timestamp} ${info.LEVEL} ${info.pid} ${info.message}`;
    },
  }
}
```

## Access KafkaJS Module

The KafkaJS module can be accessed through the `KafkaJS` field of `@midwayjs/kafka`.

```typescript
import { KafkaJS } from '@midwayjs/kafka';

const { ConfigResourceTypes } = KafkaJS;
// ...
```

## Warning About Partitions

If you are using KafkaJS version v2.0.0, you may see the following warning:

```
2024-11-04 23:47:28.228 WARN 31729 KafkaJS v2.0.0 switched default partitioner. To retain the same partitioning behavior as in previous versions, create the producer with the option "createPartitioner: Partitioners.LegacyPartitioner". See the migration guide at https://kafka.js.org/docs/migration-guide-v2.0.0#producer-new-default-partitioner for details. Silence this warning by setting the environment variable "KAFKAJS_NO_PARTITIONER_WARNING=1" { timestamp: '2024-11-04T15:47:28.228Z', logger: 'kafkajs' }
```

This warning is due to KafkaJS version v2.0.0 using a new partitioner by default. If you accept the new partitioner behavior but want to turn off this warning message, you can eliminate this warning by setting the environment variable `KAFKAJS_NO_PARTITIONER_WARNING=1`.

Or explicitly declare the partitioner.

```typescript
// src/config/config.default
import { KafkaJS } from '@midwayjs/kafka';
const { Partitioners } = KafkaJS;

export default {
  kafka: {
    producer: {
      clients: {
        pub1: {
          // ...
          producerOptions: {
            createPartitioner: Partitioners.DefaultPartitioner,
            // ...
            createPartitioner: Partitioners.LegacyPartitioner,
          },
        },
      },
    },
  }
}
```

It is recommended to check the KafkaJS v2.0.0 [migration guide](https://kafka.js.org/docs/migration-guide-v2.0.0#producer-new-default-partitioner) for more details.

## Reference Documentation

- [KafkaJS](https://kafka.js.org/docs/introduction)
- [Apache Kafka Official Website](https://kafka.apache.org/intro)
