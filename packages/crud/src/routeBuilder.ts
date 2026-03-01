import { CRUD_SERVICE_KEY } from './constants';
import { CrudConfigError, CrudNotFoundError } from './error';
import { CrudOptions, CrudRouteDefinition, CrudRouteName } from './interface';
import { parseCrudId, parseCrudQuery } from './queryParser';
import { applyCrudValidation } from './validation';

const DEFAULT_ROUTE_DEFINITIONS: Record<CrudRouteName, CrudRouteDefinition> = {
  list: { name: 'list', method: 'GET', path: '/' },
  detail: { name: 'detail', method: 'GET', path: '/:id' },
  create: { name: 'create', method: 'POST', path: '/' },
  update: { name: 'update', method: 'PATCH', path: '/:id' },
  replace: { name: 'replace', method: 'PUT', path: '/:id' },
  delete: { name: 'delete', method: 'DELETE', path: '/:id' },
  createMany: { name: 'createMany', method: 'POST', path: '/bulk' },
  deleteMany: { name: 'deleteMany', method: 'DELETE', path: '/bulk' },
};

/**
 * Returns enabled CRUD routes after applying only/exclude rules.
 */
export function getEnabledCrudRoutes(options: CrudOptions): CrudRouteName[] {
  const only = options.routes?.only;
  const exclude = options.routes?.exclude ?? [];
  const source = only?.length
    ? only
    : (['list', 'detail', 'create', 'update', 'delete'] as CrudRouteName[]);
  return source.filter(route => !exclude.includes(route));
}

/**
 * Builds the default route table for a CRUD resource.
 */
export function buildCrudRoutes(options: CrudOptions): CrudRouteDefinition[] {
  return getEnabledCrudRoutes(options).map(
    name => DEFAULT_ROUTE_DEFINITIONS[name]
  );
}

/**
 * Creates a runtime handler that forwards to the bound CRUD service.
 */
export function createCrudRouteHandler(
  route: CrudRouteName,
  controllerInstance: unknown,
  options: CrudOptions
): (payload?: any) => Promise<any> {
  return async function crudRouteHandler(payload: any = {}) {
    const service = (controllerInstance as any)?.[CRUD_SERVICE_KEY];
    if (!service) {
      throw new CrudConfigError(
        `Controller is missing "${CRUD_SERVICE_KEY}" binding`
      );
    }

    const ctxPayload = {
      ctx: payload.ctx,
    };

    switch (route) {
      case 'list':
        await applyCrudValidation(route, options, payload);
        return service.list(
          parseCrudQuery(payload.query ?? {}, options),
          ctxPayload
        );
      case 'detail':
        return service
          .findOne(parseCrudId(payload.params?.id, options), ctxPayload)
          .then((entity: unknown) => {
            if (!entity) {
              throw new CrudNotFoundError();
            }
            return entity;
          });
      case 'create':
        await applyCrudValidation(route, options, payload);
        return service.create(payload.body, ctxPayload);
      case 'update':
        await applyCrudValidation(route, options, payload);
        return service.update(
          parseCrudId(payload.params?.id, options),
          payload.body,
          ctxPayload
        );
      case 'replace':
        await applyCrudValidation(route, options, payload);
        if (typeof service.replace === 'function') {
          return service.replace(
            parseCrudId(payload.params?.id, options),
            payload.body,
            ctxPayload
          );
        }
        return service.update(
          parseCrudId(payload.params?.id, options),
          payload.body,
          ctxPayload
        );
      case 'delete':
        return service.delete(
          parseCrudId(payload.params?.id, options),
          ctxPayload
        );
      default:
        throw new CrudConfigError(`Route "${route}" is not implemented`);
    }
  };
}

function getRequestBag(input: any) {
  if (!input) {
    return {};
  }
  const request = input.request ?? input.req ?? input;
  return {
    params: input.params ?? request.params ?? {},
    query: input.query ?? request.query ?? {},
    body: input.request?.body ?? input.body ?? request.body,
    ctx: input.requestContext
      ? input
      : request.requestContext
        ? request
        : undefined,
  };
}

/**
 * Creates a controller method compatible with Koa/Egg/Express handler calls.
 */
export function createCrudControllerMethod(
  route: CrudRouteName,
  options: CrudOptions
): (...args: any[]) => Promise<any> {
  return async function generatedCrudMethod(...args: any[]) {
    const payload = getRequestBag(args[0]);
    return createCrudRouteHandler(route, this, options)(payload);
  };
}
