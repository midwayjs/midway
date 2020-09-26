import { IMidwayApplication, IMidwayContainer } from '@midwayjs/core';
import { ConsumeMessage, Options } from 'amqplib/properties';
import { RabbitMQListenerOptions } from "@midwayjs/decorator";
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

export type IMidwayRabbitMQConfigurationOptions = {
  url: string | Options.Connect,
  socketOptions?: any;
  reconnectTimeInSeconds?: number;
  exchanges?: IRabbitMQExchange[];
  useConfirmChannel?: boolean;
}

export type IMidwayRabbitMQContext = {
  channel: amqp.Channel;
  requestContext?: IMidwayContainer;
};
