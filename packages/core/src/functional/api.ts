import { NextFunction } from '../interface';
import {
  Controller,
  RequestMapping,
  RequestMethod,
  FUNCTIONAL_API_CONTROLLER_KEY,
  CONTROLLER_KEY,
  DecoratorManager,
} from '../decorator';
import { MidwayCommonError } from '../error';
import { MetadataManager } from '../decorator/metadataManager';
import { debuglog } from 'util';
import { createHash } from 'crypto';
import {
  FUNCTIONAL_API_CONTROLLER_CLASS_KEY,
  FUNCTIONAL_API_MODULE_META_KEY,
} from './constants';

const debug = debuglog('midway:debug');

function normalizeClassNameSegment(input: string, fallback = 'root') {
  const normalized = (input || '')
    .replace(/[^a-zA-Z0-9_$]+/g, '_')
    .replace(/^(\d)/, '_$1')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  return normalized || fallback;
}

function createNamedFunctionalController(
  prefix: string,
  routeNames: string[]
): new () => any {
  const prefixPart = normalizeClassNameSegment(prefix);
  const hash = createHash('sha1')
    .update(`${prefix}|${routeNames.join('|')}`)
    .digest('hex')
    .slice(0, 8);
  const className = `FunctionalApi_${prefixPart}_${hash}`;
  return {
    [className]: class {},
  }[className] as new () => any;
}

export interface FunctionalRouteInput<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown,
  THeaders = unknown,
> {
  params?: TParams;
  query?: TQuery;
  body?: TBody;
  headers?: THeaders;
}

type EmptyFunctionalRouteInput = FunctionalRouteInput<
  undefined,
  undefined,
  undefined,
  undefined
>;

type InferSafeParseData<TResult> = Extract<TResult, { success: true }> extends {
  data: infer TData;
}
  ? TData
  : unknown;

type InferSchemaValue<TSchema> = [TSchema] extends [undefined]
  ? unknown
  : TSchema extends { parseAsync(value: any): Promise<infer TResult> }
    ? TResult
    : TSchema extends { parse(value: any): infer TResult }
      ? TResult
      : TSchema extends { safeParseAsync(value: any): Promise<infer TResult> }
        ? InferSafeParseData<TResult>
        : TSchema extends { safeParse(value: any): infer TResult }
          ? InferSafeParseData<TResult>
          : unknown;

type InferFunctionalRouteInput<TInput extends FunctionalRouteInput> = ([TInput['params']] extends [undefined]
  ? { params?: unknown }
  : { params: InferSchemaValue<TInput['params']> }) &
  ([TInput['query']] extends [undefined]
    ? { query?: unknown }
    : { query: InferSchemaValue<TInput['query']> }) &
  ([TInput['body']] extends [undefined]
    ? { body?: unknown }
    : { body: InferSchemaValue<TInput['body']> }) &
  ([TInput['headers']] extends [undefined]
    ? { headers?: unknown }
    : { headers: InferSchemaValue<TInput['headers']> });

export interface FunctionalRouteHandlerArgs<
  TInput extends FunctionalRouteInput = EmptyFunctionalRouteInput,
> {
  input: InferFunctionalRouteInput<TInput>;
  ctx: any;
  next?: NextFunction;
}

export interface FunctionalRouteDefinition<
  TInput extends FunctionalRouteInput = EmptyFunctionalRouteInput,
  TOutput = unknown,
> {
  method: string;
  path: string | RegExp;
  options: FunctionalRouteOptions<TInput, TOutput>;
  handle: (args: FunctionalRouteHandlerArgs<TInput>) => Promise<unknown> | unknown;
}

export interface FunctionalRouteOptions<
  TInput extends FunctionalRouteInput = EmptyFunctionalRouteInput,
  TOutput = unknown,
> {
  routerName?: string;
  middleware?: any[];
  summary?: string;
  description?: string;
  ignoreGlobalPrefix?: boolean;
  input?: TInput;
  output?: TOutput;
}

export type FunctionalControllerOptions = {
  sensitive?: boolean;
  middleware?: any[];
  alias?: string[];
  description?: string;
  tagName?: string;
  ignoreGlobalPrefix?: boolean;
  version?: string | string[];
  versionType?: 'URI' | 'HEADER' | 'MEDIA_TYPE' | 'CUSTOM';
  versionPrefix?: string;
};

