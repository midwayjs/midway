import {
  createClient,
  createNextjsApiClient,
  createNextjsApiClientFromOperations,
  resolveNextjsApiBridgeOptions,
} from '../src/bridge';

describe('nextjs bridge options', () => {
  it('should use http transport as default', () => {
    const result = resolveNextjsApiBridgeOptions();
    expect(result.transport).toBe('http');
    expect(result.adapter).toBeUndefined();
  });

  it('should keep custom transport and adapter', async () => {
    const adapter = jest.fn().mockResolvedValue({ ok: true });
    const result = resolveNextjsApiBridgeOptions({
      transport: 'trpc',
      adapter,
    });
    expect(result.transport).toBe('trpc');
    expect(result.adapter).toBe(adapter);
  });

  it('should create nextjs api client by shared bridge runtime', async () => {
    const adapter = jest.fn().mockResolvedValue({ id: '1' });
    const client = createNextjsApiClient(
      {
        operations: {
          getUser: {
            operationId: 'getUser',
            method: 'get',
            path: '/:id',
            fullPath: '/users/:id',
          },
        },
      },
      { adapter }
    );
    const result = await client.call('getUser', { params: { id: '1' } });
    expect(result).toEqual({ id: '1' });
  });

  it('should create nextjs api client from operations', async () => {
    const adapter = jest.fn().mockResolvedValue({ id: '2' });
    const client = createNextjsApiClientFromOperations(
      [
        {
          operationId: 'getUser',
          method: 'get',
          path: '/:id',
          fullPath: '/users/:id',
        },
      ],
      { adapter }
    );
    const result = await client.call('getUser', { params: { id: '2' } });
    expect(result).toEqual({ id: '2' });
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
});
