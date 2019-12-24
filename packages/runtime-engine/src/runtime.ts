import { EventEmitter } from 'events';
import {
  ContextExtensionHandler,
  EventExtensionHandler,
  IServerlessLogger,
  LoggerFactory,
  PropertyParser,
  Runtime,
} from './interface';
import { join } from 'path';
import { EnvPropertyParser } from './lib/parser';
import { DebugLogger } from './lib/debug';
import { BaseLoggerFactory } from './lib/loggerFactory';
import { fileExists, getHandlerMeta, getHandlerMethod } from './util';

export class ServerlessBaseRuntime extends EventEmitter implements Runtime {
  propertyParser: PropertyParser<string>;
  debugLogger = new DebugLogger('base_runtime');
  loggerFactory: LoggerFactory;
  contextExtensions: ContextExtensionHandler[];
  eventHandlers: Array<(payload: any) => Promise<any>> = [];
  handlerStore = new Map();
  logger = null;

  constructor() {
    super();
    this.propertyParser = this.createEnvParser();
    this.loggerFactory = this.createLoggerFactory();
    this.logger = this.loggerFactory.createLogger();
  }

  init(contextExtensions) {
    this.contextExtensions = contextExtensions;
  }

  async runtimeStart(eventExtensions: EventExtensionHandler[]) {
    const self = this;
    await this.handlerInvokerWrapper('beforeRuntimeStartHandler', [this]);

    // create trigger
    for (const eventExtension of eventExtensions) {
      const funEvent = await eventExtension(self);
      if (funEvent) {
        const handler = await funEvent.create(this, (eventType, meta) => {
          return (...args) => {
            return new Promise((resolve, reject) => {
              const timer = setTimeout(() => {
                reject(
                  new Error(`function invoke timeout: ${JSON.stringify(args)}`)
                );
              }, Number(this.propertyParser.getFuncTimeout()));
              this.eventHandler(funEvent, eventType, args, meta)
                .then(res => {
                  clearTimeout(timer);
                  resolve(res);
                })
                .catch(err => {
                  clearTimeout(timer);
                  reject(err);
                });
            });
          };
        });
        this.eventHandlers.push(handler);
      }
    }

    await this.handlerInvokerWrapper('afterRuntimeStartHandler', [this]);
  }

  async functionStart() {
    await this.handlerInvokerWrapper('beforeFunctionStartHandler', [this]);
    // invoke init handler
    await this.invokeInitHandler({
      baseDir: this.propertyParser.getEntryDir(),
    });
    await this.handlerInvokerWrapper('afterFunctionStartHandler', [this]);
  }

  async getContext(eventType, newArgs) {
    return this.contextExtensions.reduce(
      (promiseCtx, contextExtension) =>
        promiseCtx.then(ctx => {
          return Promise.resolve(contextExtension(ctx, this)).then(
            (realCtx: any) => realCtx || ctx
          );
        }),
      Promise.resolve(this.createFunctionContext(eventType, newArgs))
    );
  }

  async eventHandler(funEvent, eventType, args, meta) {
    let newArgs = args;
    if (funEvent.transformInvokeArgs) {
      newArgs = funEvent.transformInvokeArgs(...args) || [];
    }

    const context = await this.getContext(eventType, newArgs);
    try {
      await this.handlerInvokerWrapper('beforeInvokeHandler', [
        context,
        args,
        meta,
      ]);
      const result = await this.invokeDataHandler(context, ...newArgs);
      await this.handlerInvokerWrapper('afterInvokeHandler', [
        null,
        result,
        context,
      ]);
      return result;
    } catch (err) {
      await this.handlerInvokerWrapper('afterInvokeHandler', [
        err,
        null,
        context,
      ]);
      if (context.logger && typeof context.logger.error === 'function') {
        context.logger.error(err);
      }
      err.message = `${err.message}, \nStack: ${err.stack}`;
      throw err;
    }
  }

  async ready() {
    await this.handlerInvokerWrapper('beforeReadyHandler', [this]);
    // TODO 增加健康检查
  }

  async close() {
    await this.handlerInvokerWrapper('beforeCloseHandler', [this]);
  }

  createEnvParser(): PropertyParser<string> {
    return new EnvPropertyParser<string>();
  }

  createLogger(options?): IServerlessLogger {
    return console as IServerlessLogger;
  }

  createLoggerFactory() {
    const homeDir = this.getProperty('HOME');
    return new BaseLoggerFactory(homeDir || process.cwd(), this.propertyParser);
  }

  async invokeInitHandler(...args) {
    let func;
    const entryDir = this.propertyParser.getEntryDir();
    const { fileName, handler } = getHandlerMeta(
      this.propertyParser.getInitHandler()
    );
    if (await fileExists(entryDir, fileName)) {
      try {
        func = getHandlerMethod(join(entryDir, fileName), handler);
        this.debugLogger.log('invoke init handler');
        if (func) {
          this.debugLogger.log('found handler and call');
          return await new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
              // TODO error stack
              reject(new Error('timeout'));
            }, Number(this.propertyParser.getInitTimeout()));
            Promise.resolve(func.call(this, this, ...args))
              .then(res => {
                clearTimeout(timer);
                resolve(res);
              })
              .catch(err => {
                clearTimeout(timer);
                reject(err);
              });
          });
        }
      } catch (err) {
        err.message = `function init error with: ${err.message}`;
        throw err;
      }
    } else {
      this.debugLogger.log('no init handler found');
    }
  }

  async invokeDataHandler(...args) {
    const entryDir = this.propertyParser.getEntryDir();
    const { fileName, handler } = getHandlerMeta(
      this.propertyParser.getFunctionHandler()
    );
    let error = new Error(`invoke handler not found: ${fileName}.${handler}`);
    try {
      let func;
      const flag = await fileExists(entryDir, fileName);
      if (flag) {
        this.debugLogger.log('invoke data handler');
        func = getHandlerMethod(join(entryDir, fileName), handler);
      }
      if (flag && func) {
        this.debugLogger.log('found handler and call');
        return func.apply(this, args);
      } else {
        return this.defaultInvokeHandler.apply(this, args);
      }
    } catch (err) {
      error = err;
      this.logger.error(err);
    }

    return Promise.reject(error);
  }

  async defaultInvokeHandler(...args) {
    throw new Error('invoke handler not found');
  }

  createFunctionContext(type, ...args): any {
    return {};
  }

  getProperty(propertyKey: string) {
    return this.propertyParser.getProperty(propertyKey);
  }

  getPropertyParser(): PropertyParser<string> {
    return this.propertyParser;
  }

  getContextExtensions(): ContextExtensionHandler[] {
    return this.contextExtensions;
  }

  protected async handlerInvokerWrapper(handlerKey: string, args?) {
    if (this.handlerStore.has(handlerKey)) {
      const handlers = this.handlerStore.get(handlerKey);
      this.debugLogger.log(`${handlerKey} exec, task = ${handlers.length}`);
      for (const handler of handlers) {
        await handler.apply(this, args);
      }
    }
  }
}
