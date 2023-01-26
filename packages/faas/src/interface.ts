import {
  MidwayRequestContainer,
  IMidwayApplication,
  IConfigurationOptions,
  IMidwayContext,
  NextFunction as BaseNextFunction,
  CommonMiddlewareUnion,
  ContextMiddlewareManager,
  IMidwayBootstrapOptions,
  ObjectIdentifier,
} from '@midwayjs/core';
import { FaaSHTTPContext } from '@midwayjs/faas-typings';
import { ILogger } from '@midwayjs/logger';
import { Application as ServerlessHttpApplication } from '@midwayjs/serverless-http-parser';

export interface FaaSContext extends IMidwayContext<FaaSHTTPContext> {
  logger: ILogger;
  env: string;
  requestContext: MidwayRequestContainer;
  originContext: any;
}
/**
 * @deprecated
 */
export type FaaSMiddleware =
  | ((context: Context, next: () => Promise<any>) => any)
  | string;

export interface HandlerOptions {
  isHttpFunction: boolean;
}

export type IMidwayFaaSApplication = IMidwayApplication<
  Context,
  {
    getInitializeContext();
    /**
     * @deprecated use useMiddleware instead
     */
    use(middleware: FaaSMiddleware);
    /**
     * @deprecated
     * @param middlewareId
     */
    generateMiddleware(middlewareId: any): Promise<FaaSMiddleware>;
    /**
     * Get function name in serverless environment
     */
    getFunctionName(): string;
    /**
     * Get function service name in serverless environment
     */
    getFunctionServiceName(): string;

    useEventMiddleware(
      middleware: CommonMiddlewareUnion<Context, NextFunction, undefined>
    ): void;
    getEventMiddleware(): ContextMiddlewareManager<
      Context,
      NextFunction,
      undefined
    >;
    invokeTriggerFunction(
      context,
      handler: string,
      options: HandlerOptions
    ): Promise<any>;
    getServerlessInstance<T>(
      serviceClass: ObjectIdentifier | { new (...args): T },
      customContext?: Record<string, any>
    ): Promise<T>;
  }
> &
  ServerlessHttpApplication;

export interface Application extends IMidwayFaaSApplication {}

export interface Context extends FaaSContext {}
export type NextFunction = BaseNextFunction;

export interface IFaaSConfigurationOptions extends IConfigurationOptions {
  config?: object;
  initializeContext?: object;
  applicationAdapter?: {
    /**
     * @deprecated
     */
    getApplication(): Application;
    getFunctionName(): string;
    getFunctionServiceName(): string;
    runAppHook?(app: Application): void;
    runContextHook?(ctx: Context): void;
  };
}

/**
 * @deprecated
 */
export interface IWebMiddleware {
  resolve(): FaaSMiddleware;
}

export interface ServerlessStarterOptions extends IMidwayBootstrapOptions {
  initializeMethodName?: string;
  handlerName?: string;
  aggregationHandlerName?: string;
  handlerNameMapping?: (
    handlerName: string,
    ...args: unknown[]
  ) => [string, ...unknown[]];
  createAdapter?: () => Promise<{
    close();
    createAppHook(app?);
  }>;
  performance?: {
    mark(label: string);
    end();
  };
}
