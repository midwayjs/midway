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
//
// export function Queue(queueOptions?: QueueOptions): ClassDecorator;
// export function Queue(
//   queueName?: string,
//   queueOptions?: QueueOptions
// ): ClassDecorator;
// export function Queue(
//   queueName?: string,
//   concurrency?: number,
//   queueOptions?: QueueOptions
// ): ClassDecorator;
// export function Queue(
//   queueName?: any,
//   concurrency?: any,
//   queueOptions?: QueueOptions
// ): ClassDecorator {
//   return function (target) {
//     if (typeof queueName !== 'string') {
//       queueOptions = queueName;
//       queueName = `${target.name}:execute`;
//       concurrency = 1;
//     }
//     if (typeof concurrency !== 'number') {
//       queueOptions = concurrency;
//       concurrency = 1;
//     }
//     saveModule(BULL_QUEUE_KEY, target);
//     saveClassMetadata(
//       BULL_QUEUE_KEY,
//       {
//         queueName,
//         queueOptions,
//         concurrency,
//       },
//       target
//     );
//     Provide()(target);
//     Scope(ScopeEnum.Singleton)(target);
//   };
// }
