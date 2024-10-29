import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContext,
  NextFunction as BaseNextFunction, ServiceFactoryConfigOption
} from "@midwayjs/core";
import {
  ConsumerConfig,
  ConsumerRunConfig, ConsumerSubscribeTopic, ConsumerSubscribeTopics,
  EachBatchHandler,
  EachMessageHandler,
  Kafka,
  KafkaConfig,
  ProducerConfig
} from 'kafkajs';

export interface IKafkaApplication {
}

export type IMidwayKafkaApplication = IMidwayApplication<IMidwayKafkaContext> &
  IKafkaApplication;

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

/**
 * 客户端的相关配置，在midwayjs的自定义配置项
 */
export interface IMidwayConsumerConfig {
  topic: string;
  subscription: any;
  runConfig: any;
}

export interface IMidwayKafkaConfigurationOptions extends IConfigurationOptions {
  sub: {
    [name: string]: Partial<{
      connectionOptions: KafkaConfig;
      consumerOptions: ConsumerConfig;
      subscribeOptions: ConsumerSubscribeTopics | ConsumerSubscribeTopic;
      consumerRunConfig: ConsumerRunConfig;
    }>;
  },
  pub: ServiceFactoryConfigOption<Partial<{
    connectOptions: KafkaConfig;
    producerOptions: ProducerConfig;
  }>>
}

export interface IKafkaSubscriber {
  eachBatch?: EachBatchHandler;
  eachMessage?: EachMessageHandler;
}
