import { MS_CONSUMER_KEY, attachPropertyDataToClass } from '../';

/**
 * @deprecated Replaced by ConsumerSubscribeTopics
 */
export type ConsumerSubscribeTopic = {
  fromBeginning?: boolean;
};
export type ConsumerSubscribeTopics = {
  fromBeginning?: boolean;
};

export type ConsumerRunConfig = {
  autoCommit?: boolean;
  autoCommitInterval?: number | null;
  autoCommitThreshold?: number | null;
  eachBatchAutoResolve?: boolean;
  partitionsConsumedConcurrently?: number;
};

export interface KafkaListenerOptions {
  propertyKey?: string;
  topic?: string;

  subscription?: ConsumerSubscribeTopics | ConsumerSubscribeTopic;
  runConfig?: ConsumerRunConfig;
}

export function KafkaListener(
  topic: string,
  options: KafkaListenerOptions = {}
): MethodDecorator {
  return (target: any, propertyKey: string) => {
    options.topic = topic;
    options.propertyKey = propertyKey;
    attachPropertyDataToClass(MS_CONSUMER_KEY, options, target, propertyKey);
  };
}
