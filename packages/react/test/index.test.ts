import {
  MidwayApiProvider,
  createClient,
  createReactApiBridge,
  createReactApiClient,
  createReactApiClientFromOperations,
  resolveReactApiBridgeOptions,
  useMidwayApiClient,
} from '../src';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

describe('react api bridge', () => {
  it('should use http as default transport', () => {
    const options = resolveReactApiBridgeOptions();
    expect(options.transport).toBe('http');
  });

  it('should invoke adapter with operation and input', async () => {
    const adapter = jest.fn().mockResolvedValue({ id: '1' });
    const bridge = createReactApiBridge({
      adapter,
    });
    const result = await bridge.invoke(
      {
        operationId: 'getUser',
        method: 'get',
        path: '/:id',
        fullPath: '/users/:id',
      },
      { params: { id: '1' } }
    );
    expect(adapter).toHaveBeenCalledWith({
      operation: {
        operationId: 'getUser',
        method: 'get',
        path: '/:id',
        fullPath: '/users/:id',
      },
      input: { params: { id: '1' } },
    });
    expect(result).toEqual({ id: '1' });
  });

  it('should throw when adapter is missing', async () => {
    const oldFetch = (global as any).fetch;
    delete (global as any).fetch;
    const bridge = createReactApiBridge();
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

  it('should create react api client with shared bridge runtime', async () => {
    const adapter = jest.fn().mockResolvedValue({ id: '1' });
    const client = createReactApiClient(
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

  it('should create react api client from operations', async () => {
    const adapter = jest.fn().mockResolvedValue({ id: '2' });
    const client = createReactApiClientFromOperations(
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

  it('should provide api client by MidwayApiProvider', () => {
    const adapter = jest.fn().mockResolvedValue({ id: 'p-1' });
    const client = createReactApiClientFromOperations(
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
    function App() {
      const api = useMidwayApiClient();
      return createElement('div', null, api.has('getUser') ? 'yes' : 'no');
    }
    const html = renderToString(
      createElement(
        MidwayApiProvider,
        { client },
        createElement(App)
      )
    );
    expect(html).toContain('yes');
  });

  it('should throw when useMidwayApiClient used without provider', () => {
    function App() {
      useMidwayApiClient();
      return createElement('div', null, 'ok');
    }
    expect(() => renderToString(createElement(App))).toThrow(
      'useMidwayApiClient must be used inside <MidwayApiProvider />'
    );
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

  it('should provide namespaced api client by MidwayApiProvider', () => {
    const adapter = jest.fn().mockResolvedValue({ id: 'p-2' });
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
    const client = createClient(
      {
        user: userApi,
      },
      {
        basePath: '/api',
        adapter,
      }
    );
    function App() {
      const api = useMidwayApiClient();
      return createElement('div', null, api.has('user.getUser') ? 'yes' : 'no');
    }
    const html = renderToString(
      createElement(
        MidwayApiProvider,
        { client },
        createElement(App)
      )
    );
    expect(html).toContain('yes');
  });

  it('should use built-in http adapter when adapter is not provided', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ id: 'u-2', name: 'harry' }),
      text: async () => '',
    });
    const oldFetch = (global as any).fetch;
    (global as any).fetch = fetchMock;
    try {
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
      const api = createClient({
        user: userApi,
      }, {
        basePath: '/api',
      });
      const user = await api.user.getUser({
        params: { id: 'u-2' },
      });
      expect(user).toEqual({ id: 'u-2', name: 'harry' });
      expect(fetchMock).toHaveBeenCalledWith('/api/users/u-2', {
        method: 'GET',
        headers: {},
        body: undefined,
      });
    } finally {
      (global as any).fetch = oldFetch;
    }
  });
});
