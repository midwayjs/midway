import { createKafkaProducer, createLightApp } from '@midwayjs/mock';
import { closeApp } from './utils';
import { sleep, Inject } from '@midwayjs/core';
import { IKafkaConsumer, KafkaConsumer, Context } from '../src';
import * as Kafka from '../src';
import { EachMessagePayload, Kafka as KafkaJs, Partitioners } from 'kafkajs';

describe('/test/index.test.ts', () => {
  describe('new features', () => {
    it('should test create producer and consumer with the multi different topic', async () => {
      let total = 0;
      @KafkaConsumer('sub1')
      class UserConsumer implements IKafkaConsumer {
        async eachMessage(payload: EachMessagePayload) {
          total++;
        }
      }

      @KafkaConsumer('sub2')
      class UserConsumer2 implements IKafkaConsumer {
        async eachMessage(payload: EachMessagePayload) {
          total++;
        }
      }

      const app = await createLightApp({
        imports: [
          Kafka,
        ],
        preloadModules: [UserConsumer, UserConsumer2],
        globalConfig: {
          kafka: {
            consumer: {
              sub1: {
                connectionOptions: {
                  clientId: 'my-app',
                  brokers: [process.env.KAFKA_URL || 'localhost:9092'],
                },
                consumerOptions: {
                  groupId: 'groupId-test-' + Math.random(),
                },
                subscribeOptions: {
                  topics: ['topic-test-1'],
                  fromBeginning: false,
                }
              },
              sub2: {
                kafkaInstanceRef: 'sub1',
                consumerOptions: {
                  groupId: 'groupId-test-' + Math.random(),
                },
                subscribeOptions: {
                  topics: ['topic-test-2'],
                  fromBeginning: false,
                }
              }
            }
          },
        }
      });

      await sleep(3000);
      expect(total).toEqual(0);

      // create a producer
      const producer = await createKafkaProducer({
        kafkaConfig: {
          clientId: 'my-app',
          brokers: [process.env.KAFKA_BROKERS as string || 'localhost:9092'],
        },
        mock: false,
      });
      await producer.connect();

      // send data to topic
      await producer.send({
        // compression: CompressionTypes.GZIP,
        topic: 'topic-test-1',
        messages: [{ key: 'message-key1', value: 'hello consumer 11 !' }],
      });
      await producer.send({
        // compression: CompressionTypes.GZIP,
        topic: 'topic-test-2',
        messages: [{ key: 'message-key2', value: 'hello consumer 22 !' }],
      });
      await sleep(3000);
      await producer.disconnect();

      await closeApp(app);
      expect(total).toEqual(2);
    });

    it('should test throw error in trigger', async () => {
      @KafkaConsumer('sub1')
      class UserConsumer implements IKafkaConsumer {
        async eachMessage(payload: EachMessagePayload) {
          throw new Error('test error');
        }
      }

      const app = await createLightApp({
        imports: [
          Kafka,
        ],
        preloadModules: [UserConsumer],
        globalConfig: {
          kafka: {
            consumer: {
              sub1: {
                connectionOptions: {
                  clientId: 'my-app',
                  brokers: [process.env.KAFKA_URL || 'localhost:9092'],
                },
                consumerOptions: {
                  groupId: 'groupId-test-' + Math.random(),
                },
                subscribeOptions: {
                  topics: ['topic-test-1'],
                  fromBeginning: false,
                }
              }
            }
          },
        }
      });

      await sleep(3000);

      // create a producer
      const producer = await createKafkaProducer({
        kafkaConfig: {
          clientId: 'my-app',
          brokers: [process.env.KAFKA_BROKERS as string || 'localhost:9092'],
        },
        mock: false,
      });
      await producer.connect();

      // send data to topic
      await producer.send({
        // compression: CompressionTypes.GZIP,
        topic: 'topic-test-1',
        messages: [{ key: 'message-key1', value: 'hello consumer 11 !' }],
      });
      await sleep(3000);
      await producer.disconnect();

      await closeApp(app);
    });

    it('should test create producer and send', async () => {
      const app = await createLightApp({
        imports: [
          Kafka,
        ],
        globalConfig: {
          kafka: {
            producer: {
              clients: {
                producer1: {
                  connectionOptions: {
                    clientId: 'my-app',
                    brokers: [process.env.KAFKA_BROKERS as string || 'localhost:9092'],
                  },
                }
              }
            }
          }
        }
      });

      const kafka = new KafkaJs({
        clientId: 'my-app',
        brokers: [process.env.KAFKA_BROKERS as string || 'localhost:9092'],
      });

      const consumer = kafka.consumer({ groupId: 'my-group' });
      await consumer.connect();
      await consumer.subscribe({ topics: ['topic-test-1'] });

      await new Promise<void>(async (resolve, reject) => {

        await consumer.run({
          eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
            if (topic === 'topic-test-1' && message?.value?.toString() === 'hello consumer 11 !') {
              resolve();
            } else {
              reject(new Error('test error'));
            }
          },
        });

        const producerFactory = await app.getApplicationContext().getAsync(Kafka.KafkaProducerFactory);
        const producer = producerFactory.get('producer1');
        await producer.send({
          topic: 'topic-test-1',
          messages: [{ key: 'message-key1', value: 'hello consumer 11 !' }],
        });
      });

      await consumer.disconnect();
      await closeApp(app);
    });

    it('should test create admin', async () => {
      const app = await createLightApp({
        imports: [
          Kafka,
        ],
        globalConfig: {
          kafka: {
            admin: {
              clients: {
                admin1: {
                  connectionOptions: {
                    clientId: 'my-app',
                    brokers: [process.env.KAFKA_BROKERS as string || 'localhost:9092'],
                  },
                },
              }
            }
          }
        }
      });

      const adminFactory = await app.getApplicationContext().getAsync(Kafka.KafkaAdminFactory);
      const admin = adminFactory.get('admin1');
      await admin.createTopics({
        topics: [{
          topic: 'my-topic',
          numPartitions: 3,
          replicationFactor: 1
        }]
      });

      // 查看所有主题
      const topics = await admin.listTopics();
      expect(topics).toContain('my-topic');
      // 删除主题
      await admin.deleteTopics({
        topics: ['my-topic']
      });

      // 查看消费者组
      const groups = await admin.listGroups();
      expect(groups).not.toContain('my-group');
      await closeApp(app);
    });

    it('should test share same kafka instance with consumer and producer', async () => {
      let total = 0;
      @KafkaConsumer('sub1')
      class UserConsumer implements IKafkaConsumer {
        @Inject()
        ctx: Context;
        async eachMessage(payload: EachMessagePayload) {
          this.ctx.logger.info(payload.message.value?.toString());
          total++;
        }
      }

      const app = await createLightApp({
        imports: [
          Kafka,
        ],
        preloadModules: [UserConsumer],
        globalConfig: {
          kafka: {
            consumer: {
              sub1: {
                connectionOptions: {
                  clientId: 'my-app',
                  brokers: [process.env.KAFKA_BROKERS as string || 'localhost:9092'],
                },
                consumerOptions: {
                  groupId: 'groupId-test-' + Math.random(),
                },
                subscribeOptions: {
                  topics: ['topic-test-1'],
                  fromBeginning: false,
                }
              }
            },
            producer: {
              clients: {
                producer1: {
                  kafkaInstanceRef: 'sub1',
                  producerOptions: {
                    createPartitioner: Partitioners.DefaultPartitioner,
                  }
                }
              }
            }
          }
        }
      });

      await sleep(1000);

      // get producer
      const producerFactory = await app.getApplicationContext().getAsync(Kafka.KafkaProducerFactory);
      const producer = producerFactory.get('producer1');
      await producer.send({
        topic: 'topic-test-1',
        messages: [{ key: 'message-key1', value: 'hello consumer 11 !' }],
      });

      await sleep(3000);
      expect(total).toEqual(1);

      await closeApp(app);
    });
  })
});
