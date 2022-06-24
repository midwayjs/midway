import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContext,
  NextFunction as BaseNextFunction,
} from '@midwayjs/core';
import { Kafka, KafkaConfig } from 'kafkajs';

export interface IKafkaApplication {
}

export type IMidwayKafkaApplication = IMidwayApplication<IMidwayKafkaContext> &
  IKafkaApplication;

export interface IMidwayKafkaConfigurationOptions
  extends IConfigurationOptions,
    KafkaConfig {}

export type IMidwayKafkaContext = IMidwayContext<{
  topic: any;
  partition: any;
  message: any;
  commitOffsets(data: any): void;
}>;

export type Application = IMidwayKafkaApplication;
export interface Context extends IMidwayKafkaContext {}
export type NextFunction = BaseNextFunction;
export type DefaultConfig = string | Kafka;