export interface FunctionalApiModuleMeta {
  prefix: string;
  ignoreGlobalPrefix?: boolean;
  version?: string | string[];
  versionType?: 'URI' | 'HEADER' | 'MEDIA_TYPE' | 'CUSTOM';
  versionPrefix?: string;
}

export interface RouteBuilder<
  TInput extends FunctionalRouteInput = EmptyFunctionalRouteInput,
  TOutput = unknown,
> {
  input<
    TParams = undefined,
    TQuery = undefined,
    TBody = undefined,
    THeaders = undefined,
  >(
    schema: FunctionalRouteInput<TParams, TQuery, TBody, THeaders>
  ): RouteBuilder<
    FunctionalRouteInput<TParams, TQuery, TBody, THeaders>,
    TOutput
  >;
  output<TNextOutput>(schema: TNextOutput): RouteBuilder<TInput, TNextOutput>;
  middleware(mw: any[]): RouteBuilder<TInput, TOutput>;
  meta(
    options: Omit<FunctionalRouteOptions<TInput, TOutput>, 'input' | 'output'>
  ): RouteBuilder<TInput, TOutput>;
  handle(
    fn: FunctionalRouteDefinition<TInput, TOutput>['handle']
  ): FunctionalRouteDefinition<TInput, TOutput>;
}

interface RouteBuilderInternal<
  TInput extends FunctionalRouteInput = EmptyFunctionalRouteInput,
  TOutput = unknown,
> extends RouteBuilder<TInput, TOutput> {
  __isRouteBuilder: true;
  __build: () => FunctionalRouteDefinition<TInput, TOutput>;
}

const HTTP_METHODS = [
  RequestMethod.GET,
  RequestMethod.POST,
  RequestMethod.PUT,
  RequestMethod.DELETE,
  RequestMethod.PATCH,
  RequestMethod.OPTIONS,
  RequestMethod.HEAD,
  RequestMethod.ALL,
] as const;

function createRouteBuilder<
  TInput extends FunctionalRouteInput = EmptyFunctionalRouteInput,
  TOutput = unknown,
>(
  method: string,
  path: string | RegExp = '/'
): RouteBuilderInternal<TInput, TOutput> {
  const route: Omit<FunctionalRouteDefinition<TInput, TOutput>, 'handle'> & {
    handle?: FunctionalRouteDefinition<TInput, TOutput>['handle'];
  } = {
    method,
    path,
    options: {
      middleware: [],
    },
  };

  const builder: RouteBuilderInternal<TInput, TOutput> = {
    __isRouteBuilder: true,
    input(schema) {
      route.options.input = schema as any;
      return builder as any;
    },
    output(schema) {
      route.options.output = schema as any;
      return builder as any;
    },
    middleware(mw) {
      route.options.middleware = mw || [];
      return builder;
    },
    meta(options) {
      route.options = {
        ...route.options,
        ...(options || {}),
      };
      return builder;
    },
    handle(fn) {
      route.handle = fn;
      return builder.__build();
    },
    __build() {
      if (!route.handle) {
        throw new Error(
          'Functional route is missing handler, call .handle(fn) to finish route definition'
        );
      }
      return route as FunctionalRouteDefinition<TInput, TOutput>;
    },
  };

  return builder;
}

function getInputFromContext(
  ctx: any
): FunctionalRouteInput<unknown, unknown, unknown, unknown> {
  return {
    params: ctx?.params,
    query: ctx?.query,
    body: ctx?.request?.body,
    headers: ctx?.headers ?? ctx?.request?.headers,
  };
}

async function runSchemaValidation(
  schema: any,
  value: any,
  label: string
): Promise<any> {
  if (!schema) {
    return value;
  }

  try {
    if (typeof schema.safeParseAsync === 'function') {
      const result = await schema.safeParseAsync(value);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    }

    if (typeof schema.safeParse === 'function') {
      const result = schema.safeParse(value);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    }

    if (typeof schema.parseAsync === 'function') {
      return await schema.parseAsync(value);
    }

    if (typeof schema.parse === 'function') {
      return schema.parse(value);
    }
  } catch (err) {
    throw new MidwayCommonError(
      `Functional API ${label} validation failed: ${err?.message || err}`
    );
  }

  return value;
}

