import {
  Controller,
  CUSTOM_PARAM_INJECT_KEY,
  MetadataManager,
  MidwayWebRouterService,
  WEB_ROUTER_KEY,
} from '@midwayjs/core';
import {
  Crud,
  CrudNotFoundError,
  createCrudRouteHandler,
  buildCrudRoutes,
  getCrudOptions,
} from '../src';
import { CrudConfiguration } from '../src/configuration';
import { defineCrudRoutes } from '../src/functional';

class TestModel {}
class TestService {}
class CreateDto {}
class QueryDto {}
class ReplaceDto {}

describe('@midwayjs/crud core', () => {
  it('should save crud metadata on class decorators', () => {
    @Controller('/test')
    @Crud({
      model: TestModel,
      service: TestService as any,
    })
    class TestController {}

    const options = getCrudOptions(TestController);
    expect(options?.model).toBe(TestModel);
    expect(options?.service).toBe(TestService);
  });

  it('should build default routes', () => {
    const routes = buildCrudRoutes({
      model: TestModel,
      service: TestService as any,
    });

    expect(routes.map(route => route.name)).toEqual([
      'list',
      'detail',
      'create',
      'update',
      'delete',
    ]);
  });

  it('should create functional crud route maps', () => {
    const factory = defineCrudRoutes({
      model: TestModel,
      service: TestService as any,
    });

    const api = {
      get(path = '/') {
        return {
          method: 'GET',
          path,
          handle(fn: Function) {
            return { method: 'GET', path, handler: fn };
          },
        };
      },
      post(path = '/') {
        return {
          method: 'POST',
          path,
          handle(fn: Function) {
            return { method: 'POST', path, handler: fn };
          },
        };
      },
      patch(path = '/') {
        return {
          method: 'PATCH',
          path,
          handle(fn: Function) {
            return { method: 'PATCH', path, handler: fn };
          },
        };
      },
      put(path = '/') {
        return {
          method: 'PUT',
          path,
          handle(fn: Function) {
            return { method: 'PUT', path, handler: fn };
          },
        };
      },
      delete(path = '/') {
        return {
          method: 'DELETE',
          path,
          handle(fn: Function) {
            return { method: 'DELETE', path, handler: fn };
          },
        };
      },
    };

    const routeMap = factory(api as any);
    expect(Object.keys(routeMap)).toEqual([
      'list',
      'detail',
      'create',
      'update',
      'delete',
    ]);
  });

  it('should expand crud metadata into standard web router metadata on config load', async () => {
    @Controller('/users')
    @Crud({
      model: TestModel,
      service: TestService as any,
    })
    class RuntimeController {}

    const configuration = new CrudConfiguration();
    await configuration.onConfigLoad();

    const routes =
      MetadataManager.getOwnMetadata<any[]>(WEB_ROUTER_KEY, RuntimeController) || [];
    const listParams =
      MetadataManager.getOwnMetadata<any[]>(
        CUSTOM_PARAM_INJECT_KEY,
        RuntimeController,
        'list'
      ) || [];
    const createParams =
      MetadataManager.getOwnMetadata<any[]>(
        CUSTOM_PARAM_INJECT_KEY,
        RuntimeController,
        'create'
      ) || [];
    const swaggerMeta =
      MetadataManager.getOwnMetadata<any[]>(
        'swagger:method_metadata',
        RuntimeController,
        'create'
      ) || [];

    expect(routes.map(route => route.method)).toEqual([
      'list',
      'detail',
      'create',
      'update',
      'delete',
    ]);
    expect(typeof (RuntimeController.prototype as any).list).toBe('function');
    expect(typeof (RuntimeController.prototype as any).delete).toBe('function');
    expect(listParams.length).toBeGreaterThan(0);
    expect(createParams[0].metadata.type).toBe('body');
    expect(
      swaggerMeta.some(item => item.key === 'swagger/apiOperation')
    ).toBe(true);
  });

  it('should call validation service when DTO metadata is present', async () => {
    const validate = jest.fn();
    const handler = createCrudRouteHandler(
      'create',
      {
        crudService: {
          create: jest.fn().mockResolvedValue({ ok: true }),
        },
      },
      {
        model: TestModel,
        service: TestService as any,
        dto: {
          create: CreateDto as any,
          query: QueryDto as any,
        },
      }
    );

    await handler({
      body: { name: 'harry' },
      ctx: {
        requestContext: {
          getAsync: jest.fn().mockResolvedValue({
            validate,
          }),
        },
      },
    });

    expect(validate).toHaveBeenCalledWith(CreateDto, { name: 'harry' });
  });

  it('should convert missing detail resources into 404 errors', async () => {
    const handler = createCrudRouteHandler(
      'detail',
      {
        crudService: {
          findOne: jest.fn().mockResolvedValue(null),
        },
      },
      {
        model: TestModel,
        service: TestService as any,
      }
    );

    await expect(handler({ params: { id: '1' } })).rejects.toThrow(CrudNotFoundError);
  });

  it('should validate dto.replace on replace routes', async () => {
    const validate = jest.fn();
    const handler = createCrudRouteHandler(
      'replace',
      {
        crudService: {
          replace: jest.fn().mockResolvedValue({ ok: true }),
        },
      },
      {
        model: TestModel,
        service: TestService as any,
        dto: {
          replace: ReplaceDto as any,
        },
      }
    );

    await handler({
      params: { id: '1' },
      body: { name: 'trinity' },
      ctx: {
        requestContext: {
          getAsync: jest.fn().mockResolvedValue({
            validate,
          }),
        },
      },
    });

    expect(validate).toHaveBeenCalledWith(ReplaceDto, { name: 'trinity' });
  });

  it('should be consumable by MidwayWebRouterService', async () => {
    @Controller('/router-users')
    @Crud({
      model: TestModel,
      service: TestService as any,
    })
    class RouterController {}
    expect(RouterController).toBeDefined();

    const configuration = new CrudConfiguration();
    await configuration.onConfigLoad();

    const routerService = new MidwayWebRouterService();
    const manifest = await routerService.getRouteManifest();
    const currentControllerRoutes = manifest.filter(
      item => item.controllerId === 'routerController'
    );

    expect(currentControllerRoutes).toHaveLength(5);
    expect(
      currentControllerRoutes.map(item => `${item.method}:${item.path}`).sort()
    ).toEqual([
      'delete:/:id',
      'get:/',
      'get:/:id',
      'patch:/:id',
      'post:/',
    ]);
  });
});
