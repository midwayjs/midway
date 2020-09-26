import { IMidwayApplication, IMidwayContainer } from '@midwayjs/core';
import { Options } from 'amqplib/properties';

export interface IRabbitMQApplication {
  init(): Promise<void>
  connect(): Promise<void>;
  createChannel(): Promise<void>;
  closeChannel(): Promise<void>;
  close(): Promise<void>;
}

export type IMidwayRabbitMQApplication = IMidwayApplication & IRabbitMQApplication;

export type IMidwayRabbitMQConfigurationOptions = {
  url: string | Options.Connect,
  socketOptions?: any;
  reconnectTimeInSeconds?: number;
}

export type IMidwayRabbitMQContext = {
  requestContext: IMidwayContainer;
};
