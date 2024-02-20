import {
  Provide,
  Scope,
  ScopeEnum,
  Init,
  Logger,
  Inject,
  Config,
} from '@midwayjs/core';
import {
  ServiceFactory,
  delegateTargetAllPrototypeMethod,
  MidwayCommonError,
} from '@midwayjs/core';
import { MqttClient, connect } from 'mqtt';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MqttProducerFactory extends ServiceFactory<MqttClient> {
  @Logger('mqttLogger')
  logger;

  @Config('mqtt.pub')
  pubConfig;
  getName(): string {
    return 'mqtt';
  }

  @Init()
  async init() {
    await this.initClients(this.pubConfig);
  }

  protected async createClient(
    config: any,
    clientName: any
  ): Promise<MqttClient> {
    const producer = await new Promise<MqttClient>(resolve => {
      const client = connect(config);
      client.on('connect', () => {
        this.logger.info('[midway-mqtt] producer: %s is connect', clientName);
        resolve(client);
      });
      client.on('error', err => {
        this.logger.error(err);
      });
    });
    return producer;
  }

  async destroyClient(producer, name) {
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
