import {
  buildCrudRoutes,
  createCrudRouteHandler,
  CrudConfigError,
  CrudNotFoundError,
  getEnabledCrudRoutes,
} from '../src';
import { CRUD_SERVICE_KEY } from '../src/constants';
import {
  createCrudControllerMethod,
  getService,
  defaultRoutes
} from '../src/routeBuilder';

class TestModel {}
class TestService {}
class ReplaceDto {}

const baseOptions = {
  model: TestModel,
  service: TestService as any,
};

describe('route builder helpers', () => {
  it('should respect routes.only, routes.include and routes.exclude', () => {
    expect(
      getEnabledCrudRoutes({
        ...baseOptions,
        routes: {
          only: ['list', 'detail', 'replace'],
        },
      })
    ).toEqual(['list', 'detail', 'replace']);

    expect(
      getEnabledCrudRoutes({
        ...baseOptions,
        routes: {
          include: ['replace'],
        },
      })
    ).toEqual([ ...defaultRoutes, 'replace']);

    expect(
      getEnabledCrudRoutes({
        ...baseOptions,
        routes: {
          exclude: ['detail', 'delete'],
        },
      })
    ).toEqual(['list', 'create', 'update']);
  });

  it('should build route definitions including replace when enabled', () => {
    const routes = buildCrudRoutes({
      ...baseOptions,
      routes: {
        only: ['replace'],
      },
    });

    expect(routes).toEqual([
      {
        name: 'replace',
        method: 'PUT',
        path: '/:id',
      },
    ]);
  });

  it('should merge pre-defined routes when use routes.overrides', () => {
    const routes = buildCrudRoutes({
      ...baseOptions,
      routes: {
        mode: 'RESTful',
        overrides: {
          list: {
            path: '/list',
            method: 'POST'
          },
          delete: {
            enabled: false
          }
        }
      },
    });

    expect(routes?.length).toBe(defaultRoutes.length - 1);

    const route = routes?.find(m => m.name === 'list');
    expect(route).toEqual({
      name: 'list',
      method: 'POST',
      path: '/list',
    });
  });

  it('should respect routes.mode and build routes', () => {
    let routes = buildCrudRoutes({
      ...baseOptions,
      routes: {
        mode: 'RPC'
      },
    });

    expect(routes?.length).toBe(defaultRoutes.length);

    const route = routes?.find(m => m.name === 'list');
    expect(route).toEqual({
      name: 'list',
      method: 'GET',
      path: '/list',
    });

    routes = buildCrudRoutes({
      ...baseOptions,
      routes: {
        mode: 'CUSTOM',
        overrides: {
          create: {
            path: '/create',
            method: 'POST'
          },
          delete: {
            path: '/delete/:id',
            method: 'DELETE'
          }
        }
      },
    });

    expect(routes).toEqual([
      {
        name: 'create',
        method: 'POST',
        path: '/create',
      },
      {
        name: 'delete',
        method: 'DELETE',
        path: '/delete/:id',
      }
    ]);
  });

  it('should reject missing crudService bindings', async () => {
    const handler = createCrudRouteHandler('list', {}, baseOptions);
    await expect(handler({ query: {} })).rejects.toThrow(CrudConfigError);
  });

  it('should retrieve the CRUD service instance by prop name or type', async () => {
    const ctx = {
      requestContext: {
        getAsync: async (type) => {
          if (type === TestService) return new TestService();
          return null;
        }
      }
    };
    let controller: any = { testService: new TestService() };

    let service = await getService(controller, ctx, { ...baseOptions, service: 'testService' });
    expect(service).toBeTruthy();
    expect(controller[CRUD_SERVICE_KEY]).not.toBeTruthy();

    controller = { };
    service = await getService(controller, ctx, { ...baseOptions, service: TestService as any });
    expect(service).toBeTruthy();
    expect(controller[CRUD_SERVICE_KEY]).toBeTruthy();

    const res = getService({}, ctx, { ...baseOptions, service: 'testService' });
    await expect(res).rejects.toThrow(CrudConfigError);
  });

  it('should route replace to replace() and fallback to update()', async () => {
    const replace = jest.fn().mockResolvedValue({ ok: 'replace' });
    const replaceHandler = createCrudRouteHandler(
      'replace',
      {
        crudService: {
          replace,
        },
      },
      {
        ...baseOptions,
        dto: {
          replace: ReplaceDto as any,
        },
      }
    );
    await expect(
      replaceHandler({
        params: { id: '1' },
        body: { name: 'neo' },
      })
    ).resolves.toEqual({ ok: 'replace' });
    expect(replace).toHaveBeenCalledWith(1, { name: 'neo' }, { ctx: undefined });

    const update = jest.fn().mockResolvedValue({ ok: 'update' });
    const fallbackHandler = createCrudRouteHandler(
      'replace',
      {
        crudService: {
          update,
        },
      },
      baseOptions
    );
    await expect(
      fallbackHandler({
        params: { id: '2' },
        body: { name: 'trinity' },
      })
    ).resolves.toEqual({ ok: 'update' });
    expect(update).toHaveBeenCalledWith(2, { name: 'trinity' }, { ctx: undefined });
  });

  it('should normalize controller request bags for koa and express style inputs', async () => {
    const controller = {
      crudService: {
        create: jest.fn().mockResolvedValue({ ok: true }),
      },
    };
    const method = createCrudControllerMethod('create', baseOptions);

    await expect(
      method.call(controller, {
        request: {
          body: { name: 'koa' },
        },
        requestContext: {},
      })
    ).resolves.toEqual({ ok: true });

    await expect(
      method.call(controller, {
        req: {
          body: { name: 'express' },
        },
      })
    ).resolves.toEqual({ ok: true });

    const listMethod = createCrudControllerMethod('list', baseOptions);
    const listController = {
      crudService: {
        list: jest.fn().mockResolvedValue({ ok: 'list' }),
      },
    };
    await expect(listMethod.call(listController)).resolves.toEqual({ ok: 'list' });

    const deleteMethod = createCrudControllerMethod('delete', baseOptions);
    const deleteController = {
      crudService: {
        delete: jest.fn().mockResolvedValue(undefined),
      },
    };
    await expect(
      deleteMethod.call(deleteController, {
        request: {
          params: {
            id: '5',
          },
          query: {
            q: 'x',
          },
          body: { ok: true },
          requestContext: { id: 'ctx' },
        },
      })
    ).resolves.toBeUndefined();
    expect(deleteController.crudService.delete).toHaveBeenCalledWith(5, {
      ctx: {
        params: {
          id: '5',
        },
        query: {
          q: 'x',
        },
        body: { ok: true },
        requestContext: { id: 'ctx' },
      },
    });
  });

  it('should convert missing detail records to 404 and reject unsupported routes', async () => {
    const detail = createCrudRouteHandler(
      'detail',
      {
        crudService: {
          findOne: jest.fn().mockResolvedValue(null),
        },
      },
      baseOptions
    );
    await expect(detail({ params: { id: '1' } })).rejects.toThrow(CrudNotFoundError);

    const unsupported = createCrudRouteHandler(
      'createMany',
      {
        crudService: {},
      },
      baseOptions
    );
    await expect(unsupported()).rejects.toThrow('Route "createMany" is not implemented');
  });

  it('should route create, update and delete handlers through the service', async () => {
    const create = jest.fn().mockResolvedValue({ created: true });
    const update = jest.fn().mockResolvedValue({ updated: true });
    const remove = jest.fn().mockResolvedValue(undefined);

    await expect(
      createCrudRouteHandler(
        'create',
        {
          crudService: {
            create,
          },
        },
        baseOptions
      )({
        body: { name: 'neo' },
      })
    ).resolves.toEqual({ created: true });

    await expect(
      createCrudRouteHandler(
        'update',
        {
          crudService: {
            update,
          },
        },
        baseOptions
      )({
        params: { id: '3' },
        body: { name: 'trinity' },
      })
    ).resolves.toEqual({ updated: true });

    await expect(
      createCrudRouteHandler(
        'delete',
        {
          crudService: {
            delete: remove,
          },
        },
        baseOptions
      )({
        params: { id: '4' },
      })
    ).resolves.toBeUndefined();

    expect(create).toHaveBeenCalledWith({ name: 'neo' }, { ctx: undefined });
    expect(update).toHaveBeenCalledWith(3, { name: 'trinity' }, { ctx: undefined });
    expect(remove).toHaveBeenCalledWith(4, { ctx: undefined });
  });
});
