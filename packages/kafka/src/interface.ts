import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContext,
  NextFunction as BaseNextFunction,
} from '@midwayjs/core';
import { Kafka, KafkaConfig } from 'kafkajs';

export interface IKafkaApplication {
  // connect(...args): Promise<void>;
  // close(): Promise<void>;
}

export type IMidwayKafkaApplication = IMidwayApplication<IMidwayKafkaContext> &
  IKafkaApplication;

export interface IMidwayKakfaConfigurationOptions
  extends IConfigurationOptions,
    KafkaConfig {}

export type IMidwayKafkaContext = IMidwayContext<{
  // ack: (data: any) => void;
  topic: any,
  partition: any,
  message: any,
}>;

// export interface IKafkaApplication extends Kafka {}

export type Application = IMidwayKafkaApplication;
export interface Context extends IMidwayKafkaContext {}
export type NextFunction = BaseNextFunction;
export type DefaultConfig = string | Kafka;
