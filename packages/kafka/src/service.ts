import {
  Config,
  ILogger,
  Init,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
  ServiceFactory,
  ServiceFactoryConfigOption,
} from '@midwayjs/core';
import { Producer, ProducerConfig, Kafka, KafkaConfig } from 'kafkajs';

@Provide()
@Scope(ScopeEnum.Singleton)
export class KafkaProducerFactory extends ServiceFactory<Producer> {
  @Logger('kafkaLogger')
  logger: ILogger;

  @Config('kafka.pub')
  pubConfig: ServiceFactoryConfigOption<ProducerConfig>;
  getName(): string {
    return 'kafka';
  }

  @Init()
  async init() {
    await this.initClients(this.pubConfig);
  }

  protected async createClient(
    config: {
      connectOptions: KafkaConfig;
      producerOptions: ProducerConfig;
    },
    clientName: any
  ): Promise<Producer> {
    const client = new Kafka(config.connectOptions).producer(
      config.producerOptions
    );
    client.on('producer.connect', () => {
      this.logger.info('[midway-kafka] producer: %s is connect', clientName);
    });
    await client.connect();
    return client;
  }

  async destroyClient(producer: Producer, name: string) {
    await producer.disconnect();
    this.logger.info('[midway-kafka] producer: %s is close', name);
  }
}
//
// @Provide()
// @Scope(ScopeEnum.Singleton)
// export class DefaultKafkaProducer implements Producer {
//   @Inject()
//   private kafkaProducerFactory: KafkaProducerFactory;
//
//   protected instance: Producer;
//
//   @Init()
//   async init() {
//     this.instance = this.kafkaProducerFactory.get(
//       this.kafkaProducerFactory.getDefaultClientName() || 'default'
//     );
//     if (!this.instance) {
//       throw new MidwayCommonError('kafka default producer instance not found.');
//     }
//   }
// }
//
// // eslint-disable-next-line @typescript-eslint/no-empty-interface
// export interface DefaultKafkaProducer extends Producer {
//   // empty
// }
//
// delegateTargetAllPrototypeMethod(DefaultKafkaProducer, Producer);
