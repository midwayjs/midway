import {
  DecoratorManager,
  MetadataManager,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import {
  BULLMQ_FLOW_PRODUCER_KEY,
  BULLMQ_PROCESSOR_KEY,
  BULLMQ_QUEUE_KEY,
  BULLMQ_WORKER_KEY,
} from './constants';
import { QueueOptions, WorkerOptions, JobsOptions } from 'bullmq';

export function Processor(
  queueName: string,
  jobOptions?: JobsOptions,
  workerOptions?: Partial<WorkerOptions>,
  queueOptions?: Partial<QueueOptions>
): ClassDecorator {
  return function (target: any) {
    DecoratorManager.saveModule(BULLMQ_PROCESSOR_KEY, target);
    MetadataManager.defineMetadata(
      BULLMQ_PROCESSOR_KEY,
      {
        queueName,
        jobOptions,
        workerOptions,
        queueOptions,
      },
      target
    );
    Provide()(target);
    Scope(ScopeEnum.Request)(target);
  };
}

export function InjectQueue(queueName: string): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(BULLMQ_QUEUE_KEY, {
    queueName,
  });
}

export function InjectWorker(queueName: string): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(BULLMQ_WORKER_KEY, {
    queueName,
  });
}

export function InjectFlowProducer(producerName: string): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(
    BULLMQ_FLOW_PRODUCER_KEY,
    {
      producerName,
    }
  );
}
