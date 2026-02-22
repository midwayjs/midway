import {
  Config,
  delegateTargetAllPrototypeMethod,
  ILogger,
  Init,
  Inject,
  Logger,
  MidwayCommonError,
  Provide,
  Scope,
  ScopeEnum,
  ServiceFactory,
  ServiceFactoryConfigOption,
  MidwayTraceService,
} from '@midwayjs/core';
import { connect, type IClientOptions, MqttClient } from 'mqtt';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MqttProducerFactory extends ServiceFactory<MqttClient> {
  @Logger('mqttLogger')
  logger: ILogger;

  @Config('mqtt.pub')
  pubConfig: ServiceFactoryConfigOption<IClientOptions>;

  @Inject()
  traceService: MidwayTraceService;

  @Config('mqtt.tracing.enable')
  traceEnabled: boolean;

  @Config('mqtt.tracing.injector')
  traceInjector: (args: {
    request?: unknown;
    custom?: Record<string, unknown>;
  }) => any;

  getName(): string {
    return 'mqtt';
  }

  @Init()
  async init() {
    await this.initClients(this.pubConfig, {
      concurrent: true,
    });
  }

  protected async createClient(
    config: any,
    clientName: any
  ): Promise<MqttClient> {
    return new Promise<MqttClient>(resolve => {
      const client = connect(config);
      client.on('connect', () => {
        this.bindTraceContext(client);
        this.logger.info('[midway-mqtt] producer: %s is connect', clientName);
        resolve(client);
      });
      client.on('error', err => {
        this.logger.error(err);
      });
    });
  }

  private bindTraceContext(client: MqttClient) {
    const injectCarrier = (topic: string, options?: any) => {
      const publishOptions = options ?? {};
      if (!publishOptions.properties) {
        publishOptions.properties = {};
      }
      const configuredCarrier =
        typeof this.traceInjector === 'function'
          ? this.traceInjector({
              request: publishOptions,
              custom: {
                topic,
              },
            })
          : undefined;
      publishOptions.properties.userProperties =
        configuredCarrier ?? publishOptions.properties.userProperties ?? {};
      if (this.traceEnabled !== false) {
        this.traceService.injectContext(
          publishOptions.properties.userProperties
        );
      }
      return publishOptions;
    };

    const rawPublish = client.publish.bind(client);
    (client as any).publish = (topic, message, options?, callback?) => {
      return rawPublish(
        topic,
        message,
        injectCarrier(topic, options),
        callback
      );
    };

    if (typeof (client as any).publishAsync === 'function') {
      const rawPublishAsync = (client as any).publishAsync.bind(client);
      (client as any).publishAsync = (topic, message, options?) => {
        return rawPublishAsync(topic, message, injectCarrier(topic, options));
      };
    }
  }

  async destroyClient(producer: MqttClient, name: string) {
    await producer.endAsync();
    this.logger.info('[midway-mqtt] producer: %s is close', name);
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class DefaultMqttProducer implements MqttClient {
  @Inject()
  private mqttProducerFactory: MqttProducerFactory;

  protected instance: MqttClient;

  @Init()
  async init() {
    this.instance = this.mqttProducerFactory.get(
      this.mqttProducerFactory.getDefaultClientName() || 'default'
    );
    if (!this.instance) {
      throw new MidwayCommonError('mqtt default producer instance not found.');
    }
  }
}

export interface DefaultMqttProducer extends MqttClient {
  // empty
}

delegateTargetAllPrototypeMethod(DefaultMqttProducer, MqttClient);
