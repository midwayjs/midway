import {
  buildCrudRoutes,
  createCrudRouteHandler,
  CrudConfigError,
  CrudNotFoundError,
  getEnabledCrudRoutes,
} from '../src';
import { createCrudControllerMethod } from '../src/routeBuilder';

class TestModel {}
class TestService {}
class ReplaceDto {}

const baseOptions = {
  model: TestModel,
  service: TestService as any,
};

describe('route builder helpers', () => {
  it('should respect routes.only and routes.exclude', () => {
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

  it('should reject missing crudService bindings', async () => {
    const handler = createCrudRouteHandler('list', {}, baseOptions);
    await expect(handler({ query: {} })).rejects.toThrow(CrudConfigError);
  });

  it('should pass controller CRUD options on the call without mutating the service', async () => {
    const setCrudOptions = jest.fn();
    const remove = jest.fn().mockResolvedValue(undefined);
    const options = {
      ...baseOptions,
      delete: {
        mode: 'soft' as const,
      },
    };
    const handler = createCrudRouteHandler(
      'delete',
      {
        crudService: {
          setCrudOptions,
          delete: remove,
        },
      },
      options
    );

    await handler({ params: { id: '1' } });

    expect(setCrudOptions).not.toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith(1, {
      ctx: undefined,
      crudOptions: options,
    });
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
    expect(replace).toHaveBeenCalledWith(1, { name: 'neo' }, {
      ctx: undefined,
      crudOptions: {
        ...baseOptions,
        dto: {
          replace: ReplaceDto as any,
        },
      },
    });

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
    expect(update).toHaveBeenCalledWith(2, { name: 'trinity' }, {
      ctx: undefined,
      crudOptions: baseOptions,
    });
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
      crudOptions: baseOptions,
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

    expect(create).toHaveBeenCalledWith({ name: 'neo' }, {
      ctx: undefined,
      crudOptions: baseOptions,
    });
    expect(update).toHaveBeenCalledWith(3, { name: 'trinity' }, {
      ctx: undefined,
      crudOptions: baseOptions,
    });
    expect(remove).toHaveBeenCalledWith(4, {
      ctx: undefined,
      crudOptions: baseOptions,
    });
  });

  it('should pass validation defaults to the CRUD service', async () => {
    const create = jest.fn().mockResolvedValue({ created: true });
    const validate = jest.fn().mockReturnValue({
      value: {
        name: 'neo',
        status: 'active',
      },
    });
    const handler = createCrudRouteHandler(
      'create',
      {
        crudService: {
          create,
        },
      },
      {
        ...baseOptions,
        dto: {
          create: class CreateDto {} as any,
        },
      }
    );

    await handler({
      body: { name: 'neo' },
      ctx: {
        requestContext: {
          getAsync: jest.fn().mockResolvedValue({ validate }),
        },
      },
    });

    expect(create).toHaveBeenCalledWith(
      { name: 'neo', status: 'active' },
      expect.any(Object)
    );
  });

  it('should keep service options when the controller omits them', async () => {
    const stored = {
      ...baseOptions,
      delete: {
        mode: 'soft' as const,
      },
      query: {
        searchable: ['name'],
        sortable: ['id'],
      },
    };
    const list = jest.fn().mockResolvedValue({ data: [] });
    const handler = createCrudRouteHandler(
      'list',
      {
        crudService: {
          getCrudOptions: () => stored,
          setCrudOptions: jest.fn(),
          list,
        },
      },
      {
        ...baseOptions,
        query: {
          maxLimit: 5,
        },
      }
    );

    await handler({
      query: {
        search: 'neo',
        sort: 'id:DESC',
        limit: '100',
      },
    });

    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'neo',
        limit: 5,
        sort: [{ field: 'id', order: 'DESC' }],
      }),
      expect.objectContaining({
        crudOptions: expect.objectContaining({
          delete: { mode: 'soft' },
          query: {
            searchable: ['name'],
            sortable: ['id'],
            maxLimit: 5,
          },
        }),
      })
    );
    expect(stored.delete).toEqual({ mode: 'soft' });
  });

  it('should keep each controller options when calls overlap on one service', async () => {
    const serviceOptions = {
      ...baseOptions,
      delete: {
        mode: 'soft' as const,
      },
    };
    const service = {
      getCrudOptions: () => serviceOptions,
      setCrudOptions: jest.fn(),
      async delete(_id: number, ctx: { crudOptions?: { delete?: { mode?: string } } }) {
        await new Promise(resolve => setTimeout(resolve, 20));
        return ctx.crudOptions?.delete?.mode;
      },
    };
    const soft = createCrudRouteHandler(
      'delete',
      { crudService: service },
      {
        ...baseOptions,
        delete: { mode: 'soft' as const },
      }
    );
    const hard = createCrudRouteHandler(
      'delete',
      { crudService: service },
      {
        ...baseOptions,
        delete: { mode: 'hard' as const },
      }
    );
    const inherited = createCrudRouteHandler(
      'delete',
      { crudService: service },
      baseOptions
    );

    const [softMode, hardMode, inheritedMode] = await Promise.all([
      soft({ params: { id: '1' } }),
      hard({ params: { id: '2' } }),
      inherited({ params: { id: '3' } }),
    ]);

    expect(softMode).toBe('soft');
    expect(hardMode).toBe('hard');
    expect(inheritedMode).toBe('soft');
    expect(service.setCrudOptions).not.toHaveBeenCalled();
    expect(service.getCrudOptions()).toBe(serviceOptions);
  });
});
