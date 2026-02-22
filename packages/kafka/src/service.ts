import {
  Config,
  Destroy,
  ILogger,
  Inject,
  Init,
  Logger,
  MidwayCommonError,
  ServiceFactory,
  ServiceFactoryConfigOption,
  Singleton,
  MidwayTraceService,
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

  @Inject()
  traceService: MidwayTraceService;

  @Config('kafka.tracing.enable')
  traceEnabled: boolean;

  @Config('kafka.tracing.injector')
  traceInjector: (args: {
    request?: unknown;
    custom?: Record<string, unknown>;
  }) => any;

  getName(): string {
    return 'kafka:producer';
  }

  @Init()
  async init() {
    await this.initClients(this.pubConfig, {
      concurrent: true,
    });
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
    this.bindTraceContext(producer);

    producer.on('producer.connect', () => {
      this.logger.info('[midway:kafka] producer: %s is connect', clientName);
    });
    await producer.connect();
    return producer;
  }

  private bindTraceContext(producer: Producer) {
    const injectHeaders = (
      headers: Record<string, any> | undefined,
      custom?: Record<string, unknown>
    ) => {
      const configuredCarrier =
        typeof this.traceInjector === 'function'
          ? this.traceInjector({
              request: headers,
              custom,
            })
          : undefined;
      const carrier = configuredCarrier ?? headers ?? {};
      if (this.traceEnabled !== false) {
        this.traceService.injectContext(carrier);
      }
      return carrier;
    };

    const rawSend = producer.send.bind(producer);
    (producer as any).send = payload => {
      const nextPayload = {
        ...payload,
        messages: (payload?.messages || []).map(message => ({
          ...message,
          headers: injectHeaders(message?.headers, {
            sendMethod: 'send',
            topic: payload?.topic,
          }),
        })),
      };
      return rawSend(nextPayload);
    };

    const rawSendBatch = producer.sendBatch.bind(producer);
    (producer as any).sendBatch = payload => {
      const nextPayload = {
        ...payload,
        topicMessages: (payload?.topicMessages || []).map(topicMessage => ({
          ...topicMessage,
          messages: (topicMessage?.messages || []).map(message => ({
            ...message,
            headers: injectHeaders(message?.headers, {
              sendMethod: 'sendBatch',
              topic: topicMessage?.topic,
            }),
          })),
        })),
      };
      return rawSendBatch(nextPayload);
    };
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
    await this.initClients(this.adminConfig, {
      concurrent: true,
    });
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
