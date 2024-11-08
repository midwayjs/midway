import {
  Config,
  Destroy,
  ILogger,
  Init,
  Logger,
  MidwayCommonError,
  ServiceFactory,
  ServiceFactoryConfigOption,
  Singleton,
} from '@midwayjs/core';
import { Producer, Kafka, Admin } from 'kafkajs';
import {
  IMidwayKafkaAdminInitOptions,
  IMidwayKafkaProducerInitOptions,
} from './interface';
import { KafkaManager } from './manager';

@Singleton()
export class KafkaProducerFactory extends ServiceFactory<Producer> {
  @Logger('kafkaLogger')
  logger: ILogger;

  @Config('kafka.producer')
  pubConfig: ServiceFactoryConfigOption<IMidwayKafkaProducerInitOptions>;

  getName(): string {
    return 'kafka:producer';
  }

  @Init()
  async init() {
    await this.initClients(this.pubConfig);
  }

  protected async createClient(
    config: IMidwayKafkaProducerInitOptions,
    clientName: any
  ): Promise<Producer> {
    const { connectionOptions, producerOptions, kafkaInstanceRef } = config;
    let client: Kafka;
    if (kafkaInstanceRef) {
      client = KafkaManager.getInstance().getKafkaInstance(kafkaInstanceRef);
      if (!client) {
        throw new MidwayCommonError(
          `[midway:kafka] kafka instance ${kafkaInstanceRef} not found`
        );
      }
    } else {
      client = new Kafka(connectionOptions);
      KafkaManager.getInstance().addKafkaInstance(kafkaInstanceRef, client);
    }
    const producer = client.producer(producerOptions);

    producer.on('producer.connect', () => {
      this.logger.info('[midway:kafka] producer: %s is connect', clientName);
    });
    await producer.connect();
    return producer;
  }

  async destroyClient(producer: Producer, name: string) {
    await producer.disconnect();
    this.logger.info('[midway:kafka] producer: %s is close', name);
  }

  @Destroy()
  async destroy() {
    await super.stop();
  }
}

@Singleton()
export class KafkaAdminFactory extends ServiceFactory<Admin> {
  @Logger('kafkaLogger')
  logger: ILogger;

  @Config('kafka.admin')
  adminConfig: ServiceFactoryConfigOption<IMidwayKafkaProducerInitOptions>;

  getName(): string {
    return 'kafka:admin';
  }

  @Init()
  async init() {
    await this.initClients(this.adminConfig);
  }

  protected async createClient(
    config: IMidwayKafkaAdminInitOptions,
    clientName: any
  ): Promise<Admin> {
    const { connectionOptions, adminOptions, kafkaInstanceRef } = config;
    let client: Kafka;
    if (kafkaInstanceRef) {
      client = KafkaManager.getInstance().getKafkaInstance(kafkaInstanceRef);
      if (!client) {
        throw new MidwayCommonError(
          `[midway:kafka] kafka instance ${kafkaInstanceRef} not found`
        );
      }
    } else {
      client = new Kafka(connectionOptions);
      KafkaManager.getInstance().addKafkaInstance(kafkaInstanceRef, client);
    }
    const admin = client.admin(adminOptions);
    await admin.connect();
    return admin;
  }

  async destroyClient(admin: Admin, name: string) {
    await admin.disconnect();
    this.logger.info('[midway:kafka] admin: %s is close', name);
  }

  @Destroy()
  async destroy() {
    await super.stop();
  }
}
