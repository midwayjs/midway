import {
  createApiBridge,
  createClient,
  resolveApiBridgeOptions,
} from '../src';

describe('web bridge', () => {
  it('should use http as default transport', () => {
    const options = resolveApiBridgeOptions();
    expect(options.transport).toBe('http');
  });

  it('should create namespaced client as api.user.getUser style', async () => {
    const adapter = jest.fn().mockResolvedValue({ id: 'u-1' });
    const userApi = {
      __midwayApiMeta: {
        prefix: '/users',
      },
      getUser: {
        method: 'get',
        path: '/:id',
        options: {
          routerName: 'getUser',
        },
      },
    };

    const api = createClient(
      {
        user: userApi,
      },
      {
        basePath: '/api',
        adapter,
      }
    );

    const user = await api.user.getUser({
      params: { id: 'u-1' },
    });

    expect(user).toEqual({ id: 'u-1' });
  });

  it('should throw when adapter is missing', async () => {
    const oldFetch = (global as any).fetch;
    delete (global as any).fetch;
    const bridge = createApiBridge();

    await expect(
      bridge.invoke(
        {
          operationId: 'getUser',
          method: 'get',
          path: '/:id',
          fullPath: '/users/:id',
        },
        { params: { id: '1' } }
      )
    ).rejects.toThrow('API bridge adapter is required');

    (global as any).fetch = oldFetch;
  });
});
