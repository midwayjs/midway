import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { ConsumeMessage, Options } from 'amqplib/properties';
import { RabbitMQListenerOptions } from '@midwayjs/decorator';
import * as amqp from 'amqplib';

export interface IRabbitMQApplication {
  init(): Promise<void>
  connect(): Promise<void>;
  createChannel(): Promise<void>;
  closeChannel(): Promise<void>;
  assertQueue(queue: string, options?): Promise<void>;
  createConsumer(listenerOptions: RabbitMQListenerOptions, listenerCallback: (msg: ConsumeMessage | null) => Promise<void>): Promise<void>;
  getChannel(): amqp.Channel;
  close(): Promise<void>;
}

export type IMidwayRabbitMQApplication = IMidwayApplication & IRabbitMQApplication;

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

export type IMidwayRabbitMQContext = {
  channel: amqp.Channel;
  startTime: number;
  queueName: string;
} & IMidwayContext;

export enum RabbitMQChannelEvent {
  CHANNEL_CLOSE = 'ch_close',
  CHANNEL_ERROR = 'ch_error',
  CHANNEL_RETURN = 'ch_return',
  CHANNEL_OPEN = 'ch_open',
  CHANNEL_DRAIN = 'ch_drain',
}

export type Application = IMidwayRabbitMQApplication;

export type Context = IMidwayRabbitMQContext;
