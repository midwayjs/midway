import {
  Configuration,
  CONTROLLER_KEY,
  ControllerOption,
  CUSTOM_PARAM_INJECT_KEY,
  DecoratorManager,
  MetadataManager,
  RouteParamTypes,
  RouterOption,
  WEB_ROUTER_PARAM_KEY,
  WEB_ROUTER_KEY,
} from '@midwayjs/core';
import { CRUD_KEY } from './constants';
import { getCrudOptions } from './decorator';
import { CrudConfigError } from './error';
import { CrudRouteName } from './interface';
import {
  buildCrudRoutes,
  createCrudControllerMethod,
  getEnabledCrudRoutes,
} from './routeBuilder';
import { attachCrudSwaggerMetadata } from './swagger';

function ensureControllerMetadata(target: any): ControllerOption {
  const controllerOption = MetadataManager.getOwnMetadata<ControllerOption>(
    CONTROLLER_KEY,
    target
  );
  if (!controllerOption) {
    throw new CrudConfigError(
      `@Crud() requires ${target.name} to also declare @Controller()`
    );
  }
  return controllerOption;
}

function ensureRouteMetadata(target: any) {
  const options = getCrudOptions(target)!;
  const existingRoutes =
    MetadataManager.getOwnMetadata<RouterOption[]>(WEB_ROUTER_KEY, target) ||
    [];
  const existingKeys = new Set(
    existingRoutes.map(route => String(route.method))
  );
  const routeNamePrefix = `${target.name || 'crud'}_`;

  for (const route of buildCrudRoutes(options)) {
    if (existingKeys.has(route.name)) {
      continue;
    }
    MetadataManager.attachMetadata(
      WEB_ROUTER_KEY,
      {
        path: route.path,
        requestMethod: route.method.toLowerCase(),
        routerName: `${routeNamePrefix}${route.name}`,
        method: route.name,
        middleware: [],
        summary: '',
        description: '',
        ignoreGlobalPrefix: false,
      } as RouterOption,
      target
    );
  }
}

function ensurePrototypeMethods(target: any, enabledRoutes: CrudRouteName[]) {
  const options = getCrudOptions(target)!;
  const proto = target.prototype;
  for (const route of enabledRoutes) {
    if (typeof proto[route] === 'function') {
      continue;
    }
    Object.defineProperty(proto, route, {
      value: createCrudControllerMethod(route, options),
      writable: true,
      configurable: true,
    });
  }
}

function attachSwaggerParamMeta(
  target: any,
  methodName: string,
  parameterIndex: number,
  type: RouteParamTypes,
  propertyData?: string
) {
  MetadataManager.attachMetadata(
    CUSTOM_PARAM_INJECT_KEY,
    {
      key: WEB_ROUTER_PARAM_KEY,
      parameterIndex,
      propertyName: methodName,
      metadata: {
        type,
        propertyData,
      },
      options: {
        impl: false,
      },
    },
    target,
    methodName
  );
}

function ensureParamMetadata(target: any, enabledRoutes: CrudRouteName[]) {
  const options = getCrudOptions(target)!;
  const proto = target.prototype;

  for (const route of enabledRoutes) {
    const existing =
      MetadataManager.getOwnMetadata<any[]>(
        CUSTOM_PARAM_INJECT_KEY,
        target,
        route
      ) || [];
    if (existing.length) {
      continue;
    }

    switch (route) {
      case 'list': {
        const paramTypes: any[] = [];
        if (options.dto?.query) {
          paramTypes.push(options.dto.query);
          attachSwaggerParamMeta(target, route, 0, RouteParamTypes.QUERY);
        } else {
          const queryFields = [
            ['page', Number],
            ['limit', Number],
            ['sort', String],
            ['filter', String],
            ['search', String],
            ['join', String],
            ['fields', String],
          ] as const;
          queryFields.forEach(([name, designType], index) => {
            paramTypes[index] = designType;
            attachSwaggerParamMeta(
              target,
              route,
              index,
              RouteParamTypes.QUERY,
              name
            );
          });
        }
        Reflect.defineMetadata('design:paramtypes', paramTypes, proto, route);
        break;
      }
      case 'detail':
      case 'delete': {
        Reflect.defineMetadata('design:paramtypes', [String], proto, route);
        attachSwaggerParamMeta(
          target,
          route,
          0,
          RouteParamTypes.PARAM,
          options.id || 'id'
        );
        break;
      }
      case 'create': {
        const bodyType = options.dto?.create ?? Object;
        Reflect.defineMetadata('design:paramtypes', [bodyType], proto, route);
        attachSwaggerParamMeta(target, route, 0, RouteParamTypes.BODY);
        break;
      }
      case 'update': {
        const bodyType = options.dto?.update ?? Object;
        Reflect.defineMetadata(
          'design:paramtypes',
          [String, bodyType],
          proto,
          route
        );
        attachSwaggerParamMeta(
          target,
          route,
          0,
          RouteParamTypes.PARAM,
          options.id || 'id'
        );
        attachSwaggerParamMeta(target, route, 1, RouteParamTypes.BODY);
        break;
      }
      case 'replace': {
        const bodyType = options.dto?.replace ?? options.dto?.update ?? Object;
        Reflect.defineMetadata(
          'design:paramtypes',
          [String, bodyType],
          proto,
          route
        );
        attachSwaggerParamMeta(
          target,
          route,
          0,
          RouteParamTypes.PARAM,
          options.id || 'id'
        );
        attachSwaggerParamMeta(target, route, 1, RouteParamTypes.BODY);
        break;
      }
    }
  }
}

function ensureSwaggerMetadata(target: any, enabledRoutes: CrudRouteName[]) {
  const options = getCrudOptions(target)!;
  for (const route of enabledRoutes) {
    attachCrudSwaggerMetadata(target, route, options);
  }
}

/**
 * Registers CRUD metadata into the existing web routing metadata pipeline.
 */
@Configuration({
  namespace: 'crud',
})
export class CrudConfiguration {
  async onConfigLoad() {
    const crudModules = DecoratorManager.listModule(CRUD_KEY);
    for (const module of crudModules) {
      ensureControllerMetadata(module);
      const enabledRoutes = getEnabledCrudRoutes(getCrudOptions(module)!);
      ensurePrototypeMethods(module, enabledRoutes);
      ensureRouteMetadata(module);
      ensureParamMetadata(module, enabledRoutes);
      ensureSwaggerMetadata(module, enabledRoutes);
    }
  }
}
