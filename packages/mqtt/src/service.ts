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
} from '@midwayjs/core';
import { connect, type IClientOptions, MqttClient } from 'mqtt';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MqttProducerFactory extends ServiceFactory<MqttClient> {
  @Logger('mqttLogger')
  logger: ILogger;

  @Config('mqtt.pub')
  pubConfig: ServiceFactoryConfigOption<IClientOptions>;
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
        this.logger.info('[midway-mqtt] producer: %s is connect', clientName);
        resolve(client);
      });
      client.on('error', err => {
        this.logger.error(err);
      });
    });
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DefaultMqttProducer extends MqttClient {
  // empty
}

delegateTargetAllPrototypeMethod(DefaultMqttProducer, MqttClient);