async function validateInput<TInput extends FunctionalRouteInput>(
  schema: FunctionalRouteDefinition<TInput>['options']['input'],
  input: FunctionalRouteInput
): Promise<InferFunctionalRouteInput<TInput>> {
  if (!schema) {
    return input as InferFunctionalRouteInput<TInput>;
  }

  return {
    params: await runSchemaValidation(
      schema.params,
      input.params,
      'input.params'
    ),
    query: await runSchemaValidation(schema.query, input.query, 'input.query'),
    body: await runSchemaValidation(schema.body, input.body, 'input.body'),
    headers: await runSchemaValidation(
      schema.headers,
      input.headers,
      'input.headers'
    ),
  } as InferFunctionalRouteInput<TInput>;
}

function normalizeRouteDefinition<
  TInput extends FunctionalRouteInput = EmptyFunctionalRouteInput,
  TOutput = unknown,
>(
  routeName: string,
  routeValue:
    | FunctionalRouteDefinition<TInput, TOutput>
    | RouteBuilderInternal<TInput, TOutput>
): FunctionalRouteDefinition<TInput, TOutput> {
  const route = (routeValue as RouteBuilderInternal<TInput, TOutput>)
    ?.__isRouteBuilder
    ? (routeValue as RouteBuilderInternal<TInput, TOutput>).__build()
    : (routeValue as FunctionalRouteDefinition<TInput, TOutput>);

  if (!route || typeof route !== 'object') {
    throw new Error(
      `Functional route "${routeName}" must be a route definition`
    );
  }

  if (typeof route.handle !== 'function') {
    throw new Error(
      `Functional route "${routeName}" is missing handler, call .handle(fn)`
    );
  }

  return {
    ...route,
    path: route.path || '/',
    options: {
      middleware: [],
      ...route.options,
    },
  } as FunctionalRouteDefinition<TInput, TOutput>;
}

type NormalizeDefinedRoute<T> =
  T extends RouteBuilderInternal<infer TInput, infer TOutput>
    ? FunctionalRouteDefinition<TInput, TOutput>
    : T extends FunctionalRouteDefinition<infer TInput, infer TOutput>
      ? FunctionalRouteDefinition<TInput, TOutput>
      : never;

type NormalizeDefinedRoutes<
  TRoutes extends Record<string, FunctionalRouteDefinition | RouteBuilderInternal>,
> = {
  [K in keyof TRoutes]: NormalizeDefinedRoute<TRoutes[K]>;
};

export function defineApi<
  TRoutes extends Record<
    string,
    FunctionalRouteDefinition<any, any> | RouteBuilderInternal<any, any>
  >,
