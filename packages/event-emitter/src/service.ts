import { EventEmitter2 as EventEmitter, OnOptions } from 'eventemitter2';
import {
  ApplicationContext,
  Config,
  DecoratorManager,
  delegateTargetPrototypeMethod,
  IMidwayContainer,
  Init,
  MetadataManager,
  Singleton,
} from '@midwayjs/core';
import { EVENT_KEY } from './const';
import { EventEmitterConfigOptions, OnEventOptions } from './interface';

@Singleton()
export class EventEmitterService {
  private eventEmitter: EventEmitter;

  @Config('eventEmitter')
  private config: EventEmitterConfigOptions;

  @ApplicationContext()
  private applicationContext: IMidwayContainer;

  @Init()
  async init() {
    this.eventEmitter = new EventEmitter(this.config);
    // proxy eventEmitter public methods to this
    const methods = Object.getOwnPropertyNames(EventEmitter.prototype);
    for (const method of methods) {
      if (
        method !== 'constructor' &&
        typeof this.eventEmitter[method] === 'function'
      ) {
        this[method] = this.eventEmitter[method].bind(this.eventEmitter);
      }
    }

    const events = DecoratorManager.listModule(EVENT_KEY);

    for (const eventModule of events) {
      const props = MetadataManager.getPropertiesWithMetadata<{
        event: string;
        options: OnEventOptions;
      }>(EVENT_KEY, eventModule);
      for (const prop in props) {
        const { event, options = {} } = props[prop];
        const {
          prependListener,
          suppressErrors = true,
          ...emitterOptions
        } = options;

        const listener = async (...args) => {
          try {
            const instance = await this.applicationContext.getAsync(
              eventModule
            );
            await instance[prop](...args);
          } catch (err) {
            if (!suppressErrors) {
              throw err;
            }
            // 如果 suppressErrors 为 true，则忽略错误
          }
        };

        if (prependListener) {
          this.eventEmitter.prependListener(
            event,
            listener,
            emitterOptions as OnOptions
          );
        } else {
          this.eventEmitter.on(event, listener, emitterOptions as OnOptions);
        }
      }
    }
  }

  getEventEmitter() {
    return this.eventEmitter;
  }

  async emitAsync(
    event: string | symbol | string[],
    ...args: any[]
  ): Promise<any[]> {
    const listeners = this.eventEmitter.listeners(event as string);
    const results = [];

    // 执行所有监听器
    for (const listener of listeners) {
      try {
        const result = await listener(...args);
        if (result !== undefined) {
          results.push(result);
        }
      } catch (err) {
        // 如果错误不应该被抑制，则抛出
        if (!err.suppressErrors) {
          throw err;
        }
      }
    }

    return results;
  }

  emit(event: string | symbol | string[], ...args: any[]): boolean {
    const result = this.eventEmitter.emit(event, ...args);
    // 处理异步监听器
    const listeners = this.eventEmitter.listeners(event as string);
    Promise.all(
      listeners.map(async listener => {
        try {
          if (listener.constructor.name === 'AsyncFunction') {
            await listener(...args);
          }
        } catch (err) {
          // 忽略同步 emit 中的错误
        }
      })
    );
    return result;
  }
}

delegateTargetPrototypeMethod(EventEmitterService, [EventEmitter]);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EventEmitterService extends EventEmitter {}
