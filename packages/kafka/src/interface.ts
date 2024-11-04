import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContext,
  NextFunction as BaseNextFunction,
  ServiceFactoryConfigOption
} from "@midwayjs/core";
import {
  AdminConfig,
  Consumer,
  ConsumerConfig,
  ConsumerRunConfig,
  ConsumerSubscribeTopic,
  ConsumerSubscribeTopics,
  EachBatchHandler,
  EachBatchPayload,
  EachMessageHandler,
  EachMessagePayload,
  Kafka,
  KafkaConfig,
  ProducerConfig
} from 'kafkajs';

export interface IKafkaApplication {
}

export type IMidwayKafkaApplication = IMidwayApplication<IMidwayKafkaContext> &
  IKafkaApplication;

export type IMidwayKafkaContext = IMidwayContext<{
  /**
   * @deprecated please use `ctx.payload` instead
   */
  topic?: any;
  /**
   * @deprecated please use `ctx.payload` instead
   */
  partition?: any;
  /**
   * @deprecated please use `ctx.payload` instead
   */
  message?: any;
  /**
   * @deprecated please use `ctx.consumer.commitOffsets` instead
   */
  commitOffsets?(data: any): void;
  payload: EachMessagePayload | EachBatchPayload;
  consumer: Consumer;
}>;

export type Application = IMidwayKafkaApplication;
export interface Context extends IMidwayKafkaContext {}
export type NextFunction = BaseNextFunction;
export type DefaultConfig = string | Kafka;

/**
 * 客户端的相关配置，在midwayjs的自定义配置项
 * @deprecated
 */
export interface IMidwayConsumerConfig {
  topic: string;
  subscription: any;
  runConfig: any;
}

/**
 * The options for the kafka consumer initialization in midway
 */
export interface IKafkaConsumerInitOptions {
  /**
   * The connection options for the kafka instance
   */
  connectionOptions: KafkaConfig;
  /**
   * The consumer options for the kafka consumer
   */
  consumerOptions: ConsumerConfig;
  subscribeOptions: ConsumerSubscribeTopics | ConsumerSubscribeTopic;
  consumerRunConfig: ConsumerRunConfig;
  kafkaInstanceRef?: string;
}

/**
 * The options for the kafka producer initialization in midway
 */
export interface IMidwayKafkaProducerInitOptions {
  connectionOptions: KafkaConfig;
  producerOptions: ProducerConfig;
  kafkaInstanceRef?: string;
}

/**
 * The options for the kafka admin initialization in midway
 */
export interface IMidwayKafkaAdminInitOptions {
  kafkaInstanceRef?: string;
  connectionOptions: KafkaConfig;
  /**
   * The options for the kafka admin initialization
   */
  adminOptions: AdminConfig;
}

export interface IMidwayKafkaConfigurationOptions extends IConfigurationOptions {
  consumer: {
    [name: string]: Partial<IKafkaConsumerInitOptions>;
  },
  producer: ServiceFactoryConfigOption<Partial<IMidwayKafkaProducerInitOptions>>,
  admin: ServiceFactoryConfigOption<Partial<IMidwayKafkaAdminInitOptions>>
}

export interface IKafkaConsumer {
  eachBatch?: EachBatchHandler;
  eachMessage?: EachMessageHandler;
}
