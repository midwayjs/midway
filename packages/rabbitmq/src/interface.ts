import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { ConsumeMessage, Options } from 'amqplib/properties';
import { RabbitMQListenerOptions } from '@midwayjs/decorator';
import * as amqp from 'amqplib';

export interface IRabbitMQApplication {
  init(): Promise<void>
  connect(): Promise<void>;
  createChannel(): Promise<void>;
  createConfirmChannel(): Promise<void>;
  closeChannel(): Promise<void>;
  assertQueue(queue: string, options?): Promise<void>;
  createConsumer(listenerOptions: RabbitMQListenerOptions, listenerCallback: (msg: ConsumeMessage | null) => Promise<void>): Promise<void>;
  getChannel(): amqp.Channel;
  close(): Promise<void>;
}

export type IMidwayRabbitMQApplication = IMidwayApplication<IMidwayRabbitMQContext, IRabbitMQApplication>;

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
  channel: amqp.Channel;
  startTime: number;
  queueName: string;
}>;

export enum RabbitMQChannelEvent {
  CHANNEL_CLOSE = 'ch_close',
  CHANNEL_ERROR = 'ch_error',
  CHANNEL_RETURN = 'ch_return',
  CHANNEL_OPEN = 'ch_open',
  CHANNEL_DRAIN = 'ch_drain',
}

export type Application = IMidwayRabbitMQApplication;
export interface Context extends IMidwayRabbitMQContext {}
export type DefaultConfig = string | amqp.Options.Connect;
