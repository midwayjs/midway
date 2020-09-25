import { IMidwayApplication, IMidwayContainer } from '@midwayjs/core';
import { AmqpConnectionManagerOptions } from 'amqp-connection-manager';

export interface IRabbitMQApplication {
  init(): Promise<void>
  connect(): Promise<void>;
  createChannel(): Promise<void>;
  closeAllChannel(): Promise<void>;
  close(): Promise<void>;
}

export type IMidwayRabbitMQApplication = IMidwayApplication & IRabbitMQApplication;

export type IMidwayRabbitMQConfigurationOptions = {
  url: string | string[],
  amqpConnectionManagerOptions?: AmqpConnectionManagerOptions;
}

export type IMidwayRabbitMQContext = {
  requestContext: IMidwayContainer;
};
