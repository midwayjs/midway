import {
  createCustomPropertyDecorator,
  Provide,
  saveClassMetadata,
  saveModule,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { QueueOptions } from 'bull';
import { JobOptions } from './interface';
import { BULL_PROCESSOR_KEY, BULL_QUEUE_KEY } from './constants';

export function Processor(
  queueName: string,
  jobOptions?: JobOptions,
  queueOptions?: QueueOptions
): ClassDecorator;
export function Processor(
  queueName: string,
  concurrency?: number,
  jobOptions?: JobOptions,
  queueOptions?: QueueOptions
): ClassDecorator;
export function Processor(
  queueName: string,
  concurrency?: number | JobOptions,
  jobOptions?: JobOptions | QueueOptions,
  queueOptions?: JobOptions | QueueOptions
): ClassDecorator {
  return function (target: any) {
    if (typeof concurrency !== 'number') {
      queueOptions = { ...jobOptions };
      jobOptions = { ...concurrency };
      concurrency = 1;
    }
    saveModule(BULL_PROCESSOR_KEY, target);
    saveClassMetadata(
      BULL_PROCESSOR_KEY,
      {
        queueName,
        concurrency,
        jobOptions,
        queueOptions,
      },
      target
    );
    Provide()(target);
    Scope(ScopeEnum.Request)(target);
  };
}

export function InjectQueue(queueName: string): PropertyDecorator {
  return createCustomPropertyDecorator(BULL_QUEUE_KEY, {
    queueName,
  });
}
