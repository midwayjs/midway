import { devPlugin } from '../src/rspack';

describe('mock rspack devPlugin', () => {
  it('should throw without appDir', () => {
    expect(() => devPlugin({} as any)).toThrow(/requires "appDir"/i);
  });

  it('should inject setupMiddlewares on apply', () => {
    const invalidTaps: Array<(fileName?: string) => void> = [];
    const info = jest.fn();
    const compiler: any = {
      options: {
        devServer: {},
      },
      hooks: {
        invalid: {
          tap: (_name: string, fn: (fileName?: string) => void) => {
            invalidTaps.push(fn);
          },
        },
      },
      getInfrastructureLogger: () => ({
        info,
        error: jest.fn(),
      }),
    };

    const plugin = devPlugin({
      appDir: process.cwd(),
      baseDir: 'src/server',
      basePath: '/api',
    });

    plugin.apply(compiler);

    expect(invalidTaps.length).toBe(1);
    expect(typeof compiler.options.devServer.setupMiddlewares).toBe('function');

    const middlewares: any[] = [];
    const result = compiler.options.devServer.setupMiddlewares(middlewares, {});
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(typeof result[0]).toBe('function');

    invalidTaps[0](
      `${process.cwd()}/src/server/.midway-esm-fallback-abc/hash.mjs`
    );
    expect(info).not.toHaveBeenCalled();

    invalidTaps[0](`${process.cwd()}/src/server/user.ts`);
    expect(info).toHaveBeenCalledWith(
      expect.stringContaining('reload midway app')
    );
  });
});
