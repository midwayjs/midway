import {
  createClient,
  createApiBridge,
  createApiClientDefinition,
  createApiClient,
  createOperationsFromManifest,
  createAxiosAdapter,
  resolveApiBridgeOptions,
} from '../src';

describe('api bridge', () => {
  it('should use http as default transport', () => {
    const options = resolveApiBridgeOptions();
    expect(options.transport).toBe('http');
  });

  it('should invoke configured adapter', async () => {
    const adapter = jest.fn().mockResolvedValue({ id: '1' });
    const bridge = createApiBridge({ adapter });
    const result = await bridge.invoke(
      {
        operationId: 'getUser',
        method: 'get',
        path: '/:id',
        fullPath: '/users/:id',
      },
      { params: { id: '1' } }
    );
    expect(adapter).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: '1' });
  });

  it('should throw when adapter is missing', async () => {
    const originalFetch = (globalThis as any).fetch;
    delete (globalThis as any).fetch;
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
    (globalThis as any).fetch = originalFetch;
  });

  it('should use default fetch adapter when adapter is missing', async () => {
    const originalFetch = (globalThis as any).fetch;
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ id: 'u-1', name: 'harry' }),
      text: async () => '',
    });
    (globalThis as any).fetch = fetchMock;

    const bridge = createApiBridge();
    const result = await bridge.invoke(
      {
        operationId: 'getUser',
        method: 'get',
        path: '/:id',
        fullPath: '/users/:id',
      },
      {
        params: { id: 'u-1' },
        query: { expand: 'profile', tags: ['a', 'b'] },
      }
    );

    expect(fetchMock).toHaveBeenCalledWith('/users/u-1?expand=profile&tags=a&tags=b', {
      method: 'GET',
      headers: {},
      body: undefined,
    });
    expect(result).toEqual({ id: 'u-1', name: 'harry' });
    (globalThis as any).fetch = originalFetch;
  });

  it('should create axios adapter and call axios instance', async () => {
    const request = jest.fn().mockResolvedValue({
      status: 200,
      data: { id: 'u-1', name: 'harry' },
    });
    const adapter = createAxiosAdapter({ request });
    const bridge = createApiBridge({ adapter });
    const result = await bridge.invoke(
      {
        operationId: 'getUser',
        method: 'get',
        path: '/:id',
        fullPath: '/users/:id',
      },
      {
        params: { id: 'u-1' },
        query: { expand: 'profile' },
        headers: { authorization: 'token' },
      }
    );
    expect(request).toHaveBeenCalledWith({
      url: '/users/u-1?expand=profile',
      method: 'GET',
      headers: { authorization: 'token' },
      data: undefined,
    });
    expect(result).toEqual({ id: 'u-1', name: 'harry' });
  });

  it('should throw axios adapter error with status and detail', async () => {
    const request = jest.fn().mockRejectedValue({
      response: {
        status: 422,
        data: { code: 'INVALID_INPUT' },
      },
    });
    const adapter = createAxiosAdapter({ request });
    const bridge = createApiBridge({ adapter });

    await expect(
      bridge.invoke(
        {
          operationId: 'createUser',
          method: 'post',
          path: '/',
          fullPath: '/users',
        },
        {
          body: { name: '' },
        }
      )
    ).rejects.toThrow(
      'API request failed: POST /users (422) {"code":"INVALID_INPUT"}'
    );
  });

  it('should create client and call operation by operationId', async () => {
    const adapter = jest.fn().mockResolvedValue({ ok: true });
    const client = createApiClient(
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
    expect(client.has('getUser')).toBe(true);
    expect(client.operationIds()).toEqual(['getUser']);
    expect(adapter).toHaveBeenCalledWith({
      operation: {
        operationId: 'getUser',
        method: 'get',
        path: '/:id',
        fullPath: '/users/:id',
      },
      input: { params: { id: '1' } },
    });
    expect(result).toEqual({ ok: true });
  });

  it('should throw when operationId is unknown', async () => {
    const adapter = jest.fn();
    const client = createApiClient(
      {
        operations: {},
      },
      { adapter }
    );
    await expect(client.call('missingOp', {})).rejects.toThrow(
      'Unknown API operation "missingOp"'
    );
  });

  it('should build definition from operations list', () => {
    const definition = createApiClientDefinition([
      {
        operationId: 'getUser',
        method: 'get',
        path: '/:id',
        fullPath: '/users/:id',
      },
    ]);
    expect(Object.keys(definition.operations)).toEqual(['getUser']);
  });

  it('should throw for duplicate operationId in operations list', () => {
    expect(() =>
      createApiClientDefinition([
        {
          operationId: 'getUser',
          method: 'get',
          path: '/:id',
          fullPath: '/users/:id',
        },
        {
          operationId: 'getUser',
          method: 'post',
          path: '/',
          fullPath: '/users',
        },
      ])
    ).toThrow('Duplicate API operationId "getUser"');
  });

  it('should create operations from route manifest items', () => {
    const operations = createOperationsFromManifest([
      {
        operationId: 'getUser',
        method: 'get',
        path: '/:id',
        fullPath: '/users/:id',
      },
    ]);
    expect(operations).toEqual([
      {
        operationId: 'getUser',
        method: 'get',
        path: '/:id',
        fullPath: '/users/:id',
      },
    ]);
  });

  it('should create namespaced client from api modules', async () => {
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
      createUser: {
        method: 'post',
        path: '/',
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
    expect(adapter).toHaveBeenCalledWith({
      operation: {
        operationId: 'user.getUser',
        method: 'get',
        path: '/:id',
        fullPath: '/api/users/:id',
      },
      input: {
        params: { id: 'u-1' },
      },
    });

    await api.user.createUser({
      body: { name: 'new-user' },
    });
    expect(adapter).toHaveBeenCalledWith({
      operation: {
        operationId: 'user.createUser',
        method: 'post',
        path: '/',
        fullPath: '/api/users',
      },
      input: {
        body: { name: 'new-user' },
      },
    });

    const byCall = await api.call('user.getUser', {
      params: { id: 'u-1' },
    });
    expect(byCall).toEqual({ id: 'u-1' });
    expect(api.has('user.getUser')).toBe(true);
    expect(api.operationIds()).toEqual(
      expect.arrayContaining(['user.getUser', 'user.createUser'])
    );
  });

  it('should create manifest-based call client', async () => {
    const adapter = jest.fn().mockResolvedValue({ id: 'u-2' });
    const api = createClient({
      manifest: [
        {
          operationId: 'getUser',
          method: 'get',
          path: '/:id',
          fullPath: '/api/users/:id',
        },
      ],
      adapter,
    });

    const user = await api.call('getUser', {
      params: { id: 'u-2' },
    });
    expect(user).toEqual({ id: 'u-2' });
    await expect(api.has('getUser')).resolves.toBe(true);
    await expect(api.operationIds()).resolves.toEqual(['getUser']);
  });

  it('should route module method calls via manifest when manifest is provided', async () => {
    const adapter = jest.fn().mockResolvedValue({ id: 'u-3' });
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
        manifest: [
          {
            operationId: 'getUser',
            method: 'get',
            path: '/:id',
            fullPath: '/api/users/:id',
          },
        ],
        adapter,
      }
    );

    await api.user.getUser({
      params: { id: 'u-3' },
    });

    expect(adapter).toHaveBeenCalledWith({
      operation: {
        operationId: 'getUser',
        method: 'get',
        path: '/:id',
        fullPath: '/api/users/:id',
      },
      input: {
        params: { id: 'u-3' },
      },
    });
  });

  it('should respect ignoreGlobalPrefix and URI version prefix when creating fullPath', async () => {
    const adapter = jest.fn().mockResolvedValue({ ok: true });
    const mixedApi = {
      __midwayApiMeta: {
        prefix: '/system',
        ignoreGlobalPrefix: true,
      },
      health: {
        method: 'get',
        path: '/health',
      },
      publicInfo: {
        method: 'get',
        path: '/public',
        options: {
          ignoreGlobalPrefix: false,
        },
      },
    };
    const accountApi = {
      __midwayApiMeta: {
        prefix: '/accounts',
        version: '2',
        versionType: 'URI' as const,
        versionPrefix: 'v',
      },
      getAccount: {
        method: 'get',
        path: '/:id',
      },
    };

    const api = createClient(
      {
        system: mixedApi,
        account: accountApi,
      },
      {
        basePath: '/api',
        adapter,
      }
    );

    await api.system.health({});
    expect(adapter).toHaveBeenCalledWith({
      operation: {
        operationId: 'system.health',
        method: 'get',
        path: '/health',
        fullPath: '/system/health',
      },
      input: {},
    });

    await api.system.publicInfo({});
    expect(adapter).toHaveBeenCalledWith({
      operation: {
        operationId: 'system.publicInfo',
        method: 'get',
        path: '/public',
        fullPath: '/api/system/public',
      },
      input: {},
    });

    await api.account.getAccount({
      params: { id: 'a-1' },
    });
    expect(adapter).toHaveBeenCalledWith({
      operation: {
        operationId: 'account.getAccount',
        method: 'get',
        path: '/:id',
        fullPath: '/api/v2/accounts/:id',
      },
      input: {
        params: { id: 'a-1' },
      },
    });
  });

  it('should not add version segment to fullPath when versionType is HEADER', async () => {
    const adapter = jest.fn().mockResolvedValue({ ok: true });
    const profileApi = {
      __midwayApiMeta: {
        prefix: '/profiles',
        version: '7',
        versionType: 'HEADER' as const,
        versionPrefix: 'v',
      },
      getProfile: {
        method: 'get',
        path: '/:id',
      },
    };
    const api = createClient(
      {
        profile: profileApi,
      },
      {
        basePath: '/api',
        adapter,
      }
    );
    await api.profile.getProfile({
      params: { id: 'p-1' },
    });
    expect(adapter).toHaveBeenCalledWith({
      operation: {
        operationId: 'profile.getProfile',
        method: 'get',
        path: '/:id',
        fullPath: '/api/profiles/:id',
      },
      input: {
        params: { id: 'p-1' },
      },
    });
  });

  it('should resolve server basePath from runtime basePath object', async () => {
    const adapter = jest.fn().mockResolvedValue({ ok: true });
    const userApi = {
      __midwayApiMeta: {
        prefix: '/users',
      },
      getUser: {
        method: 'get',
        path: '/:id',
      },
    };

    const api = createClient(
      {
        user: userApi,
      },
      {
        basePath: {
          browser: '/api-browser',
          server: 'http://127.0.0.1:7001/api',
        },
        adapter,
      }
    );

    await api.user.getUser({
      params: { id: 'u-1' },
    });
    expect(adapter).toHaveBeenCalledWith({
      operation: {
        operationId: 'user.getUser',
        method: 'get',
        path: '/:id',
        fullPath: 'http://127.0.0.1:7001/api/users/:id',
      },
      input: {
        params: { id: 'u-1' },
      },
    });
  });

  it('should resolve browser basePath from runtime basePath object', async () => {
    const adapter = jest.fn().mockResolvedValue({ ok: true });
    const userApi = {
      __midwayApiMeta: {
        prefix: '/users',
      },
      getUser: {
        method: 'get',
        path: '/:id',
      },
    };

    (globalThis as any).window = {
      document: {},
    };

    try {
      const api = createClient(
        {
          user: userApi,
        },
        {
          basePath: {
            browser: '/api-browser',
            server: '/api-server',
          },
          adapter,
        }
      );

      await api.user.getUser({
        params: { id: 'u-1' },
      });
      expect(adapter).toHaveBeenCalledWith({
        operation: {
          operationId: 'user.getUser',
          method: 'get',
          path: '/:id',
          fullPath: '/api-browser/users/:id',
        },
        input: {
          params: { id: 'u-1' },
        },
      });
    } finally {
      delete (globalThis as any).window;
    }
  });
});
