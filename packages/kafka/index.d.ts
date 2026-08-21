import type { PowerPartial } from '@midwayjs/core';
import { IMidwayKafkaConfigurationOptions } from './dist';
export * from './dist/index';
export {
  EachMessagePayload,
  EachBatchPayload,
  Consumer,
  Kafka,
  Producer,
  Admin,
} from 'kafkajs';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    kafka?: PowerPartial<IMidwayKafkaConfigurationOptions>;
  }
}
