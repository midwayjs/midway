import { devPlugin } from '../src/vite';

describe('mock vite devPlugin', () => {
  it('should throw without appDir', () => {
    expect(() => devPlugin({} as any)).toThrow(/requires "appDir"/i);
  });

  it('should ignore fallback temp files in watcher', async () => {
    const watcherHandlers = new Map<string, (...args: any[]) => any>();
    const info = jest.fn();
    const server: any = {
      config: {
        logger: {
          info,
        },
      },
      httpServer: {
        once: jest.fn(),
      },
      watcher: {
        on: jest.fn((event: string, handler: (...args: any[]) => any) => {
          watcherHandlers.set(event, handler);
        }),
      },
      middlewares: {
        use: jest.fn(),
      },
      moduleGraph: {
        getModuleById: jest.fn(),
        invalidateModule: jest.fn(),
      },
      ws: {
        send: jest.fn(),
      },
    };

    const plugin = devPlugin({
      appDir: process.cwd(),
      baseDir: 'src/server',
      basePath: '/api',
    });

    await plugin.configureServer(server);

    const allHandler = watcherHandlers.get('all');
    expect(typeof allHandler).toBe('function');

    await allHandler?.(
      'change',
      `${process.cwd()}/src/server/.midway-esm-fallback-abc/hash.mjs`
    );
    expect(info).not.toHaveBeenCalled();

    await allHandler?.('change', `${process.cwd()}/src/server/user.ts`);
    expect(info).toHaveBeenCalledWith(
      expect.stringContaining('reload midway app')
    );
  });
});
