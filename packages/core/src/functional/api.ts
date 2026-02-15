import { NextFunction } from '../interface';
import {
  Controller,
  RequestMapping,
  RequestMethod,
  FUNCTIONAL_API_CONTROLLER_KEY,
} from '../decorator';
import { MidwayCommonError } from '../error';
import { MetadataManager } from '../decorator/metadataManager';

export interface FunctionalRouteInput {
  params?: unknown;
  query?: unknown;
  body?: unknown;
  headers?: unknown;
}

export interface FunctionalRouteHandlerArgs {
  input: FunctionalRouteInput;
  ctx: any;
  next?: NextFunction;
}

export interface FunctionalRouteDefinition {
  method: string;
  path: string | RegExp;
  options: FunctionalRouteOptions;
  handle: (
    args: FunctionalRouteHandlerArgs
  ) => Promise<unknown> | unknown;
}

export interface FunctionalRouteOptions {
  routerName?: string;
  middleware?: any[];
  summary?: string;
  description?: string;
  ignoreGlobalPrefix?: boolean;
  input?: FunctionalRouteInput;
  output?: unknown;
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

export const FUNCTIONAL_API_MODULE_META_KEY = '__midwayApiMeta';

export interface RouteBuilder {
  input(schema: FunctionalRouteOptions['input']): RouteBuilder;
  output(schema: FunctionalRouteOptions['output']): RouteBuilder;
  middleware(mw: any[]): RouteBuilder;
  meta(
    options: Omit<FunctionalRouteOptions, 'input' | 'output'>
  ): RouteBuilder;
  handle(
    fn: FunctionalRouteDefinition['handle']
  ): FunctionalRouteDefinition;
}

interface RouteBuilderInternal extends RouteBuilder {
  __isRouteBuilder: true;
  __build: () => FunctionalRouteDefinition;
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

function createRouteBuilder(
  method: string,
  path: string | RegExp = '/'
): RouteBuilderInternal {
  const route: Omit<FunctionalRouteDefinition, 'handle'> & {
    handle?: FunctionalRouteDefinition['handle'];
  } = {
    method,
    path,
    options: {
      middleware: [],
    },
  };

  const builder: RouteBuilderInternal = {
    __isRouteBuilder: true,
    input(schema) {
      route.options.input = schema;
      return builder;
    },
    output(schema) {
      route.options.output = schema;
      return builder;
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
      return route as FunctionalRouteDefinition;
    },
  };

  return builder;
}

function getInputFromContext(ctx: any): FunctionalRouteInput {
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

async function validateInput(
  schema: FunctionalRouteDefinition['options']['input'],
  input: FunctionalRouteInput
): Promise<FunctionalRouteInput> {
  if (!schema) {
    return input;
  }

  return {
    params: await runSchemaValidation(schema.params, input.params, 'input.params'),
    query: await runSchemaValidation(schema.query, input.query, 'input.query'),
    body: await runSchemaValidation(schema.body, input.body, 'input.body'),
    headers: await runSchemaValidation(
      schema.headers,
      input.headers,
      'input.headers'
    ),
  };
}

function normalizeRouteDefinition(
  routeName: string,
  routeValue: FunctionalRouteDefinition | RouteBuilderInternal
): FunctionalRouteDefinition {
  const route = (routeValue as RouteBuilderInternal)?.__isRouteBuilder
    ? (routeValue as RouteBuilderInternal).__build()
    : (routeValue as FunctionalRouteDefinition);

  if (!route || typeof route !== 'object') {
    throw new Error(`Functional route "${routeName}" must be a route definition`);
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
  };
}

export function defineApi(
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
  }) => Record<string, FunctionalRouteDefinition | RouteBuilderInternal>,
  controllerOptions: FunctionalControllerOptions = {
    middleware: [],
    sensitive: true,
  }
): Record<string, FunctionalRouteDefinition> {
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
  const normalizedRoutes: Record<string, FunctionalRouteDefinition> = {};

  class FunctionalApiController {}

  for (const routeName of Object.keys(definedRoutes || {})) {
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
        const validatedInput = await validateInput(route.options.input, rawInput);
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
  }

  Controller(prefix, controllerOptions)(FunctionalApiController);
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

  return normalizedRoutes;
}
