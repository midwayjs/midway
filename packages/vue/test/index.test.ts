import {
  createClient,
  createMidwayApiPlugin,
  useMidwayApiClient,
} from '../src';

describe('vue api bridge', () => {
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

  it('should install api client with vue plugin', () => {
    const client = {
      call: jest.fn(),
      has: jest.fn(),
      operationIds: jest.fn(),
    };
    const provide = jest.fn();

    const plugin = createMidwayApiPlugin(client as any);
    plugin.install?.({ provide } as any);

    expect(provide).toHaveBeenCalledTimes(1);
    expect(provide).toHaveBeenCalledWith(expect.any(Symbol), client);
  });

  it('should throw when composable is used without provider', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => useMidwayApiClient()).toThrow(
      'useMidwayApiClient must be used inside app.use(createMidwayApiPlugin(client)) or <MidwayApiProvider>'
    );
    warn.mockRestore();
  });
});
