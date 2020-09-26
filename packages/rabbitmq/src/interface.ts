import { IMidwayApplication, IMidwayContainer } from '@midwayjs/core';
import { Options } from 'amqplib/properties';
import { RabbitMQListenerOptions } from "@midwayjs/decorator";

export interface IRabbitMQApplication {
  init(): Promise<void>
  connect(): Promise<void>;
  createChannel(): Promise<void>;
  closeChannel(): Promise<void>;
  assertQueue(queue: string, options?): Promise<void>;
  createConsumer(listenerOptions: RabbitMQListenerOptions, listenerCallback): Promise<void>;
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
}

export type IMidwayRabbitMQContext = {
  requestContext: IMidwayContainer;
};
