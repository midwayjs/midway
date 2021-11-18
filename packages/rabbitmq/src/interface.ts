import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { ConsumeMessage, Options } from 'amqplib/properties';
import { RabbitMQListenerOptions } from '@midwayjs/decorator';
import type { ConfirmChannel, Channel, Options as AmqpOptions } from 'amqplib';

export interface IRabbitMQApplication {
  connect(...args): Promise<void>;
  createChannel(): Promise<Channel | ConfirmChannel>;
  createConsumer(listenerOptions: RabbitMQListenerOptions, listenerCallback: (msg: ConsumeMessage | null, channel: Channel, channelWrapper) => Promise<void>): Promise<void>;
  close(): Promise<void>;
}

export type IMidwayRabbitMQApplication = IMidwayApplication<IMidwayRabbitMQContext> & IRabbitMQApplication;

export interface IRabbitMQExchange {
  name: string,
  type: string,
  options?: Options.AssertExchange
}

export interface IMidwayRabbitMQConfigurationOptions extends IConfigurationOptions {
  url: string | Options.Connect,
  socketOptions?: any;
  reconnectTime?: number;
  exchanges?: IRabbitMQExchange[];
  useConfirmChannel?: boolean;
}

export type IMidwayRabbitMQContext = IMidwayContext<{
  channel: Channel;
  queueName: string;
  ack: (data: any) => void;
}>;

export type Application = IMidwayRabbitMQApplication;
export interface Context extends IMidwayRabbitMQContext {}
export type DefaultConfig = string | AmqpOptions.Connect;

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    rabbitMQServer?: PowerPartial<IMidwayRabbitMQConfigurationOptions>;
  }
}

