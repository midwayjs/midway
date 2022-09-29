import {
  createCustomPropertyDecorator,
  Provide,
  saveClassMetadata,
  saveModule,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import { BULL_QUEUE_KEY, BULL_PROCESSOR_KEY } from './constants';
import { JobOptions } from 'bull';

export function Processor(
  queueName: string,
  Options?: JobOptions
): ClassDecorator;
export function Processor(
  queueName: string,
  concurrency?: number,
  jobOptions?: JobOptions
): ClassDecorator;
export function Processor(
  queueName: string,
  concurrency?: any,
  jobOptions?: JobOptions
): ClassDecorator {
  return function (target: any) {
    if (typeof concurrency !== 'number') {
      jobOptions = concurrency;
      concurrency = 1;
    }

    saveModule(BULL_PROCESSOR_KEY, target);
    saveClassMetadata(
      BULL_PROCESSOR_KEY,
      {
        queueName,
        concurrency,
        jobOptions,
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
