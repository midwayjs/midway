import {
  Provide,
  saveClassMetadata,
  saveModule,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import { BULL_QUEUE_KEY, BULL_REPEATABLE_QUEUE_KEY } from './constants';
import { QueueOptions } from 'bull';

export function Queue(queueOptions?: QueueOptions): ClassDecorator;
export function Queue(
  queueName?: string,
  queueOptions?: QueueOptions
): ClassDecorator;
export function Queue(
  queueName?: string,
  concurrency?: number,
  queueOptions?: QueueOptions
): ClassDecorator;
export function Queue(
  queueName?: any,
  concurrency?: any,
  queueOptions?: QueueOptions
): ClassDecorator {
  return function (target) {
    if (typeof queueName !== 'string') {
      queueOptions = queueName;
      queueName = `${target.name}:execute`;
      concurrency = 1;
    }
    if (typeof concurrency !== 'number') {
      queueOptions = concurrency;
      concurrency = 1;
    }
    saveModule(BULL_QUEUE_KEY, target);
    saveClassMetadata(
      BULL_QUEUE_KEY,
      {
        queueName,
        queueOptions,
        concurrency,
      },
      target
    );
    Provide()(target);
    Scope(ScopeEnum.Request)(target);
  };
}

export function RepeatableQueue(queueOptions?: QueueOptions): ClassDecorator;
export function RepeatableQueue(
  queueName?: string,
  queueOptions?: QueueOptions
): ClassDecorator;
export function RepeatableQueue(
  queueName?: string,
  concurrency?: number,
  queueOptions?: QueueOptions
): ClassDecorator;
export function RepeatableQueue(
  queueName?: any,
  concurrency?: any,
  queueOptions?: QueueOptions
): ClassDecorator {
  return function (target) {
    if (typeof queueName !== 'string') {
      queueOptions = queueName;
      queueName = `${target.name}:execute`;
      concurrency = 1;
    }
    if (typeof concurrency !== 'number') {
      queueOptions = concurrency;
      concurrency = 1;
    }
    saveModule(BULL_REPEATABLE_QUEUE_KEY, target);
    saveClassMetadata(
      BULL_REPEATABLE_QUEUE_KEY,
      {
        queueName,
        queueOptions,
        concurrency,
      },
      target
    );
    Provide()(target);
    Scope(ScopeEnum.Request)(target);
  };
}
