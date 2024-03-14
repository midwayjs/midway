import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContext,
  NextFunction as BaseNextFunction, ServiceFactoryConfigOption,
} from '@midwayjs/core';
import type { IClientOptions, IClientSubscribeOptions, IClientSubscribeProperties, ISubscriptionMap, IPublishPacket } from 'mqtt';

export interface MqttSubscriberOptions {
  topicObject: string | string[] | ISubscriptionMap;
  opts?: IClientSubscribeOptions | IClientSubscribeProperties;
}

export type IMidwayMQTTApplication = IMidwayApplication<IMidwayMQTTContext>;

export interface IMidwayMQTTConfigurationOptions extends IConfigurationOptions {
  sub: {
    [name: string]: Partial<{
      connectOptions: Partial<IClientOptions>;
      subscribeOptions: MqttSubscriberOptions;
    }>;
  },
  pub: ServiceFactoryConfigOption<IClientOptions>;
}

export type IMidwayMQTTContext = IMidwayContext<{
  topic: string;
  message: Buffer;
  packet: IPublishPacket;
}>;

export type Application = IMidwayMQTTApplication;
export interface Context extends IMidwayMQTTContext {}
export type NextFunction = BaseNextFunction;

export interface IMqttSubscriber {
  subscribe(ctx: IMidwayMQTTContext): Promise<any>;
}

