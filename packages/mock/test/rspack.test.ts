import { devPlugin } from '../src/rspack';

describe('mock rspack devPlugin', () => {
  it('should throw without appDir', () => {
    expect(() => devPlugin({} as any)).toThrow(/requires "appDir"/i);
  });

  it('should inject setupMiddlewares on apply', () => {
    const invalidTaps: Array<(fileName?: string) => void> = [];
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
        info: jest.fn(),
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
  });
});
