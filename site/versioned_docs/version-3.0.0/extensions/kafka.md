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
| 包含独立日志      | ✅     |



## 基础概念


分布式流处理平台
* 发布订阅（流）信息
* 容错（故障转移）存储信息（流），存储事件流
* 在消息流发生的时候进行处理，处理事件流

理解 Producer（生产者）

* 发布消息到一个主题或多个 topic (主题)。

理解 Consumer（主题消费者）
* 订阅一个或者多个 topic,并处理产生的信息。

理解 Stream API
* 充当一个流处理器，从 1 个或多个 topic 消费输入流，并生产一个输出流到1个或多个输出 topic，有效地将输入流转换到输出流。

理解 Broker
* 已发布的消息保存在一组服务器中，称之为 Kafka 集群。集群中的每一个服务器都是一个代理（Broker）。 消费者可以订阅一个或多个主题（topic），并从Broker拉数据，从而消费这些已发布的消息。


![image.png](https://kafka.apache.org/images/streams-and-tables-p1_p4.png)

:::tip
从 v3.19 开始，Kafka 组件做了一次重构，Kafka 组件的配置、使用方法和之前都有较大差异，原有使用方式兼容，但是文档不再保留。
:::


## 安装依赖


安装 `@midwayjs/kafka` 模块。

```bash
$ npm i @midwayjs/kafka --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/kafka": "^3.0.0",
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

由于 Kafka 分为 **消费者（Consumer）** 和 **生产者（Producer）** 两部分，两个可以独立使用，我们将分别介绍。

## 消费者（Consumer）

### 目录结构


我们一般把消费者放在 consumer 目录。比如 `src/consumer/user.consumer.ts`  。
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


### 基础配置

通过 `consumer` 字段和 `@KafkaConsumer` 装饰器，我们可以配置多个消费者。

比如，下面的 `sub1` 和 `sub2` 就是两个不同的消费者。

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

最简单的消费者配置需要几个字段，Kafka 的连接配置、消费者配置以及订阅配置。

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

比如：

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

完整可配置参数包括：

- `connectionOptions`：Kafka 的连接配置，即 `new Kafka(consumerOptions)` 的参数
- `consumerOptions`：Kafka 的消费者配置，即 `kafka.consumer(consumerOptions)` 的参数
- `subscribeOptions`：Kafka 的订阅配置，即 `consumer.subscribe(subscribeOptions)` 的参数
- `consumerRunConfig`：消费者运行配置，即 `consumer.run(consumerRunConfig)` 的参数

这些参数的详细说明，可以参考 [KafkaJS Consumer](https://kafka.js.org/docs/consuming) 文档。

### 复用 Kafka 实例

如果如果需要复用 Kafka 实例，可以通过 `kafkaInstanceRef` 字段来指定。

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

注意，上述的 `sub1` 和 `sub2` 是两个不同的消费者，但是它们共享同一个 Kafka 实例，且 `sub2` 的 `groupId` 需要和 `sub1` 不同。

用 Kafka SDK 写法类似如下：

```typescript
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
});

const consumer1 = kafka.consumer({ groupId: 'groupId-test-1' });
const consumer2 = kafka.consumer({ groupId: 'groupId-test-2' });
```

### 消费者实现

我们可以在目录中提供一个标准的消费者实现，比如 `src/consumer/sub1.consumer.ts`。

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

`sub1` 是消费者名称，使用的是配置中的 `sub1` 消费者。

也可以实现 `eachBatch` 方法，处理批量消息。

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


### 消息上下文


和其他消息订阅机制一样，消息本身通过 `Context` 字段来传递。

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

`Context` 字段包括几个属性：

| 属性        | 类型                           | 描述             |
| ----------- | ------------------------------ | ---------------- |
| ctx.payload   | EachMessagePayload, EachBatchPayload | 消息内容         |
| ctx.consumer  | Consumer             | 消费者实例         |


你可以通过 `ctx.consumer` 来调用 Kafka 的 API，比如 `ctx.consumer.commitOffsets` 来手动提交偏移量或者 `ctx.consumer.pause` 来暂停消费。


## 生产者（Producer）

### 基础配置

服务生产者也需要创建实例，配置本身使用了 [服务工厂](/docs/service_factory) 的设计模式。

配置如下：

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

每个 Producer 实例的配置，同样包括 `connectionOptions` 和 `producerOptions`。

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

具体参数可以参考 [KafkaJS Producer](https://kafka.js.org/docs/producing) 文档。

此外，由于 Kafka Consumer 和 Producer 都可以从同一个 Kafka 实例创建，所以它们可以复用同一个 Kafka 实例。

Producer 后于 Consumer 创建，也同样可以使用 `kafkaInstanceRef` 字段来复用 Kafka 实例。

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

### 使用 Producer

Producer 不存在默认实例，由于使用了服务工厂的设计模式，所以可以通过 `@InjectClient()` 来注入。


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

Kafka 的 Admin 功能，可以用来创建、删除、查看主题，查看配置和 ACL 等。

### 基础配置

和 Producer 类似，Admin 也使用了服务工厂的设计模式。

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

同样的，Admin 也可以复用 Kafka 实例。

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

### 使用 Admin

Admin 不存在默认实例，由于使用了服务工厂的设计模式，所以可以通过 `@InjectClient()` 来注入。

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

更多的 Admin 使用方法，可以参考 [KafkaJS Admin](https://kafka.js.org/docs/admin) 文档。


## 组件日志

Kafka 组件默认使用 `kafkaLogger` 日志，默认会将 `ctx.logger` 记录在 `midway-kafka.log`。

你可以通过配置修改。

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

这个日志的输出格式，我们也可以单独配置。

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


## 获取 KafkaJS 模块

KafkaJS 模块，可以通过 `@midwayjs/kafka` 的 `KafkaJS` 字段来获取。

```typescript
import { KafkaJS } from '@midwayjs/kafka';

const { ConfigResourceTypes } = KafkaJS;
// ...
```

## 关于分区的警告

如果你使用的是 KafkaJS 的 v2.0.0 版本，你可能会看到如下的警告：

```
2024-11-04 23:47:28.228 WARN 31729 KafkaJS v2.0.0 switched default partitioner. To retain the same partitioning behavior as in previous versions, create the producer with the option "createPartitioner: Partitioners.LegacyPartitioner". See the migration guide at https://kafka.js.org/docs/migration-guide-v2.0.0#producer-new-default-partitioner for details. Silence this warning by setting the environment variable "KAFKAJS_NO_PARTITIONER_WARNING=1" { timestamp: '2024-11-04T15:47:28.228Z', logger: 'kafkajs' }
```

这个警告是由于 KafkaJS 的 v2.0.0 版本默认使用了新的分区器，如果接受新的分区器行为，但想要关闭这个警告消息，可以通过设置环境变量 `KAFKAJS_NO_PARTITIONER_WARNING=1` 来消除这个警告。

或者显示声明分区器。

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

建议你查看 KafkaJS v2.0.0 的 [迁移指南](https://kafka.js.org/docs/migration-guide-v2.0.0#producer-new-default-partitioner) 了解更多细节。



## 参考文档

- [KafkaJS](https://kafka.js.org/docs/introduction)
- [apache kafka官网](https://kafka.apache.org/intro)
