import { CRUD_SERVICE_KEY } from '../constants';
import { CrudConfigError } from '../error';
import {
  FunctionalApiBuilder,
  FunctionalCrudOptions,
  FunctionalCrudRouteFactory,
  FunctionalRouteBuilder,
  FunctionalRouteDefinition,
} from '../interface';
import { buildCrudRoutes, createCrudRouteHandler } from '../routeBuilder';

function createFallbackBuilder(method: string, path: string): FunctionalRouteBuilder {
  return {
    method,
    path,
    handle(fn: Function): FunctionalRouteDefinition {
      return {
        method,
        path,
        handler: fn,
      };
    },
  };
}

/**
 * Builds a stable route map factory for functional CRUD usage.
 */
export function createFunctionalCrudRouteMap(
  api: FunctionalApiBuilder,
  options: FunctionalCrudOptions
): Record<string, FunctionalRouteBuilder | FunctionalRouteDefinition> {
  const routes: Record<string, FunctionalRouteBuilder | FunctionalRouteDefinition> = {};

  for (const route of buildCrudRoutes(options)) {
    const methodName = route.method.toLowerCase() as keyof FunctionalApiBuilder;
    const builderFactory = api?.[methodName];
    const builder =
      typeof builderFactory === 'function'
        ? builderFactory.call(api, route.path)
        : createFallbackBuilder(route.method, route.path);
    routes[route.name] = builder.handle(async ({ input, ctx }: any) => {
      const requestContext = ctx?.requestContext;
      if (!requestContext?.getAsync || !options.service) {
        throw new CrudConfigError(
          'Functional CRUD routes require ctx.requestContext and options.service'
        );
      }
      const service = await requestContext.getAsync(options.service as any);
      return createCrudRouteHandler(
        route.name,
        {
          [CRUD_SERVICE_KEY]: service,
        },
        options
      )({
        params: input?.params ?? ctx?.params ?? {},
        query: input?.query ?? ctx?.query ?? {},
        body: input?.body ?? ctx?.request?.body,
        ctx,
      });
    });
  }

  return routes;
}

/**
 * Returns a route factory compatible with defineApi().
 */
export function buildFunctionalCrudRoutes<T = any>(
  options: FunctionalCrudOptions
): FunctionalCrudRouteFactory<T> {
  return (api: FunctionalApiBuilder) => createFunctionalCrudRouteMap(api, options);
}
