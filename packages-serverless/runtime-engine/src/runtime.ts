import { EventEmitter } from 'events';
import {
  ContextExtensionHandler,
  EventExtensionHandler,
  IServerlessLogger,
  LoggerFactory,
  PropertyParser,
  Runtime,
  FunctionEvent,
  BootstrapOptions,
} from './interface';
import { join } from 'path';
import { EnvPropertyParser } from './lib/parser';
import { DebugLogger } from './lib/debug';
import { BaseLoggerFactory } from './lib/loggerFactory';
import { fileExists, getHandlerMeta, getHandlerMethod } from './util';
import { performance } from 'perf_hooks';

export class ServerlessBaseRuntime extends EventEmitter implements Runtime {
  propertyParser: PropertyParser<string>;
  debugLogger = new DebugLogger('base_runtime');
  loggerFactory: LoggerFactory;
  contextExtensions: ContextExtensionHandler[];
  eventHandlers: FunctionEvent[] = [];
  handlerStore = new Map();
  logger = null;
  protected options: BootstrapOptions = {};

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
    await this.handlerInvokerWrapper('beforeRuntimeStartHandler', [this]);

    for (const eventExtension of eventExtensions) {
      const funEvent = await eventExtension(this);
      if (funEvent) {
        this.eventHandlers.push(funEvent);
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

  async getContext(event: FunctionEvent, newArgs) {
    return this.contextExtensions.reduce(
      (promiseCtx, contextExtension) =>
        promiseCtx.then(ctx => {
          return Promise.resolve(contextExtension(ctx, this)).then(
            (realCtx: any) => realCtx || ctx
          );
        }),
      Promise.resolve(this.createFunctionContext(event, newArgs))
    );
  }

  async emitHandler(funEvent: FunctionEvent, args) {
    let newArgs = args;
    if (funEvent.transformInvokeArgs) {
      newArgs = funEvent.transformInvokeArgs.call(funEvent, args) || [];
    }

    const context = await this.getContext(funEvent, newArgs);
    try {
      await this.handlerInvokerWrapper('beforeInvokeHandler', [
        context,
        args,
        funEvent.meta,
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
        return this.defaultInvokeHandler(...args);
      }
    } catch (err) {
      error = err;
      this.logger.error(err);
    }

    return Promise.reject(error);
  }

  async triggerRoute(payload): Promise<FunctionEvent> {
    for (const event of this.eventHandlers) {
      if (event.match(payload)) {
        return event;
      }
    }
    throw new Error('trigger not found');
  }

  async invoke(payload: any): Promise<any> {
    const funEvent = await this.triggerRoute(payload);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(
          new Error(`function invoke timeout: ${JSON.stringify(payload)}`)
        );
      }, Number(this.propertyParser.getFuncTimeout()));
      this.emitHandler(funEvent, payload)
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

  async defaultInvokeHandler(...args) {
    const { fileName, handler } = getHandlerMeta(
      this.propertyParser.getFunctionHandler()
    );
    throw new Error(
      `handler not found: ${fileName}.${handler}, please check your f.yml`
    );
  }

  createFunctionContext(event: FunctionEvent, ...args): any {
    if (event.getContext) {
      return event.getContext(args);
    }
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
    performance.mark(`midway-faas:${handlerKey}:start`);
    if (this.handlerStore.has(handlerKey)) {
      const handlers = this.handlerStore.get(handlerKey);
      this.debugLogger.log(`${handlerKey} exec, task = ${handlers.length}`);
      for (const handler of handlers) {
        await handler.apply(this, args);
      }
    }
    performance.mark(`midway-faas:${handlerKey}:end`);
  }

  setOptions(options) {
    this.options = options;
  }

  get isAppMode() {
    return !!this.options.isAppMode;
  }

  /**
   * get function name in runtime
   */
  getFunctionName(): string {
    return process.env.MIDWAY_SERVERLESS_FUNCTION_NAME || '';
  }

  /**
   * get function service/group in runtime
   */
  getFunctionServiceName(): string {
    return process.env.MIDWAY_SERVERLESS_SERVICE_NAME || '';
  }
}
