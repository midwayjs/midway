import {
  MidwayWebRouterService,
  RouterInfo,
} from '@midwayjs/core';
import { userApi } from './fixtures/full-flow/src/server/api/user.api';
import { createApiClient } from './fixtures/full-flow/src/web/api/client';

function createInMemoryAdapter(routes: RouterInfo[]) {
  return async ({ operation, input }) => {
    let route = routes.find(item => {
      return (
        item.fullUrl === operation.fullPath &&
        item.requestMethod.toLowerCase() === operation.method.toLowerCase()
      );
    });
    if (!route && operation.fullPath.startsWith('/api/')) {
      const fallbackPath = operation.fullPath.replace(/^\/api/, '');
      route = routes.find(item => {
        return (
          item.fullUrl === fallbackPath &&
          item.requestMethod.toLowerCase() === operation.method.toLowerCase()
        );
      });
    }
    if (!route) {
      throw new Error(
        `Route not found for ${operation.method.toUpperCase()} ${operation.fullPath}`
      );
    }
    const controller = new (route.controllerClz as any)();
    return controller[route.method as string]({
      params: input?.params,
      query: input?.query,
      headers: input?.headers,
      request: {
        body: input?.body,
        headers: input?.headers,
      },
    });
  };
}

describe('nextjs bridge e2e', () => {
  it('should call functional api handlers via manifest operations', async () => {
    expect(userApi).toBeDefined();

    const routerService = new MidwayWebRouterService({
      globalPrefix: 'api',
    });
    const routes = await routerService.getFlattenRouterTable();
    const runInMemory = createInMemoryAdapter(routes);
    const adapter = jest.fn(req => runInMemory(req));
    const api = createApiClient(adapter);

    const user = await api.user.getUser({
      params: { id: 'u-1' },
    });
    expect(user).toEqual({
      id: 'u-1',
      name: 'harry',
    });

    const created = await api.user.createUser({
      body: { name: 'new-user' },
    });
    expect(created).toEqual({
      id: 'u-created',
      name: 'new-user',
    });

    const list = await api.order.list({
      query: { status: 'paid' },
      headers: { 'x-trace-id': 'trace-1' },
    });
    expect(list).toEqual({
      status: 'paid',
      traceId: 'trace-1',
    });

    const item = await api.order.createItem({
      params: { id: 'o-1' },
      body: { sku: 'sku-1' },
    });
    expect(item).toEqual({
      id: 'o-1',
      sku: 'sku-1',
    });

    expect(adapter).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: expect.objectContaining({
          operationId: 'order.list',
          fullPath: '/api/orders',
        }),
      })
    );

    const health = await api.system.health({});
    expect(health).toEqual({ ok: true });

    const publicInfo = await api.system.publicInfo({});
    expect(publicInfo).toEqual({ scope: 'public' });

    const account = await api.account.getAccount({
      params: { id: 'a-1' },
    });
    expect(account).toEqual({
      id: 'a-1',
      role: 'member',
    });

    expect(adapter).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: expect.objectContaining({
          operationId: 'system.health',
          fullPath: '/system/health',
        }),
      })
    );

    expect(adapter).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: expect.objectContaining({
          operationId: 'system.publicInfo',
          fullPath: '/api/system/public',
        }),
      })
    );

    expect(adapter).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: expect.objectContaining({
          operationId: 'account.getAccount',
          fullPath: '/api/v2/accounts/:id',
        }),
      })
    );

    const profile = await api.profile.getProfile({
      params: { id: 'p-1' },
      headers: { 'x-locale': 'zh-CN' },
    });
    expect(profile).toEqual({
      id: 'p-1',
      locale: 'zh-CN',
    });

    expect(adapter).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: expect.objectContaining({
          operationId: 'profile.getProfile',
          fullPath: '/api/profiles/:id',
        }),
      })
    );
  });
});
