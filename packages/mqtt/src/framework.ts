import {
  Framework,
  BaseFramework,
  Logger,
  DecoratorManager,
  MetadataManager,
} from '@midwayjs/core';
import {
  IMidwayMQTTApplication,
  IMidwayMQTTConfigurationOptions,
  IMidwayMQTTContext,
  IMqttSubscriber,
  MqttSubscriberOptions,
} from './interface';
import { connect, IClientOptions, MqttClient } from 'mqtt';
import { MQTT_DECORATOR_KEY } from './decorator';

@Framework()
export class MidwayMQTTFramework extends BaseFramework<
  IMidwayMQTTApplication,
  IMidwayMQTTContext,
  IMidwayMQTTConfigurationOptions
> {
  public app: IMidwayMQTTApplication;
  protected subscriberMap: Map<string, MqttClient> = new Map();

  @Logger('mqttLogger')
  mqttLogger;

  configure() {
    return this.configService.getConfiguration('mqtt');
  }

  async applicationInitialize(options) {
    this.app = {} as any;
  }

  public async run(): Promise<void> {
    const { sub } = this.configurationOptions;

    if (Object.keys(sub || {}).length === 0) {
      this.mqttLogger.info(
        '[midway-mqtt] Not found consumer config, skip init consumer'
      );
    }
    // find subscriber
    const mqttSubscriberModules =
      DecoratorManager.listModule(MQTT_DECORATOR_KEY);
    const mqttSubscriberMap = {};
    for (const subscriberModule of mqttSubscriberModules) {
      const subscriberName = MetadataManager.getOwnMetadata(
        MQTT_DECORATOR_KEY,
        subscriberModule
      ) as string;
      mqttSubscriberMap[subscriberName] = subscriberModule;
    }

    for (const customKey in sub) {
      await this.createSubscriber(
        sub[customKey].connectOptions,
        sub[customKey].subscribeOptions,
        mqttSubscriberMap[customKey],
        customKey
      );
    }
  }

  protected async beforeStop(): Promise<void> {
    for (const [name, consumer] of this.subscriberMap) {
      await consumer.endAsync();
      this.mqttLogger.info(`[midway-mqtt] subscriber: ${name} is closed`);
    }
  }

  /**
   * dynamic create subscriber
   */
  public async createSubscriber(
    /**
     * mqtt connection options
     */
    connectionOptions: IClientOptions,
    /**
     * mqtt subscribe options
     */
    subscribeOptions: MqttSubscriberOptions,
    /**
     * midway mqtt subscriber class
     */
    ClzProvider: new () => IMqttSubscriber,
    /**
     * midway mqtt component instance name, if not set, will be manager by your self
     */
    clientName?: string
  ) {
    const consumer = await new Promise<MqttClient>(resolve => {
      const client = connect(connectionOptions);
      client.on('connect', () => {
        if (clientName) {
          this.logger.info(
            '[midway-mqtt] subscriber: %s is connect',
            clientName
          );
          this.subscriberMap.set(clientName, client);
        }
        resolve(client);
      });
      client.on('error', err => {
        this.mqttLogger.error(err);
      });
    });

    consumer.on('message', async (topic, message, packet) => {
      const ctx = this.app.createAnonymousContext();
      ctx.topic = topic;
      ctx.packet = packet;
      ctx.message = message;
      const fn = await this.applyMiddleware(async ctx => {
        const instance = await ctx.requestContext.getAsync(ClzProvider);
        // eslint-disable-next-line prefer-spread
        return await instance['subscribe'].call(instance, ctx);
      });
      return await fn(ctx);
    });

    await consumer.subscribeAsync(
      subscribeOptions.topicObject,
      subscribeOptions.opts
    );

    return consumer;
  }

  public getSubscriber(name: string) {
    return this.subscriberMap.get(name);
  }

  public getSubscribers(): MqttClient[] {
    return Object.values(this.subscriberMap);
  }

  public getFrameworkName() {
    return 'midway:mqtt';
  }
}
