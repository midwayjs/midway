import {
  createCustomPropertyDecorator,
  Provide,
  saveClassMetadata,
  saveModule,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { IQueueOptions, IWorkerOptions } from './interface';
import { BULLMQ_PROCESSOR_KEY, BULLMQ_QUEUE_KEY } from './constants';
import { JobsOptions } from 'bullmq';

export function Processor(
  queueName: string,
  jobOptions?: JobsOptions,
  workerOptions?: IWorkerOptions,
  queueOptions?: IQueueOptions
): ClassDecorator {
  return function (target: any) {
    saveModule(BULLMQ_PROCESSOR_KEY, target);
    saveClassMetadata(
      BULLMQ_PROCESSOR_KEY,
      {
        queueName,
        jobOptions,
        queueOptions,
        workerOptions,
      },
      target
    );
    Provide()(target);
    Scope(ScopeEnum.Request)(target);
  };
}

export function InjectQueue(queueName: string): PropertyDecorator {
  return createCustomPropertyDecorator(BULLMQ_QUEUE_KEY, {
    queueName,
  });
}