>(
  prefix: string,
  factory: (api: {
    get(path?: string | RegExp): RouteBuilder;
    post(path?: string | RegExp): RouteBuilder;
    put(path?: string | RegExp): RouteBuilder;
    delete(path?: string | RegExp): RouteBuilder;
    patch(path?: string | RegExp): RouteBuilder;
    options(path?: string | RegExp): RouteBuilder;
    head(path?: string | RegExp): RouteBuilder;
    all(path?: string | RegExp): RouteBuilder;
  }) => TRoutes,
  controllerOptions: FunctionalControllerOptions = {
    middleware: [],
    sensitive: true,
  }
): NormalizeDefinedRoutes<TRoutes> {
  const routeFactory = {
    get(path: string | RegExp = '/') {
      return createRouteBuilder(RequestMethod.GET, path);
    },
    post(path: string | RegExp = '/') {
      return createRouteBuilder(RequestMethod.POST, path);
    },
    put(path: string | RegExp = '/') {
      return createRouteBuilder(RequestMethod.PUT, path);
    },
    delete(path: string | RegExp = '/') {
      return createRouteBuilder(RequestMethod.DELETE, path);
    },
    patch(path: string | RegExp = '/') {
      return createRouteBuilder(RequestMethod.PATCH, path);
    },
    options(path: string | RegExp = '/') {
      return createRouteBuilder(RequestMethod.OPTIONS, path);
    },
    head(path: string | RegExp = '/') {
      return createRouteBuilder(RequestMethod.HEAD, path);
    },
    all(path: string | RegExp = '/') {
      return createRouteBuilder(RequestMethod.ALL, path);
    },
  };

  const definedRoutes = factory(routeFactory);
  const normalizedRoutes = {} as Record<string, FunctionalRouteDefinition<any, any>>;
  const routeNames = Object.keys(definedRoutes || {});

  const FunctionalApiController = createNamedFunctionalController(
    prefix,
    routeNames
  );
  const controllerClassName = FunctionalApiController.name;

  debug(
    `[functional-api] begin register routes, controller="${controllerClassName}", prefix="${prefix}", count=${routeNames.length}`
  );

  for (const routeName of routeNames) {
    const route = normalizeRouteDefinition(routeName, definedRoutes[routeName]);
    normalizedRoutes[routeName] = route;

    if (!HTTP_METHODS.includes(route.method as any)) {
      throw new Error(
        `Functional route "${routeName}" has unsupported http method "${route.method}"`
      );
    }

    Object.defineProperty(FunctionalApiController.prototype, routeName, {
      value: async function (ctx: any, next?: NextFunction) {
        const rawInput = getInputFromContext(ctx);
        const validatedInput = await validateInput(
          route.options.input,
          rawInput
        );
        const result = await route.handle({
          input: validatedInput,
          ctx,
          next,
        });
        return runSchemaValidation(route.options.output, result, 'output');
      },
      writable: false,
      enumerable: false,
      configurable: false,
    });

    const descriptor = Object.getOwnPropertyDescriptor(
      FunctionalApiController.prototype,
      routeName
    )!;

    RequestMapping({
      path: route.path,
      requestMethod: route.method,
      routerName: route.options.routerName,
      middleware: route.options.middleware || [],
      summary: route.options.summary,
      description: route.options.description,
      ignoreGlobalPrefix: route.options.ignoreGlobalPrefix,
    })(FunctionalApiController.prototype, routeName, descriptor);

    debug(
      `[functional-api] register route, controller="${controllerClassName}", prefix="${prefix}", method=${String(
        route.method
      ).toUpperCase()}, path="${String(
        route.path
      )}", routeName="${routeName}", routerName="${
        route.options.routerName || routeName
      }"`
    );
  }

  Controller(prefix, controllerOptions)(FunctionalApiController);
  // Keep compatibility with mock container module filtering:
  // class-based controllers are marked via container.bindClass(onBeforeBind),
  // while defineApi creates an internal class that may not be bound directly.
  // If mock bind map exists, mark this generated controller as bound.
  const bindModuleMap = (DecoratorManager as any)?._bindModuleMap as
    | WeakMap<any, boolean>
    | undefined;
  if (bindModuleMap && typeof bindModuleMap.set === 'function') {
    bindModuleMap.set(FunctionalApiController, true);
  }
  // In some integration paths (e.g. mixed runtime loaders), make sure
  // functional controllers are visible to the active/global decorator manager.
  DecoratorManager.saveModule(CONTROLLER_KEY, FunctionalApiController);
  const globalDecoratorManager = globalThis[
    'MIDWAY_GLOBAL_DECORATOR_MANAGER'
  ] as typeof DecoratorManager;
  if (
    globalDecoratorManager &&
    globalDecoratorManager !== DecoratorManager &&
    typeof globalDecoratorManager.saveModule === 'function'
  ) {
    globalDecoratorManager.saveModule(CONTROLLER_KEY, FunctionalApiController);
  }
  MetadataManager.defineMetadata(
    FUNCTIONAL_API_CONTROLLER_KEY,
    true,
    FunctionalApiController
  );

  Object.defineProperty(normalizedRoutes, FUNCTIONAL_API_MODULE_META_KEY, {
    value: {
      prefix,
      ignoreGlobalPrefix: controllerOptions?.ignoreGlobalPrefix,
      version: controllerOptions?.version,
      versionType: controllerOptions?.versionType,
      versionPrefix: controllerOptions?.versionPrefix,
    } as FunctionalApiModuleMeta,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  MetadataManager.defineMetadata(
    FUNCTIONAL_API_CONTROLLER_CLASS_KEY,
    FunctionalApiController,
    normalizedRoutes
  );
  // Keep hidden property for compatibility with existing ecosystem reads.
  Object.defineProperty(normalizedRoutes, FUNCTIONAL_API_CONTROLLER_CLASS_KEY, {
    value: FunctionalApiController,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  return normalizedRoutes as NormalizeDefinedRoutes<TRoutes>;
}
