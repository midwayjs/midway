import { CRUD_SERVICE_KEY } from './constants';
import { CrudConfigError, CrudNotFoundError } from './error';
import { CrudOptions, CrudRouteDefinition, CrudRouteName } from './interface';
import { parseCrudId, parseCrudQuery } from './queryParser';
import { applyCrudValidation } from './validation';

const REST_ROUTE_DEFINITIONS: Record<CrudRouteName, CrudRouteDefinition> = {
  list: { name: 'list', method: 'GET', path: '/' },
  detail: { name: 'detail', method: 'GET', path: '/:id' },
  create: { name: 'create', method: 'POST', path: '/' },
  update: { name: 'update', method: 'PATCH', path: '/:id' },
  replace: { name: 'replace', method: 'PUT', path: '/:id' },
  delete: { name: 'delete', method: 'DELETE', path: '/:id' },
  createMany: { name: 'createMany', method: 'POST', path: '/bulk' },
  deleteMany: { name: 'deleteMany', method: 'DELETE', path: '/bulk' },
};

const RPC_ROUTE_DEFINITIONS: Record<CrudRouteName, CrudRouteDefinition> = {
  list: { name: 'list', method: 'GET', path: '/list' },
  detail: { name: 'detail', method: 'GET', path: '/detail/:id' },
  create: { name: 'create', method: 'POST', path: '/create' },
  update: { name: 'update', method: 'POST', path: '/update/:id' },
  replace: { name: 'replace', method: 'POST', path: '/replace/:id' },
  delete: { name: 'delete', method: 'POST', path: '/delete/:id' },
  createMany: { name: 'createMany', method: 'POST', path: '/bulk/create' },
  deleteMany: { name: 'deleteMany', method: 'POST', path: '/bulk/delete' },
};

/**
 * Default enabled routes
 */
export const defaultRoutes: CrudRouteName[] = [
  'list',
  'detail',
  'create',
  'update',
  'delete',
];

/**
 * Returns enabled CRUD routes after applying only/include/exclude rules.
 */
export function getEnabledCrudRoutes({ routes }: CrudOptions): CrudRouteName[] {
  const include = routes?.include ?? [];
  const exclude = routes?.exclude ?? [];
  const source = new Set(
    routes?.mode === 'CUSTOM'
      ? []
      : (routes?.only ??
          [...defaultRoutes, ...include].filter(m => !exclude.includes(m)))
  );

  if (routes?.overrides) {
    for (const key in routes.overrides) {
      if (routes.overrides[key].enabled === false) {
        source.delete(key as CrudRouteName);
      } else {
        source.add(key as CrudRouteName);
      }
    }
  }

  return [...source];
}

/**
 * Builds the default route table for a CRUD resource.
 */
export function buildCrudRoutes(options: CrudOptions): CrudRouteDefinition[] {
  const mode = options.routes?.mode || 'RESTful';
  const overrides = options.routes?.overrides || {};
  return getEnabledCrudRoutes(options).map(name =>
    mode === 'CUSTOM'
      ? ({ name, ...overrides[name] } as CrudRouteDefinition)
      : mode === 'RPC'
        ? { ...RPC_ROUTE_DEFINITIONS[name], ...overrides[name] }
        : { ...REST_ROUTE_DEFINITIONS[name], ...overrides[name] }
  );
}

/**
 * Return the bound CRUD service
 */
export async function getService(
  controller: any,
  ctx: any,
  options: CrudOptions
) {
  const name =
    typeof options.service === 'string' ? options.service : CRUD_SERVICE_KEY;
  let service = controller[name];

  if (!service && typeof options.service === 'function') {
    const requestContext =
      ctx?.requestContext ?? (ctx?.request ?? ctx?.req)?.requestContext;
    if (requestContext) {
      service = controller[name] = await requestContext.getAsync?.(
        options.service,
        [options]
      );
    }
  }

  if (!service) {
    throw new CrudConfigError(`Controller is missing "${name}" binding`);
  }

  return service;
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
    const service = await getService(controllerInstance, payload.ctx, options);
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
